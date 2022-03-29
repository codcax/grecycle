//Node imports
const express = require("express");
const router = express.Router();

//Custom imports
const shopController = require('../controllers/shop');
const isAuth = require("../middlewares/auth");
const isUser = require("../middlewares/user");
const {body} = require("express-validator/check");


router.get('/', shopController.getIndex);
router.get('/resources', isAuth, isUser, shopController.getResources);
router.post('/resources', [
    body('resourceId', 'Invalid resource.')
        .exists()
        .isString(),
    body('quantity', 'Quantity is invalid.')
        .isFloat({gt: 0}),
], isAuth, isUser, shopController.postResources);

module.exports = router;
