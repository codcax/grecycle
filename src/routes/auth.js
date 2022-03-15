//Node imports
const express = require('express');
const router = express.Router();
const {check, body} = require('express-validator/check');

//Custom imports
const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/signup', authController.getSignUp);
router.post('/signup',
    [
        body('username', 'Username is invalid.')
            .isLength({min: 5})
            .isString()
            .trim(),
        check('email')
            .isEmail()
            .withMessage('Email address is invalid.')
            .custom((value, {req}) => {
                return User.findOne({email: value}).then(fetchedUser => {
                    if (fetchedUser) {
                        return Promise.reject('Email address already taken.');
                    }
                    ;
                });
            })
            .normalizeEmail(),
        body('password', 'Password is invalid.')
            .isLength({min: 8})
            .isAlphanumeric()
            .withMessage('Password must be alphanumeric.')
            .trim(),
        body('confirm-password')
            .trim()
            .custom((value, {req}) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords does not match.');
                }
                return true;
            }),
        check('privacy', 'Required')
            .isIn(['privacy'])
    ],
    authController.postSignUp);
router.get('/login', authController.getLogin);
router.post('/login',
    [
        check('email')
            .isEmail()
            .withMessage('Email address is invalid.')
            .normalizeEmail(),
        body('password', 'Password is invalid.')
            .trim()
    ],
    authController.postLogin);

module.exports = router;
