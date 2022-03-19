//Node imports
const express = require('express');
const router = express.Router();
const {check, body} = require('express-validator/check');

//Custom imports
const userController = require('../controllers/user');
const User = require('../models/user');
const isAuth = require('../middlewares/auth');

router.get('/', isAuth, userController.getUserIndex);
router.get('/account', isAuth, userController.getUserAccount);
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
                    if ( fetchedUser && fetchedUser._id.toString() !== req.session.user._id.toString()) {
                        console.log(fetchedUser._id);
                        console.log(req.session.user._id);
                        return Promise.reject('Email address already taken.');
                    };
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
    isAuth,
    userController.postUserAccount);
// router.get('/cart', isAuth, userController.getUserCart);
// router.post('/cart', isAuth, userController.postUserCart);
// router.get('/order', isAuth, userController.getUserOrder);


module.exports = router;