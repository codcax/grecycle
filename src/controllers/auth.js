//Node imports
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {validationResult} = require('express-validator/check')

//Custom imports
const User = require('../models/user');

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
        path: '/login'
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
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};