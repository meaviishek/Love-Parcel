import sendMail from "./mail.send.js";

const sendtOtpMail = async (email, otp) => {
  return sendMail({
    to: email,
    subject: "tktHive | OTP to Verify Email",
    textContent: `Your OTP for email verification is ${otp}. This code is valid for 10 minutes.`,
    htmlContent: `
    <div style="background:#000000; padding:40px 0; font-family:Arial, sans-serif;">
      
      <div style="max-width:520px; margin:auto; background:#111111; border-radius:12px; overflow:hidden; box-shadow:0 0 20px rgba(0,0,0,0.5);">
        
        <!-- Header / Logo -->
        <div style="text-align:center; padding:24px 20px; border-bottom:1px solid #222;">
          <img src="https://www.tkthive.com/logo/whitelogo.png" alt="tktHive Logo" style="max-width:120px; margin-bottom:10px;" />
          <h2 style="margin:0; color:#ffa116; font-weight:600;">Verify Your Email</h2>
        </div>

        <!-- Body -->
        <div style="padding:28px;">
          <p style="text-align:center; color:#ffffff; font-size:15px; margin:0 0 18px;">
            Use the One-Time Password (OTP) below to complete your email verification.
          </p>

          <!-- OTP Box -->
          <div style="text-align:center; margin:24px 0;">
            <span style="display:inline-block; background:#ffa116; color:#000000; padding:14px 28px; border-radius:8px; font-size:26px; font-weight:700; letter-spacing:4px;">
              ${otp}
            </span>
          </div>

          <p style="text-align:center; color:#cccccc; font-size:13px; line-height:1.6; margin:0 0 12px;">
            This OTP is valid for <strong style="color:#ffa116;">10 minutes</strong>.  
            Please do not share this code with anyone.
          </p>

          <p style="text-align:center; font-size:12px; color:#999999; margin:0;">
            If you did not request this verification, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#0d0d0d; padding:14px; text-align:center;">
          <p style="margin:0; font-size:11px; color:#777777;">
            © tktHive (Dinestx). All rights reserved.
          </p>
        </div>

      </div>
    </div>
    `
  });
};


export default sendtOtpMail;
