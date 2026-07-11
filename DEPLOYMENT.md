# LoveParcel — AWS EC2 Deployment Guide
## Docker + Nginx + GitHub Actions CI/CD

> **Stack**: Next.js 16 frontend · Express/Prisma backend · MongoDB Atlas · AWS EC2 · Amazon ECR · GitHub Actions · Nginx · Let's Encrypt SSL

---

## Architecture Overview

```
Internet
   |
   |  HTTP/HTTPS
   ▼
┌──────────────────────────────────────────────┐
│              AWS EC2 Instance                 │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  Nginx (port 80 / 443)              │    │
│  │  yourdomain.com     → Frontend:3000 │    │
│  │  api.yourdomain.com → Backend:5000  │    │
│  └────────┬──────────────────┬─────────┘    │
│           │                  │               │
│  ┌────────▼──┐      ┌───────▼──────┐        │
│  │ Frontend  │      │   Backend    │        │
│  │ Next.js   │      │  Express +   │        │
│  │ :3000     │      │  Prisma :5000│        │
│  └───────────┘      └──────────────┘        │
└──────────────────────────────────────────────┘
        │                    │
   MongoDB Atlas          Cloudinary / Redis / SMTP
```

**CI/CD Flow:**
```
git push main
    ↓
GitHub Actions
    ↓ lint + type check
    ↓ build Docker images
    ↓ push to Amazon ECR
    ↓ SSH into EC2
    ↓ docker pull + docker compose up
    ↓ health check verify
```

---

## Files Created / Modified

```
loveparcel/
├── .github/
│   └── workflows/
│       └── deploy.yml           ← CI/CD pipeline (GitHub Actions)
├── backend/
│   ├── Dockerfile               ← Multi-stage production image
│   ├── .dockerignore
│   └── src/app.js               ← Added /health endpoint
├── frontend/
│   ├── Dockerfile               ← Multi-stage production image
│   ├── .dockerignore
│   └── next.config.ts           ← Added output: standalone
├── nginx/
│   └── nginx.conf               ← Nginx reverse proxy config
├── docker-compose.yml           ← Local dev/testing
└── docker-compose.prod.yml      ← EC2 production (pulls from ECR)
```

---

## PART 1 — One-Time AWS Setup (Do This First)

### Step 1.1 — Create an AWS Account

