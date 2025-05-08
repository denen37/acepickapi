const nodemailer = require('nodemailer');
import config from '../config/configSetup'



const transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    port: config.EMAIL_PORT,
    secure: true,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
});

export async function sendEmail(to: String, subject: String, text: String | null, html: String | null) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
        };
    } catch (error) {

        return {
            success: false,
            message: 'Failed to send email',
            error: error
        }
    }
}

module.exports = {
    sendEmail
}