import  sendMail from "./mail.send.js";

const sendWelcomeMail = async (email) => {
  return sendMail({
  to: email,
  subject: "Welcome to tkthive – Your Account Is Ready",
  textContent: "We're excited to have you on board.",
  htmlContent: `
  <div style="background:#000000; padding:40px 0; font-family:Arial, sans-serif;">
    
    <div style="max-width:600px; margin:auto; background:#111111; border-radius:10px; padding:30px; box-shadow:0 0 20px rgba(0,0,0,0.4);">

      <!-- Logo -->
      <div style="text-align:center; margin-bottom:20px;">
        <img src="https://www.tkthive.com/logo/whitelogo.png" alt="tkthive Logo" style="max-width:140px;" />
      </div>

      <!-- Heading -->
      <h2 style="text-align:center; color:#ffa116; margin-bottom:10px;">
        Welcome to tkthive
      </h2>

      <!-- Subheading -->
      <p style="text-align:center; color:#ffffff; font-size:15px; margin-top:0;">
        We’re excited to have you on board.
      </p>

      <!-- Body -->
      <p style="color:#dddddd; font-size:14px; line-height:1.7; text-align:center; margin:20px 0;">
        Your account has been successfully created. You can now explore Ticket Hive and start
        discovering, booking, and managing events with ease.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center; margin:30px 0;">
        <a href="https://tkthive.com"
           style="background:#ffa116; color:#000000; padding:14px 28px; text-decoration:none; border-radius:6px; font-size:14px; font-weight:bold; display:inline-block;">
          Visit Dashboard
        </a>
      </div>

      <!-- Info -->
      <p style="text-align:center; font-size:12px; color:#aaaaaa; margin-top:20px;">
        If you did not create this account, please ignore this email or contact our support team.
      </p>

      <!-- Footer -->
      <p style="text-align:center; font-size:11px; color:#666666; margin-top:25px;">
        © tkthive. All rights reserved.
      </p>

    </div>
  </div>
  `
});

};

export default sendWelcomeMail;
