//Node imports
const express = require('express');
const router = express.Router();
const {check, body} = require('express-validator/check');

//Custom imports
const adminController = require('../controllers/admin');
const Admin = require('../models/admin');
const User = require('../models/user');
const isAuth = require('../middlewares/auth');
const isAdmin = require('../middlewares/admin');
const userController = require("../controllers/user");

router.get('/', isAuth, isAdmin, adminController.getAdminIndex);
router.get('/account', isAuth, isAdmin, adminController.getAdminAccount);
router.post('/account',
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
                    if (fetchedUser && fetchedUser._id.toString() !== req.session.user._id.toString()) {
                        console.log(fetchedUser._id);
                        console.log(req.session.user._id);
                        return Promise.reject('Email address already taken.');
                    }
                    ;
                });
            })
            .normalizeEmail(),
        body('new_password', 'Password is invalid.')
            .isLength({min: 8})
            .isAlphanumeric()
            .withMessage('Password must be alphanumeric.')
            .trim(),
        body('old_password')
            .trim()
    ],
    isAuth, isAdmin, adminController.postAdminAccount);
router.get('/admin-accounts', isAuth, isAdmin, adminController.getAdminAccounts);
router.post('/admin-accounts', [
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
    body('role', 'Role is required.')
        .isIn(['editor', 'moderator'])
], isAuth, isAdmin, adminController.postAddAdminAccount);
// router.post('/admin-accounts/:adminId', isAuth, isAdmin, adminController.postEditAdminAccount);
// router.delete('/admin-accounts/:adminId', isAuth, isAdmin, adminController.deleteAdminAccount);


module.exports = router;