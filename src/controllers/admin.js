//Node imports
const {validationResult} = require('express-validator/check');

//Custom imports
const Admin = require('../models/admin');
const User = require('../models/user');
const bcrypt = require('bcryptjs')

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

exports.getAdminUsers = (req, res, next) => {
    res.render('admin/adminusers', {
        pageTitle: 'Admins',
        path: 'admin/admin-users',
        oldInput: {},
        validationErrors: []
    });
};

exports.postAdminUsers = (req, res, next) => {
    res.render('admin/adminusers', {
        pageTitle: 'Admins',
        path: 'admin/admin-users',
        oldInput: {},
        validationErrors: []
    });
};

exports.getAdminUser = (req, res, next) => {
    res.render('admin/adminuser', {
        pageTitle: 'Admin',
        path: 'admin/admin-users',
        oldInput: {},
        validationErrors: []
    });
};

exports.postAdminUser = (req, res, next) => {
    res.render('admin/adminuser', {
        pageTitle: 'Admin',
        path: 'admin/admin-users',
        oldInput: {},
        validationErrors: []
    });
};

exports.deleteAdminUser = (req, res, next) => {
    res.render('admin/adminusers', {
        pageTitle: 'Admins',
        path: 'admin/admin-users',
        oldInput: {},
        validationErrors: []
    });
};


