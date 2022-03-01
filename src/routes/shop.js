//Node imports
const express = require("express");
const router = express.Router();

//Custom imports
const shopController = require('../controllers/shop');


router.get('/', shopController.getIndex);

module.exports = router;
