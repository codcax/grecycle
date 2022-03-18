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
// router.post('/account', isAuth, userController.postUserAccount);
// router.get('/cart', isAuth, userController.getUserCart);
// router.post('/cart', isAuth, userController.postUserCart);
// router.get('/order', isAuth, userController.getUserOrder);


module.exports = router;