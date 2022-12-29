const nodemailer = require('nodemailer');


const sendEmail = async(options) => {

    /* Creating a transporter object that will be used to send the email. */
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });


    /* Creating an object that will be used to send the email. */
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    };


    /* Sending the email. */
    await transporter.sendMail(mailOptions);

};


module.exports = sendEmail;