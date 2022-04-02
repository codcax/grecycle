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

exports.orderEmail = async (username, email, order) => {
    const template = await ejs.renderFile(path.resolve(__dirname, '../views/emails/order.ejs'), {username: username, order:order});
    const sendOptions = {
        from: process.env.DEFAULTEMAIL,
        to: email,
        subject: 'Order Summary!',
        html: template,
        attachments: [{
            filename: 'main.jpg',
            path: path.resolve(__dirname, '../public/images/emails/welcome/main.jpg'),
            cid: 'main'
        }]
    };

    await transporter.sendMail(sendOptions);
};

exports.orderStatusEmail = async (username, email, order) => {
    const template = await ejs.renderFile(path.resolve(__dirname, '../views/emails/orderStatus.ejs'), {username: username, order:order});
    const sendOptions = {
        from: process.env.DEFAULTEMAIL,
        to: email,
        subject: 'Order Summary!',
        html: template,
        attachments: [{
            filename: 'main.jpg',
            path: path.resolve(__dirname, '../public/images/emails/welcome/main.jpg'),
            cid: 'main'
        }]
    };

    await transporter.sendMail(sendOptions);
};

