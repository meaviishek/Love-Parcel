# LoveParcel — Deployment Guide

**Stack:** Next.js 16 + Express/Prisma + MongoDB Atlas + Docker + AWS

---

## Overview

This guide has 3 parts:

| Part | What | Time |
|------|------|------|
| [Part 1](#part-1--run-locally-with-docker) | Run both apps locally with Docker | ~10 min |
| [Part 2](#part-2--deploy-on-aws-ec2-simple) | Deploy on AWS EC2 (simple, cheap) | ~45 min |
| [Part 3](#part-3--deploy-on-aws-eks-kubernetes) | Deploy on AWS EKS (Kubernetes, scalable) | ~90 min |

> **Recommendation:** Do Part 1 first to verify everything works, then choose Part 2 (EC2) or Part 3 (EKS) for production.

---

# PART 1 — Run Locally with Docker

### What you need
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and **open/running**

---

### Step 1 — Create `.env` file

Create a file called `.env` in the root folder `d:\Dinestx\loveparcel\` with these values:

```env
# Database (MongoDB Atlas — https://cloud.mongodb.com)
DATABASE_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/loveparcel

# JWT Secret (any random long string)
JWT_SECRET=my_super_secret_key_make_it_long_and_random

# Cloudinary (https://cloudinary.com — free account)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret_here

# Redis (https://upstash.com — free account)
REDIS_URL=rediss://default:password@your-url.upstash.io:6379

# Razorpay (https://razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cashfree (https://cashfree.com)
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret

# Email — Gmail App Password
# Get it: Google Account → Security → 2-Step Verification → App passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here

# This tells the frontend where the backend is
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Step 2 — Start Both Apps

Open **PowerShell** or **Command Prompt** in `d:\Dinestx\loveparcel\` and run:

```bash
docker-compose up --build
```

First time takes **3–5 minutes** (downloading + building). Wait until you see both services say ready.

---

### Step 3 — Open in Browser

| URL | What you should see |
|-----|---------------------|
| `http://localhost:3000` | Your frontend (Next.js) |
| `http://localhost:5000/health` | `{"status":"ok"}` — backend is running |
| `http://localhost:5000/api/categories` | Categories from your database |

---

### Step 4 — Stop Everything

```bash
# In the same terminal, press Ctrl+C, then run:
docker-compose down
```

---

# PART 2 — Deploy on AWS EC2 (Simple)

> **Best for:** Small to medium traffic, low cost (~$15–30/month), simple setup.

---

## A — Create AWS Account & User

### Step A1 — Create AWS Account
1. Go to **https://aws.amazon.com** → click **Create an AWS Account**
2. Enter email, password, account name
3. Add credit card (won't be charged for free tier)
4. After signup → sign in at **https://console.aws.amazon.com**

---

### Step A2 — Create IAM User (for safe access)

> Never use your root account. Create a user instead.

1. In AWS Console → search bar → type **IAM** → click it
2. Left menu → **Users** → click **Create user**
3. Username: `loveparcel-admin`
4. Click **Next** → Select **Attach policies directly**
5. Search and check these policies:
   - ✅ `AmazonEC2FullAccess`
   - ✅ `AmazonEC2ContainerRegistryFullAccess`
6. Click **Create user**
7. Click on the user you just created → **Security credentials** tab
8. Click **Create access key** → choose **Command Line Interface (CLI)**
9. Click **Create access key** → **Download .csv file** ← SAVE THIS FILE

---

### Step A3 — Install AWS CLI on Your Computer

```powershell
# Run in PowerShell as Administrator
winget install -e --id Amazon.AWSCLI

# Close and reopen PowerShell, then verify:
aws --version
# Should show: aws-cli/2.x.x ...
```

Configure AWS CLI with your keys:
```bash
aws configure
```
Enter when asked:
```
AWS Access Key ID:     [paste from the CSV file]
AWS Secret Access Key: [paste from the CSV file]
Default region name:   ap-south-1
Default output format: json
```

Test it works:
```bash
aws sts get-caller-identity
# Should print your account ID and user ARN
```

---

### Step A4 — Create ECR Repositories (Docker Image Storage)

```bash
# Create 2 repositories — one for backend, one for frontend
aws ecr create-repository --repository-name loveparcel-backend --region ap-south-1
aws ecr create-repository --repository-name loveparcel-frontend --region ap-south-1

# Print your ECR URL (you'll need this later)
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
echo "Your ECR: $ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com"
```

---

## B — Launch EC2 Server

### Step B1 — Create EC2 Instance

1. AWS Console → search **EC2** → click it
2. Click **Launch instance** (orange button)
3. Fill in the form:

   **Name:** `loveparcel-server`

   **Application and OS Images:** Choose **Ubuntu Server 24.04 LTS** (Free tier eligible)

   **Instance type:** `t3.medium` ← recommended (2 CPU, 4GB RAM)

   **Key pair:** Click **Create new key pair**
   - Name: `loveparcel-key`
   - Type: RSA
   - Format: .pem
   - Click **Create key pair** → it downloads automatically — **don't lose this file!**

   **Storage:** Change to **20 GB**

4. Under **Network settings** → click **Edit**:

   | Rule | Port | Source |
   |------|------|--------|
   | SSH | 22 | My IP ← select this from dropdown |
   | HTTP | 80 | 0.0.0.0/0 |
   | HTTPS | 443 | 0.0.0.0/0 |

5. Click **Launch instance**
6. Click on the instance → copy the **Public IPv4 address** (e.g. `13.234.56.78`)

---

### Step B2 — Connect to Your Server

```powershell
# Move the downloaded key to a safe place first
# Example: C:\Users\HP\.ssh\loveparcel-key.pem

# Fix key permissions (required for SSH to work on Windows)
icacls "C:\Users\HP\.ssh\loveparcel-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"

# Connect (replace YOUR_EC2_IP with your actual IP)
ssh -i "C:\Users\HP\.ssh\loveparcel-key.pem" ubuntu@YOUR_EC2_IP
```

You are now inside your EC2 server.

---

### Step B3 — Install Docker on EC2

Run these commands **inside the EC2 SSH terminal**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Let ubuntu user run docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
docker compose version
```

---

### Step B4 — Install AWS CLI on EC2

```bash
# Inside EC2 terminal
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install -y unzip
unzip awscliv2.zip
sudo ./aws/install

# Configure (same keys as your computer)
aws configure
# Region: ap-south-1, Output: json
```

---

### Step B5 — Create Project Folder on EC2

```bash
mkdir -p /home/ubuntu/loveparcel/nginx
```

---

## C — Deploy the App

### Step C1 — Build & Push Images (on your computer)

Open **PowerShell** on your local machine (not EC2):

```powershell
# Your details
$REGION    = "ap-south-1"
$ACCOUNT   = "557690591689"
$EC2_IP    = "13.60.188.45"
$ECR       = "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region $REGION | `
  docker login --username AWS --password-stdin $ECR

# Build and push backend
docker build -t "$ECR/loveparcel-backend:latest" ./backend
docker push "$ECR/loveparcel-backend:latest"

# Build frontend — bake the EC2 backend URL into the image
docker build `
  --build-arg NEXT_PUBLIC_API_URL=http://${EC2_IP}:5000 `
  -t "$ECR/loveparcel-frontend:latest" `
  ./frontend
docker push "$ECR/loveparcel-frontend:latest"
```

---

### Step C2 — Open EC2 Security Group Ports

> Without a domain you access the app directly by IP and port, so you must open the ports.

1. AWS Console → **EC2** → **Instances** → click your instance
2. Scroll down → **Security** tab → click the Security Group link
3. Click **Edit inbound rules** → **Add rule** for each:

| Type       | Port | Source    |
|------------|------|-----------|
| Custom TCP | 3000 | 0.0.0.0/0 |
| Custom TCP | 5000 | 0.0.0.0/0 |

4. Click **Save rules**

---

### Step C3 — Copy Compose File to EC2

```powershell
# From your local machine PowerShell
$IP  = "13.60.188.45"
$KEY = "C:\Users\HP\.ssh\loveparcel-key.pem"

scp -i $KEY docker-compose.prod.yml ubuntu@${IP}:/home/ubuntu/loveparcel/
```

---

### Step C4 — Create `.env` on EC2

SSH into EC2, then:

```bash
nano /home/ubuntu/loveparcel/.env
```

Paste and fill in your real values:

```env
NODE_ENV=production
PORT=5000

DATABASE_URL=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/loveparcel

JWT_ACCESS_SECRET=your_long_random_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ADMINISTRATOR=your@gmail.com
MAIL_ADMINISTRATOR_PASS=xxxx xxxx xxxx xxxx

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret
CASHFREE_ENV=production

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret
GOOGLE_CALLBACK_URL=http://13.60.188.45:5000/api/auth/google/callback

FRONTEND_URL=http://13.60.188.45:3000
NEXTAUTH_URL=http://13.60.188.45:3000
NEXT_PUBLIC_API_URL=http://13.60.188.45:5000

ECR_REGISTRY=557690591689.dkr.ecr.ap-south-1.amazonaws.com
```

Save: press `Ctrl+X` then `Y` then `Enter`

---

### Step C5 — Start the App on EC2

```bash
cd /home/ubuntu/loveparcel

# Login to ECR from EC2
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  557690591689.dkr.ecr.ap-south-1.amazonaws.com

# Pull and start containers
ECR_REGISTRY=557690591689.dkr.ecr.ap-south-1.amazonaws.com \
IMAGE_TAG=latest \
docker compose -f docker-compose.prod.yml up -d

# Check they are running
docker ps
```

You should see 2 containers running: `loveparcel-backend`, `loveparcel-frontend`

---

### Step C6 — Open in Browser

| URL | What you should see |
|-----|---------------------|
| `http://13.60.188.45:3000` | Your frontend (Next.js) |
| `http://13.60.188.45:5000/health` | `{"status":"ok"}` — backend running |

**Your app is live! 🎉**

---


## D — Auto Deploy with GitHub Actions (CI/CD)

Every time you push code to GitHub, it automatically builds and deploys.

### Step D1 — Generate Deploy SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions" -f loveparcel-deploy-key -N ""
# This creates 2 files:
#   loveparcel-deploy-key     (private — goes into GitHub)
#   loveparcel-deploy-key.pub (public — goes into EC2)
```

Add public key to EC2:
```bash
# Print the public key
cat loveparcel-deploy-key.pub
# Copy all that text

# SSH into EC2 and run:
echo "PASTE_COPIED_TEXT_HERE" >> ~/.ssh/authorized_keys
```

---

### Step D2 — Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add each one:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | From IAM CSV file |
| `AWS_SECRET_ACCESS_KEY` | From IAM CSV file |
| `AWS_ACCOUNT_ID` | `557690591689` |
| `EC2_HOST` | `13.60.188.45` |
| `EC2_SSH_KEY` | Open `loveparcel-deploy-key` in Notepad → paste all contents |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Your JWT access secret |
| `JWT_REFRESH_SECRET` | Your JWT refresh secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary |
| `CLOUDINARY_API_KEY` | Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary |
| `RAZORPAY_KEY_ID` | Razorpay |
| `RAZORPAY_KEY_SECRET` | Razorpay |
| `CASHFREE_APP_ID` | Cashfree |
| `CASHFREE_SECRET_KEY` | Cashfree |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail |
| `SMTP_PASS` | Gmail App Password |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `NEXT_PUBLIC_API_URL` | `http://13.60.188.45:5000` |

---

### Step D3 — Push to Deploy

```bash
git add .
git commit -m "deploy: latest changes"
git push origin main
```

Watch live at: **GitHub → Actions tab** — takes about 3–5 minutes.

---

---

# PART 3 — Deploy on AWS EKS (Kubernetes)

> **Best for:** High traffic, auto-scaling, production-grade. Costs ~$150–200/month.

---

## A — Install Tools

Install all of these on your computer:

```powershell
# AWS CLI (if not already installed)
winget install -e --id Amazon.AWSCLI

# kubectl — controls Kubernetes
winget install -e --id Kubernetes.kubectl

# eksctl — creates EKS clusters
winget install -e --id eksctl.eksctl

# helm — installs packages in Kubernetes
winget install -e --id Helm.Helm

# Verify all
aws --version
kubectl version --client
eksctl version
helm version
```

---

## B — AWS Setup (same as Part 2 A if already done)

If you already did Part 2, skip to Step B3.

### Step B1 — Configure AWS CLI
```bash
aws configure
# Access Key, Secret, Region: ap-south-1, Output: json
```

### Step B2 — Create ECR Repositories
```bash
aws ecr create-repository --repository-name loveparcel-backend --region ap-south-1
aws ecr create-repository --repository-name loveparcel-frontend --region ap-south-1
```

---

### Step B3 — Create EKS Cluster

This takes **15–20 minutes**:

```bash
eksctl create cluster \
  --name loveparcel-cluster \
  --region ap-south-1 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

Connect kubectl to your new cluster:
```bash
aws eks update-kubeconfig --region ap-south-1 --name loveparcel-cluster

# Verify nodes are ready
kubectl get nodes
# Should show 2 nodes with STATUS = Ready
```

---

### Step B4 — Install AWS Load Balancer Controller

This lets Kubernetes create an AWS Load Balancer automatically:

```bash
# Download IAM policy
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.0/docs/install/iam_policy.json

# Create the policy in AWS
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Create service account
eksctl create iamserviceaccount \
  --cluster=loveparcel-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Install via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=loveparcel-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify it's running
kubectl get deployment -n kube-system aws-load-balancer-controller
```

---

### Step B5 — Install Metrics Server (for Auto Scaling)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

### Step B6 — Get SSL Certificate from ACM

```bash
# Request a free SSL certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "*.yourdomain.com" \
  --validation-method DNS \
  --region ap-south-1
```

After running this:
1. Go to AWS Console → **ACM** (Certificate Manager)
2. Click on the certificate → **Create records in Route 53** (if using Route 53) OR copy the CNAME records to your DNS provider
3. Wait 5–10 min for validation → status changes to **Issued**
4. Copy the **Certificate ARN** (looks like `arn:aws:acm:ap-south-1:123456789:certificate/abc-def`)
5. Paste it into `k8s/ingress.yaml` line: `alb.ingress.kubernetes.io/certificate-arn: YOUR_ARN`

---

## C — Build & Push Images

On your local machine:

```powershell
$REGION = "ap-south-1"
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$ECR = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Login
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR

# Backend
docker build -t "$ECR/loveparcel-backend:latest" ./backend
docker push "$ECR/loveparcel-backend:latest"

# Frontend
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com `
  -t "$ECR/loveparcel-frontend:latest" ./frontend
docker push "$ECR/loveparcel-frontend:latest"
```

---

## D — Update Config Files

### Step D1 — Update image URLs in deployment files

Open `k8s/backend-deployment.yaml` and find this line:
```yaml
image: YOUR_ECR_REGISTRY/loveparcel-backend:latest
```
Replace with your actual ECR URL:
```yaml
image: 123456789.dkr.ecr.ap-south-1.amazonaws.com/loveparcel-backend:latest
```

Do the same in `k8s/frontend-deployment.yaml`.

### Step D2 — Update domain in ingress

Open `k8s/ingress.yaml` and replace:
- `yourdomain.com` → your actual domain
- `api.yourdomain.com` → your API domain
- Add your ACM certificate ARN

---

## E — Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets from your .env file
kubectl create secret generic loveparcel-secrets \
  --namespace=loveparcel \
  --from-env-file=.env \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# 4. Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# 5. Create load balancer + routing
kubectl apply -f k8s/ingress.yaml

# 6. Set up auto-scaling
kubectl apply -f k8s/hpa.yaml
```

Check everything is running:
```bash
# Watch pods start up (takes 1-2 min)
kubectl get pods -n loveparcel --watch

# Get the load balancer URL
kubectl get ingress -n loveparcel
# Copy the ADDRESS — this is your app URL
```

---

## F — Point Domain to EKS

In your DNS provider, add CNAME records pointing to the Load Balancer URL:
```
CNAME   yourdomain.com       →  k8s-xxx.ap-south-1.elb.amazonaws.com
CNAME   api.yourdomain.com   →  k8s-xxx.ap-south-1.elb.amazonaws.com
```

---

## G — CI/CD for EKS (GitHub Actions)

The `.github/workflows/deploy.yml` file already handles this automatically.

Add these GitHub secrets (same as Part 2 D2, plus these):

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_ACCOUNT_ID` | Your account ID |
| + all the app secrets | (same as Part 2 list) |

Then push code — GitHub Actions will:
1. Build Docker images
2. Push to ECR
3. Update Kubernetes deployments

```bash
git add .
git commit -m "deploy: kubernetes production"
git push origin main
```

---

## Useful Kubernetes Commands

```bash
# See all running pods
kubectl get pods -n loveparcel

# See pod logs
kubectl logs -f deployment/backend -n loveparcel
kubectl logs -f deployment/frontend -n loveparcel

# Restart a deployment
kubectl rollout restart deployment/backend -n loveparcel

# Rollback if something broke
kubectl rollout undo deployment/backend -n loveparcel

# Scale manually
kubectl scale deployment/backend --replicas=3 -n loveparcel

# Check auto-scaler
kubectl get hpa -n loveparcel

# Open shell inside a pod
kubectl exec -it $(kubectl get pod -l app=backend -n loveparcel -o name | head -1) -n loveparcel -- /bin/sh
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Docker Desktop not running | Open Docker Desktop app and wait for it to start |
| `Cannot connect to Docker daemon` | Same as above |
| `ImagePullBackOff` (EC2/EKS) | Run the ECR login command again |
| `502 Bad Gateway` (Nginx) | Backend crashed — `docker logs loveparcel-backend` |
| SSL not working | Run `sudo certbot renew` then restart Nginx |
| Pods stuck in `Pending` (EKS) | Nodes out of memory — upgrade instance type |
| Ingress has no ADDRESS (EKS) | Load Balancer Controller not installed — check Step B4 |
| Backend crashes on start | `.env` is missing or wrong — check `DATABASE_URL` |
| GitHub Actions SSH fails | Check `EC2_SSH_KEY` secret has the full private key content |

---

## Cost Comparison

| Option | Cost/Month | Best For |
|--------|-----------|----------|
| EC2 t3.small | ~$15 | Low traffic, budget |
| EC2 t3.medium | ~$30 | Medium traffic, recommended |
| EKS + 2x t3.medium | ~$150 | High traffic, auto-scale |
