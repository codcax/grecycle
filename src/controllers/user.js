//Node imports
const crypto = require('crypto');
const {validationResult} = require('express-validator/check')

//Custom imports
const User = require('../models/user');
const bcrypt = require("bcryptjs");

exports.getUserIndex = (req, res, next) => {
    res.render('user/index', {
        pageTitle: "Home",
        path: 'user/',
        oldInput: {},
        validationErrors: []
    });
};

exports.getUserAccount = (req, res, next) => {
    const loggedInEmail = req.session.user.email;
    User.findOne({email: loggedInEmail})
        .then(user => {
            const username = user.username;
            const email = user.email;
            res.render('user/account', {
                pageTitle: "My Account",
                path: 'user/account',
                userDetails: {username: username, email: email},
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postUserAccount = (req, res, next) => {
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
                    .render('user/account', {
                        pageTitle: 'My Account',
                        path: 'user/account',
                        userDetails: {username: username, email: email},
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
                                        res.redirect("/user/account");
                                    });
                            });
                    }

                    let errors = [{param: 'old_password', msg: 'Invalid credentials'}];
                    return res.status(422)
                        .render('user/account', {
                            pageTitle: 'My Account',
                            path: 'user/account',
                            userDetails: {username: username, email: email},
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
//
// exports.getUserCart = (req, res, next) => {
//
// }
//
// exports.postUserCart = (req, res, next) => {
//
// }
//
// exports.getUserOrder = (req, res, next) => {
//
// }