//Node imports
const {validationResult} = require('express-validator/check')

//Custom imports
const User = require('../models/user');
const Order = require('../models/order');
const Resource = require('../models/resource');

exports.getUserIndex = (req, res, next) => {
    const userId = req.user._id;
    Order.find({'customer.userId': userId})
        .then(orders => {
            res.render('user/index', {
                pageTitle: 'Home',
                path: 'user/',
                ordersList: orders,
                highlights: []
            });
        })
};

exports.getUserAccount = (req, res, next) => {
    const loggedInEmail = req.session.user.email;
    User.findOne({email: loggedInEmail})
        .then(user => {
            const username = user.username;
            const email = user.email;
            res.render('user/account', {
                pageTitle: 'My Account',
                path: 'user/account',
                userDetails: {username: username, email: email},
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postUserAccount = (req, res, next) => {
    const newUsername = req.body.username;
    const newEmail = req.body.email;
    const loggedInEmail = req.session.user.email;
    const newPassword = req.body.new_password;
    const oldPassword = req.body.old_password;
    const errors = validationResult(req);

    User.findOne({email: loggedInEmail})
        .then(user => {
            const username = user.username;
            const email = user.email;
            if (!errors.isEmpty()) {
                return res.status(422)
                    .render('user/account', {
                        pageTitle: 'My Account',
                        path: 'user/account',
                        userDetails: {username: username, email: email},
                        errorMessage: errors.array(),
                        validationErrors: errors.array()
                    });
            }

            bcrypt.compare(oldPassword, user.password)
                .then(passwordMatch => {
                    if (passwordMatch) {
                        return bcrypt
                            .hash(newPassword, 12)
                            .then(hashedPassword => {
                                user.password = hashedPassword;
                                user.username = newUsername;
                                user.email = newEmail;
                                user.cart = [];
                                return user.save()
                                    .then(result => {
                                        res.redirect("/user/account");
                                    });
                            });
                    }

                    let errors = [{param: 'old_password', msg: 'Invalid credentials'}];
                    return res.status(422)
                        .render('user/account', {
                            pageTitle: 'My Account',
                            path: 'user/account',
                            userDetails: {username: username, email: email},
                            errorMessage: errors,
                            validationErrors: errors
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getUserCart = (req, res, next) => {
    let resources;
    let total = 0;

    req.user.populate('cart.items.resourceId')
        .then(user => {
            cartItems = user.cart.items;
            total = 0;
            cartItems.forEach(item => {
                total += item.quantity * item.resourceId.price;
            });
            res.render('user/cart', {
                pageTitle: 'My Cart',
                path: 'user/cart',
                cartItems: cartItems,
                total: total,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postUserCartDeleteItem = (req, res, next) => {
    const resourceId = req.body.resourceId;

    req.user.removeFromCart(resourceId)
        .then(result => {
            res.redirect('/user/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postUserCartClear = (req, res, next) => {
    req.user.clearCart()
        .then(result => {
            res.redirect('/user/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getUserCheckout = (req, res, next) => {
    req.user.populate('cart.items.resourceId')
        .then(user => {
            let cartItems = user.cart.items;
            let total = 0;
            cartItems.forEach(item => {
                total += item.quantity * item.resourceId.price;
            });
            res.render('user/checkout', {
                pageTitle: 'Checkout',
                path: 'user/checkout',
                cartItems: cartItems,
                total: total,
                oldInput: {},
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postUserCheckout = (req, res, next) => {
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const street = req.body.street;
    const postalCode = req.body.postalcode;
    const city = req.body.city;
    const country = req.body.country;
    const mobile = req.body.mobile;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return req.user.populate('cart.items.resourceId')
            .then(user => {
                let cartItems = user.cart.items;
                let total = 0;
                cartItems.forEach(item => {
                    total += item.quantity * item.resourceId.price;
                });
                return res.status(422)
                    .render('user/checkout', {
                        pageTitle: 'Checkout',
                        path: 'user/checkout',
                        cartItems: cartItems,
                        total: total,
                        oldInput: {
                            firstname: firstName,
                            lastname: lastName,
                            street: street,
                            postalcode: postalCode,
                            city: city,
                            country: country,
                            mobile: mobile
                        },
                        errorMessage: errors.array(),
                        validationErrors: errors.array()
                    });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    }

    let email;
    let cartItems;
    let resources;
    let total = 0;

    req.user.populate('cart.items.resourceId')
        .then(user => {
            email = req.user.email;
            cartItems = user.cart.items;
            resources = user.cart.items.map(i => {
                return {quantity: i.quantity, resource: {...i.resourceId._doc}};
            });
            cartItems.forEach(item => {
                total += item.quantity * item.resourceId.price;
            });
            console.log(total)
        })
        .then(result => {
            const order = new Order({
                date: new Date(),
                resources: resources,
                totalAmount: total,
                customer: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    userId: req.user,
                    address: {
                        street: street,
                        postalCode: postalCode,
                        city: city,
                        country: country,
                    },
                    mobile: mobile
                },
                status: 'received'
            });
            return order.save();
        })
        .then(result => {
            req.user.clearCart();
        })
        .then(result => {
            res.redirect('/user/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

};

exports.getUserOrders = (req, res, next) => {
    Order.find({'customer.userId': req.user._id})
        .then(orders => {
            res.render('user/orders', {
                pageTitle: 'My Orders',
                path: 'user/orders',
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getUserOrder = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .then(order => {
            res.render('user/order', {
                pageTitle: 'My Order',
                path: 'user/orders',
                order: order,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};