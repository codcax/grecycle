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
    const optInNewsletter = req.body.newsletter;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('auth/signup', {
                pageTitle: 'SignUp',
                path: '/signup',
                errorMessage: errors.array(),
                validationErrors: errors.array()
            });
    }

    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup',
        validationErrors: []
    });
};