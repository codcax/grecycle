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
    const loggedInEmail = req.session.admin.email;
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