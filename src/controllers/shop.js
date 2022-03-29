//Node imports
const {validationResult} = require('express-validator/check')

//Custom imports
const User = require('../models/user');
const Resource = require('../models/resource');

exports.getIndex = (req, res, next) => {
    res.render("shop/index", {
        pageTitle: "Shop",
        path: '/'
    });
};

exports.getResources = (req, res, next) => {
    Resource.find({status: 'active'})
        .then(resources => {
            res.render('shop/resources', {
                pageTitle: 'Resources',
                path: 'resources',
                oldInput: {},
                resourcesList: resources,
                errorMessage: [],
                validationErrors: []
            })
        }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postResources = (req, res, next) => {
    const resourceId = req.body.resourceId;
    const quantity = req.body.quantity;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.errors.push({param: resourceId});
        return Resource.find()
            .then(resources => {
                return res.status(422)
                    .render('shop/resources', {
                        pageTitle: 'Resources',
                        path: 'resources',
                        oldInput: {resourceId: resourceId},
                        resourcesList: resources,
                        errorMessage: errors.array(),
                        validationErrors: errors.array()
                    });
            });
    }

    Resource.findById(resourceId)
        .then(resource => {
            return req.user.addToCart(resource, quantity);
        })
        .then(result => {
            res.redirect('user/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}