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

module.exports = router;