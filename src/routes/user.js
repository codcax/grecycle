//Node imports
const express = require('express');
const router = express.Router();
const {check, body} = require('express-validator/check');

//Custom imports
const userController = require('../controllers/user');
const User = require('../models/user');
const isAuth = require('../middlewares/auth');
const isUser = require('../middlewares/user');

router.get('/', isAuth, isUser, userController.getUserIndex);
router.get('/account', isAuth, isUser, userController.getUserAccount);
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
    isAuth, isUser, userController.postUserAccount);
router.get('/cart', isAuth, isUser, userController.getUserCart);
router.post('/cart-delete-item', isAuth, isUser, userController.postUserCartDeleteItem);
router.post('/cart-clear', isAuth, isUser, userController.postUserCartClear);
router.get('/checkout', isAuth, isUser, userController.getUserCheckout);
router.post('/checkout', [
    body('firstname', 'First name must only contain letters and min length of 5.')
        .isLength({min: 5})
        .isString()
        .trim(),
    body('lastname', 'Last name must only contain letters and min length of 5.')
        .isLength({min: 5})
        .isString()
        .trim(),
    body('street', 'Address is invalid.')
        .not().isEmpty()
        .exists()
        .trim(),
    body('postalcode', 'Postal code is invalid.')
        .isNumeric()
        .trim(),
    body('city', 'City is invalid.')
        .not().isEmpty()
        .isString()
        .trim(),
    body('country', 'Country is invalid.')
        .not().isEmpty()
        .isString()
        .trim(),
    body('mobile', 'Contact number is invalid.')
        .isLength(({min:10 , max:10}))
        .trim(),
], isAuth, isUser, userController.postUserCheckout);
router.get('/order', isAuth, userController.getUserOrder);


module.exports = router;