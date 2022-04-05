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

    await transporter.sendMail(sendOptions);
};

exports.adminWelcomeEmail = async (username, email, role, password) => {
    const template = await ejs.renderFile(path.resolve(__dirname, '../views/emails/adminwelcome.ejs'), {username: username, email: email, role: role , password: password});
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

    await transporter.sendMail(sendOptions);
};

exports.resetPasswordEmail = async (username, email, resetToken) => {
    const domainURL = process.env.DOMAINURL;
    const template = await ejs.renderFile(path.resolve(__dirname, '../views/emails/resetpassword.ejs'), { username: username,  email: email, resetToken: resetToken, domainURL: domainURL});
    const sendOptions = {
        from: process.env.DEFAULTEMAIL,
        to: email,
        subject: 'Password reset',
        html: template
    };

    await transporter.sendMail(sendOptions);
};