1. Go to https://aws.amazon.com and click **Create an AWS Account**
2. Enter email, password, account name
3. Add a credit card (you won't be charged for free tier usage)
4. Choose **Basic Support (Free)**
5. After signup, sign in to the **AWS Management Console**: https://console.aws.amazon.com

---

### Step 1.2 — Create an IAM User (Don't use root account!)

1. In the AWS Console, search for **IAM** → click it
2. Click **Users** in the left sidebar → **Add users**
3. Username: `loveparcel-deploy`
4. Click **Next** → Select **Attach policies directly**
5. Search and attach these policies:
   - `AmazonEC2FullAccess`
   - `AmazonECRFullAccess`
   - `IAMReadOnlyAccess`
6. Click **Create user**
7. Click on the user → **Security credentials** tab → **Create access key**
8. Choose **Command Line Interface (CLI)**
9. **Download the CSV file** — you'll need the Access Key ID and Secret

---

### Step 1.3 — Install Required Tools on Your Computer

**Windows (PowerShell as Administrator):**

```powershell
# Install AWS CLI
winget install -e --id Amazon.AWSCLI

# Install Docker Desktop (if not already installed)
# Download from https://www.docker.com/products/docker-desktop

# Verify installations
aws --version
docker --version
```

---

### Step 1.4 — Configure AWS CLI

```bash
aws configure
```

Enter when prompted:
```
AWS Access Key ID:     [paste your Access Key ID]
AWS Secret Access Key: [paste your Secret Access Key]
Default region name:   ap-south-1         ← Mumbai (or choose your region)
Default output format: json
```

Verify it works:
```bash
aws sts get-caller-identity
# You should see your account ID and user ARN
```

---

### Step 1.5 — Create Amazon ECR Repositories

ECR (Elastic Container Registry) is where your Docker images are stored.

```bash
# Set your region
AWS_REGION=ap-south-1

# Create repos
aws ecr create-repository --repository-name loveparcel-backend --region $AWS_REGION
aws ecr create-repository --repository-name loveparcel-frontend --region $AWS_REGION

# Print your ECR registry URL (you'll need this later)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Your ECR registry: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
```

---

## PART 2 — Launch & Configure EC2 Instance

### Step 2.1 — Launch EC2 Instance

1. In AWS Console, search **EC2** → click it
2. Click **Launch Instance** (orange button)
3. Fill in the form:

   | Field | Value |
   |-------|-------|
   | Name | `loveparcel-server` |
   | OS / AMI | **Ubuntu Server 24.04 LTS** (Free tier eligible) |
   | Instance type | `t3.medium` (2 vCPU, 4GB RAM) — recommended for both apps |
   | Key pair | Click **Create new key pair** → name it `loveparcel-key` → RSA → .pem → Download |
   | Storage | 20 GB gp3 |

4. Under **Network settings** → **Edit**:
   - Allow SSH (port 22) — Source: My IP
   - Click **Add security group rule** → Custom TCP → Port 80 → Source: 0.0.0.0/0
   - Click **Add security group rule** → Custom TCP → Port 443 → Source: 0.0.0.0/0

5. Click **Launch Instance**
6. Note down the **Public IPv4 address** (e.g. `13.234.56.78`)

---

### Step 2.2 — Connect to EC2

**On Windows (PowerShell):**

```powershell
# Move the downloaded .pem file somewhere safe
# e.g. C:\Users\HP\.ssh\loveparcel-key.pem

# Fix permissions (Windows)
icacls "C:\Users\HP\.ssh\loveparcel-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"

# SSH into EC2
ssh -i "C:\Users\HP\.ssh\loveparcel-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 IP (e.g. `13.234.56.78`).

---

### Step 2.3 — Install Docker on EC2

Run these commands **inside your EC2 terminal** (after SSH):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow ubuntu user to run docker without sudo
sudo usermod -aG docker ubuntu

# Apply group change (log out and back in, OR run this)
newgrp docker

# Verify
docker --version
docker compose version
```

---

### Step 2.4 — Install AWS CLI on EC2

```bash
# Inside EC2 terminal
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install -y unzip
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

Configure AWS CLI on EC2:
```bash
aws configure
# Use the same Access Key ID and Secret from Step 1.2
# Region: ap-south-1 (same as your ECR)
# Output: json
```

---

### Step 2.5 — Create Project Directory on EC2

```bash
# Inside EC2 terminal
mkdir -p /home/ubuntu/loveparcel/nginx
mkdir -p /home/ubuntu/loveparcel/nginx/certs
cd /home/ubuntu/loveparcel
```

---

### Step 2.6 — Attach IAM Role to EC2 (Alternative to CLI configure)

Instead of running `aws configure` on EC2 with your personal keys, it's better to use an IAM role:

1. In AWS Console → **IAM** → **Roles** → **Create role**
2. Select **AWS Service** → **EC2** → Next
3. Attach policy: `AmazonECRReadOnlyAccess`
4. Name: `EC2ECRReadRole` → Create
5. Go to **EC2 Console** → Select your instance → **Actions** → **Security** → **Modify IAM role**
6. Attach `EC2ECRReadRole`

Now your EC2 can pull from ECR without personal credentials.

---

## PART 3 — Configure Your Domain & SSL

### Step 3.1 — Point Your Domain to EC2

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) add these DNS records:

```
Type   Name              Value
────────────────────────────────────────────
A      yourdomain.com    YOUR_EC2_PUBLIC_IP
A      api.yourdomain.com YOUR_EC2_PUBLIC_IP
```

Wait 5–30 minutes for DNS to propagate. Test with:
```bash
ping yourdomain.com
# Should resolve to your EC2 IP
```

---

### Step 3.2 — Update Nginx Config with Your Domain

On your local machine, edit [nginx/nginx.conf](file:///d:/Dinestx/loveparcel/nginx/nginx.conf):

Replace **all occurrences** of:
- `yourdomain.com` → your actual domain (e.g. `loveparcel.in`)
- `api.yourdomain.com` → your actual API subdomain (e.g. `api.loveparcel.in`)

---

### Step 3.3 — Upload Nginx Config to EC2

```bash
# From your local machine (Windows PowerShell)
scp -i "C:\Users\HP\.ssh\loveparcel-key.pem" `
    "d:\Dinestx\loveparcel\nginx\nginx.conf" `
    ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/loveparcel/nginx/nginx.conf
```

---

### Step 3.4 — Install Certbot & Get SSL Certificate

Run these commands **inside EC2 terminal**:

```bash
# Install Certbot
sudo apt install -y certbot

# Stop any service using port 80 temporarily
# (Nginx isn't running yet, so this is fine)

# Get SSL certificate (replace with your actual domain)
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d api.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --non-interactive

# Certificates are saved to /etc/letsencrypt/live/yourdomain.com/
```

Set up auto-renewal:
```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job to auto-renew
echo "0 12 * * * root certbot renew --quiet --deploy-hook 'docker exec loveparcel-nginx nginx -s reload'" | \
  sudo tee /etc/cron.d/certbot-renew
```

---

## PART 4 — First Manual Deployment (Verify Everything Works)

### Step 4.1 — Build & Push Images from Local Machine

Run from your local machine (Windows PowerShell):

```bash
# Variables
$AWS_REGION = "ap-south-1"
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | `
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push backend
docker build -t "${ECR_REGISTRY}/loveparcel-backend:latest" ./backend
docker push "${ECR_REGISTRY}/loveparcel-backend:latest"

# Build and push frontend (set your real API URL)
docker build `
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com `
  -t "${ECR_REGISTRY}/loveparcel-frontend:latest" `
  ./frontend
docker push "${ECR_REGISTRY}/loveparcel-frontend:latest"
```

---

### Step 4.2 — Create .env File on EC2

SSH into EC2 and create the environment file:

```bash
# Inside EC2 terminal
cat > /home/ubuntu/loveparcel/.env << 'EOF'
NODE_ENV=production
PORT=5000

# MongoDB Atlas connection string
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/loveparcel

# Authentication
JWT_SECRET=your_very_long_random_secret_key_here

# Cloudinary (image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (use Upstash.com free tier)
REDIS_URL=rediss://your-upstash-redis-url

# Razorpay payments
RAZORPAY_KEY_ID=rzp_live_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cashfree payments
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret

# Email (use Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret

# Frontend → Backend URL (used in Next.js)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# ECR registry for docker-compose.prod.yml
ECR_REGISTRY=YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com
EOF
```

---

### Step 4.3 — Upload docker-compose.prod.yml to EC2

```bash
# From local machine
scp -i "C:\Users\HP\.ssh\loveparcel-key.pem" `
  "d:\Dinestx\loveparcel\docker-compose.prod.yml" `
  ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/loveparcel/docker-compose.prod.yml
```

---

### Step 4.4 — Start All Containers on EC2

```bash
# Inside EC2 terminal
cd /home/ubuntu/loveparcel

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-south-1.amazonaws.com

# Pull images and start
docker compose -f docker-compose.prod.yml up -d

# Watch startup logs
docker compose -f docker-compose.prod.yml logs -f
```

---

### Step 4.5 — Verify It Works

```bash
# Check all 3 containers are running (backend, frontend, nginx)
docker ps

# Test health
curl http://localhost:5000/health
# Expected: {"status":"ok","uptime":...}

curl http://localhost:3000
# Expected: HTML from Next.js

# Test through Nginx
curl https://yourdomain.com
curl https://api.yourdomain.com/health
```

---

## PART 5 — Set Up GitHub Actions CI/CD

After your first manual deploy works, automate future deployments.

### Step 5.1 — Generate SSH Key for GitHub Actions

On your local machine:

```bash
# Generate a dedicated key for CI/CD
ssh-keygen -t ed25519 -C "github-actions-loveparcel" -f loveparcel-deploy-key -N ""

# This creates two files:
# loveparcel-deploy-key       ← PRIVATE KEY (add to GitHub secrets)
# loveparcel-deploy-key.pub   ← PUBLIC KEY (add to EC2)
```

Add the public key to EC2:

```bash
# Copy public key content first:
cat loveparcel-deploy-key.pub

# Then in EC2 terminal, add it:
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

### Step 5.2 — Add GitHub Repository Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add every secret below:

| Secret Name | Where to get it | Example |
|-------------|-----------------|---------|
| `AWS_ACCESS_KEY_ID` | IAM user credentials CSV | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM user credentials CSV | `wJal...` |
| `AWS_ACCOUNT_ID` | `aws sts get-caller-identity` | `123456789012` |
| `EC2_HOST` | EC2 Public IPv4 address | `13.234.56.78` |
| `EC2_SSH_KEY` | Contents of `loveparcel-deploy-key` (private) | `-----BEGIN OPENSSH...` |
| `DATABASE_URL` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Random long string | `abc123...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard | `abcdef...` |
| `REDIS_URL` | Upstash console | `rediss://...` |
| `RAZORPAY_KEY_ID` | Razorpay dashboard | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard | `your_secret` |
| `CASHFREE_APP_ID` | Cashfree dashboard | `your_app_id` |
| `CASHFREE_SECRET_KEY` | Cashfree dashboard | `your_secret` |
| `SMTP_HOST` | Email provider | `smtp.gmail.com` |
| `SMTP_PORT` | Email provider | `587` |
| `SMTP_USER` | Your email | `you@gmail.com` |
| `SMTP_PASS` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | `GOCSPX-...` |
| `NEXT_PUBLIC_API_URL` | Your API domain | `https://api.yourdomain.com` |

---

### Step 5.3 — Create GitHub Production Environment (Optional — Manual Approval Gate)

1. GitHub repo → **Settings** → **Environments** → **New environment**
2. Name: `production`
3. Enable **Required reviewers** → add yourself
4. Click **Save protection rules**

This means every deploy to `main` will pause and wait for you to click **Approve** before the code goes live.

---

### Step 5.4 — Push Code to Trigger CI/CD

```bash
git add .
git commit -m "feat: add EC2 deployment with Docker + Nginx + CI/CD"
git push origin main
```

Watch the pipeline run:
- Go to GitHub repo → **Actions** tab
- You'll see 3 jobs: **Lint** → **Build & Push** → **Deploy**
- After approval (if configured), it deploys automatically

---

## PART 6 — Useful Commands After Deployment

### View logs
```bash
# SSH into EC2 first
ssh -i "C:\Users\HP\.ssh\loveparcel-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# View all container logs
docker compose -f /home/ubuntu/loveparcel/docker-compose.prod.yml logs -f

# View specific service
docker logs loveparcel-backend -f
docker logs loveparcel-frontend -f
docker logs loveparcel-nginx -f
```

### Restart services
```bash
docker compose -f /home/ubuntu/loveparcel/docker-compose.prod.yml restart backend
docker compose -f /home/ubuntu/loveparcel/docker-compose.prod.yml restart frontend
```

### Manual deploy (without CI/CD)
```bash
cd /home/ubuntu/loveparcel

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-south-1.amazonaws.com

# Pull latest and restart
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f   # clean old images
```

### Check disk & memory
```bash
df -h        # disk usage
free -h      # memory usage
docker stats # live container resource usage
```

---

## PART 7 — Cost Estimate

| Resource | Instance / Tier | Monthly Cost (approx) |
|----------|----------------|----------------------|
| EC2 t3.medium | On-demand | ~$30 USD |
| EC2 t3.small | On-demand | ~$15 USD (if tight budget) |
| Amazon ECR | First 500MB free | ~$0–$1 |
| MongoDB Atlas M0 | Free tier | $0 |
| Upstash Redis | Free tier (10k cmds/day) | $0 |
| Cloudinary | Free tier (25 credits/month) | $0 |

> **Tip:** Use a **t3.small** instance to start (~$15/month). Upgrade to t3.medium if you face memory pressure.

---

## PART 8 — Security Checklist

- [ ] SSH port 22 is restricted to **your IP only** in EC2 Security Group (not 0.0.0.0/0)
- [ ] `.env` file on EC2 has restricted permissions: `chmod 600 /home/ubuntu/loveparcel/.env`
- [ ] Never commit `.env` or `.pem` files to Git
- [ ] Rotate AWS access keys every 90 days
- [ ] Enable **AWS CloudTrail** for audit logging (free tier available)
- [ ] Enable **EC2 termination protection** in console
- [ ] Set up **AWS Budget Alert** at $50/month to avoid surprise bills

---

## PART 9 — Troubleshooting

### Containers not starting
```bash
docker compose -f docker-compose.prod.yml logs
# Look for: missing env vars, connection refused, port already in use
```

### Cannot pull from ECR
```bash
# Re-login to ECR on EC2
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com
```

### Nginx 502 Bad Gateway
```bash
# Backend or frontend not running
docker ps   # check containers are up
docker logs loveparcel-backend --tail=50
```

### SSL certificate error
```bash
# Renew certificate
sudo certbot renew
# Then reload nginx
docker exec loveparcel-nginx nginx -s reload
```

### Port 80/443 not accessible
```bash
# Check EC2 Security Group rules allow inbound port 80 and 443
# AWS Console → EC2 → Security Groups → Your SG → Inbound rules
```

### CI/CD fails on SSH step
```bash
# Test SSH manually
ssh -i loveparcel-deploy-key ubuntu@YOUR_EC2_IP

# Verify public key is in EC2's authorized_keys
cat ~/.ssh/authorized_keys
```

### Backend crashed — rollback manually
```bash
cd /home/ubuntu/loveparcel

# Check what went wrong
docker logs loveparcel-backend --tail=100

# Pull a specific older image tag (replace SHA with a previous commit hash)
docker pull YOUR_ECR_REGISTRY/loveparcel-backend:PREVIOUS_SHA
# Edit docker-compose.prod.yml to use that tag, then:
docker compose -f docker-compose.prod.yml up -d
```
