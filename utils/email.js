const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1 - create a transporter
    const transporter = nodemailer.createTransport({
        host :'sandbox.smtp.mailtrap.io',
        post :25,
        auth : {
            user :'3c669bfc2428e7',
            pass : '28101f0f142029'
        }
    });

    // 2 - define the email options

    const mailOptions = {
        from : 'piyush pawar <piyushpawar@gmail.com>',
        to : options.email,
        subject : options.subject,
        text : options.message,
    };
    
    // 3 - actually send the mail

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;