//Node imports
const express = require("express");
const router = express.Router();

//Custom imports
const shopController = require('../controllers/shop');


router.get('/', shopController.getIndex);
router.get('/signup', shopController.getSignUp);
router.get('/login', shopController.getLogin);

module.exports = router;
