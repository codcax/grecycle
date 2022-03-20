//Node imports
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const ejs = require('ejs');
const path = require('path');

//Custom imports

//Constants
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRIDAPI
    }
}));

exports.welcomeEmail = async (username, email) => {
    const template = await ejs.renderFile(path.resolve(__dirname, '../views/emails/welcome.ejs'), {username: username});
    const sendOptions = {
        from: process.env.DEFAULTEMAIL,
        to: email,
        subject: 'Welcome to Grecycle!',
        html: template,
        attachments: [{
            filename: 'main.jpg',
            path: path.resolve(__dirname, '../public/images/emails/welcome/main.jpg'),
            cid: 'main'
        }]
    };

    transporter.sendMail(sendOptions);
};


