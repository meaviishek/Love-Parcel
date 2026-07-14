import transporter from "../../../config/mail.config.js";

const sendMail = async ({to, subject, htmlContent, textContent}) => {
    // if(!to){
    //     throw new Error("EMAIL_NOT_PROVIDED");
    // }
    return transporter.sendMail({
        from: `"TKTHive" <${process.env.MAIL_ADMINISTRATOR}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
    })
}

export default sendMail;
