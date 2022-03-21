//Node imports
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check');
const crypto = require('crypto');

//Custom imports
const User = require('../models/user');
const emailTemplates = require('../emails/auth');

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: "Sign Up",
        path: '/signup',
        oldInput: {username: '', email: '', password: ''},
        validationErrors: []
    });
};

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        oldInput: {email: '', password: ''},
        validationErrors: []
    });
};

exports.postSignUp = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const optInNewsletter = (req.body.newsletter === 'newsletter') ? true : false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('auth/signup', {
                pageTitle: 'SignUp',
                path: '/signup',
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
                optInNewsletter: optInNewsletter,
                admin: false
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return emailTemplates.welcomeEmail(username, email);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const rememberMe = (req.body.rememberMe === 'rememberMe') ? true : false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                oldInput: {email: email, password: password},
                errorMessage: errors.array(),
                validationErrors: errors.array()
            });
    }

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                let errors = [{param: 'email', msg: 'Invalid credentials'}];
                return res.status(422)
                    .render('auth/login', {
                        pageTitle: 'Login',
                        path: '/login',
                        oldInput: {email: email, password: password},
                        errorMessage: errors,
                        validationErrors: errors
                    });
            }

            bcrypt.compare(password, user.password)
                .then(passwordMatch => {
                    if (passwordMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        if (rememberMe) {
                            req.session.maxAge = 2147483647;
                        }
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    let errors = [{param: 'password', msg: 'Invalid credentials'}];
                    return res.status(422)
                        .render('auth/login', {
                            pageTitle: 'Login',
                            path: '/login',
                            oldInput: {email: email, password: password},
                            errorMessage: errors,
                            validationErrors: errors
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getResetPassword = (req, res, next) => {
    res.render('auth/resetpassword', {
        pageTitle: 'Reset Password',
        path: '/reset-password',
        oldInput: {email: ''},
        validationErrors: []
    });
};

exports.postResetPassword = (req, res, next) => {
    const email = req.body.email;
    let username;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.redirect('/reset-password');
        }

        const resetToken = buffer.toString('hex');
        User.findOne({email: email})
            .then(user => {
                if (!user) {
                    let errors = [{param: 'email', msg: 'Email does not exist.'}];
                    res.render('auth/resetpassword', {
                        pageTitle: 'Reset Password',
                        path: '/reset-password',
                        oldInput: {email: ''},
                        errorMessage: errors,
                        validationErrors: errors
                    });
                }
                username = user.username;
                user.resetToken = resetToken;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                return emailTemplates.resetPasswordEmail(username, email, resetToken);
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const resetToken = req.params.resetToken;
    console.log(resetToken)

    User.findOne({resetToken: resetToken, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if (!user) {
                let errors = [{param: 'resetTokenExpired', msg: 'Link has expired.'}];
                res.render('auth/newpassword', {
                    pageTitle: 'Update Password',
                    path: '/new-password',
                    errorMessage: errors,
                    validationErrors: errors
                });
            }
            res.render('auth/newpassword', {
                pageTitle: 'Update Password',
                path: '/new-password',
                userId: user._id.toString(),
                oldInput: {password: ''},
                resetToken: resetToken,
                errorMessage: [],
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const resetToken = req.body.resetToken;
    console.log(resetToken)
    let resetUser;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('auth/newpassword', {
                pageTitle: 'Update Password',
                path: '/new-password',
                userId: userId,
                oldInput: {password: newPassword},
                resetToken: resetToken,
                errorMessage: errors.array(),
                validationErrors: errors.array()
            });
    }

    User.findOne({resetToken: resetToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            console.log(hashedPassword)
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}