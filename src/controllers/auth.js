//Node imports
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check')

//Custom imports
const User = require('../models/user');
const emailTemplates = require('../utils/email');

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
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            emailTemplates.welcomeEmail(username, email).then(response => {
                console.log(response);
            });
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

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}