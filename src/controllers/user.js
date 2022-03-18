//Node imports
const crypto = require('crypto');
const {validationResult} = require('express-validator/check')

//Custom imports
const User = require('../models/user');

exports.getUserIndex = (req, res, next) => {
    res.render('user/index', {
        pageTitle:"Home",
        path:'user/',
        oldInput:{},
        validationErrors:[]
    });
};

exports.getUserAccount = (req, res, next) => {
    res.render('user/account', {
        pageTitle:"My Account",
        path:'user/account',
        oldInput:{},
        validationErrors:[]
    });
}

// exports.postUserAccount = (req, res, next) => {
//
// }
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