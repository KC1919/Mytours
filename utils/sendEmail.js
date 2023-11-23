const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
    // 1) Create Transport
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Define Email Options
    const mailOptions = {
        from: 'Test Email',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) Send Mail
    await transport.sendMail(mailOptions);
};
