import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for others
  auth: {
    user: process.env.MAIL_ADMINISTRATOR,
    pass: process.env.MAIL_ADMINISTRATOR_PASS,
  },
});

export default transporter;
