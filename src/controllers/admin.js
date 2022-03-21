//Node imports
const {validationResult} = require('express-validator/check');

//Custom imports
const Admin = require('../models/admin');
const User = require('../models/user');
const bcrypt = require('bcryptjs')
const emailTemplates = require("../emails/auth");

//Define constants

exports.getAdminIndex = (req, res, next) => {
    res.render('admin/index', {
        pageTitle: 'Home',
        path: 'admin/',
        oldInput: {},
        validationErrors: []
    });
};

exports.getAdminAccount = (req, res, next) => {
    const loggedInEmail = req.session.user.email;
    User.findOne({email: loggedInEmail})
        .then(admin => {
            const username = admin.username;
            const email = admin.email;
            res.render('admin/account', {
                pageTitle: 'My Account',
                path: 'admin/account',
                oldInput: {},
                adminDetails: {username: username, email: email},
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.postAdminAccount = (req, res, next) => {
    const newUsername = req.body.username;
    const newEmail = req.body.email;
    const loggedInEmail = req.session.user.email;
    const newPassword = req.body.new_password;
    const oldPassword = req.body.old_password;
    const errors = validationResult(req);

    User.findOne({email: loggedInEmail})
        .then(user => {
            const username = user.username;
            const email = user.email;
            if (!errors.isEmpty()) {
                return res.status(422)
                    .render('admin/account', {
                        pageTitle: 'My Account',
                        path: 'admin/account',
                        adminDetails: {username: username, email: email},
                        errorMessage: errors.array(),
                        validationErrors: errors.array()
                    });
            }

            bcrypt.compare(oldPassword, user.password)
                .then(passwordMatch => {
                    if (passwordMatch) {
                        return bcrypt
                            .hash(newPassword, 12)
                            .then(hashedPassword => {
                                user.password = hashedPassword;
                                user.username = newUsername;
                                user.email = newEmail;
                                return user.save()
                                    .then(result => {
                                        res.redirect("/admin/account");
                                    });
                            });
                    }

                    let errors = [{param: 'old_password', msg: 'Invalid credentials'}];
                    return res.status(422)
                        .render('admin/account', {
                            pageTitle: 'My Account',
                            path: 'admin/account',
                            adminDetails: {username: username, email: email},
                            errorMessage: errors,
                            validationErrors: errors
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAdminAccounts = (req, res, next) => {
    Admin.find()
        .then(admins => {
            if (admins.length > 0) {
                console.log(admins)
                return;
            }
            console.log("none")
        })
    res.render('admin/adminaccounts', {
        pageTitle: 'Admins',
        path: 'admin/admin-accounts',
        oldInput: {},
        validationErrors: []
    });
};

exports.postAddAdminAccount = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('admin/adminaccounts', {
                pageTitle: 'Admins',
                path: 'admin/admin-accounts',
                oldInput: {username: username, email: email, password: password},
                errorMessage: errors.array(),
                validationErrors: errors.array()
            });
    }

    return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                username: username,
                optInNewsletter: true,
                privacy: true,
                admin: true
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/admin/admin-accounts');
            return emailTemplates.welcomeEmail(username, email);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

//
// exports.postEditAdminAccount = (req, res, next) => {
//     res.render('admin/adminaccounts', {
//         pageTitle: 'Admin',
//         path: 'admin/admin-accounts',
//         oldInput: {},
//         validationErrors: []
//     });
// };
//
// exports.deleteAdminAccount = (req, res, next) => {
//     res.render('admin/accounts', {
//         pageTitle: 'Admins',
//         path: 'admin/admin-accounts',
//         oldInput: {},
//         validationErrors: []
//     });
// };


