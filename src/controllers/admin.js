//Node imports
const {validationResult} = require('express-validator/check');

//Custom imports
const Admin = require('../models/admin');
const User = require('../models/user');
const Resource = require('../models/resource');
const bcrypt = require('bcryptjs')
const emailTemplates = require('../emails/auth');
const fileHelper = require('../utils/file');
const Order = require("../models/order");

//Define constants

exports.getAdminIndex = (req, res, next) => {
    let adminsList = [];
    let customersList = [];
    let ordersList = [];

    Admin.find().populate('userId')
        .then(admins => {
            adminsList = admins;
        })
        .then(result => {
            return User.find({admin: false})
                .then(customers => {
                    customersList = customers;
                })
        })
        .then(result => {
            return Order.find()
                .then(orders => {
                    ordersList = orders;
                })
        })
        .then(result => {
            res.render('admin/index', {
                pageTitle: 'Home',
                path: 'admin/',
                oldInput: {},
                adminsList: adminsList,
                customersList: customersList,
                ordersList: ordersList,
                validationErrors: [],
                snackbar: {
                    username: req.user.username,
                    message: 'Welcome to Grecycle, it\'s another day to save the Earth!'
                }
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAdminAccount = (req, res, next) => {
    const loggedInEmail = req.session.user.email;
    User.findOne({email: loggedInEmail})
        .then(admin => {
            const username = admin.username;
            const email = admin.email;
            res.render('admin/account', {
                pageTitle: 'My Account',
                path: 'admin/account',
                oldInput: {},
                adminDetails: {username: username, email: email},
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAdminAccount = (req, res, next) => {
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
                    .render('admin/account', {
                        pageTitle: 'My Account',
                        path: 'admin/account',
                        adminDetails: {username: username, email: email},
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
                                return user.save()
                                    .then(result => {
                                        res.redirect('/admin/account');
                                    });
                            });
                    }

                    let errors = [{param: 'old_password', msg: 'Invalid credentials'}];
                    return res.status(422)
                        .render('admin/account', {
                            pageTitle: 'My Account',
                            path: 'admin/account',
                            adminDetails: {username: username, email: email},
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

exports.getAdminAccounts = (req, res, next) => {
    let adminsList = [];
    Admin.find().populate('userId')
        .then(admins => {
            adminsList = admins;
            res.render('admin/adminaccounts', {
                pageTitle: 'Admins',
                path: 'admin/admin-accounts',
                adminsList: adminsList,
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

exports.getAddAdminAccount = (req, res, next) => {
    res.render('admin/addadminaccount', {
        pageTitle: 'Add Admins',
        path: 'admin/admin-accounts/add',
        oldInput: {},
        validationErrors: []
    });
};

exports.postAddAdminAccount = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('admin/addadminaccount', {
                pageTitle: 'Add Admins',
                path: 'admin/admin-accounts/add',
                oldInput: {username: username, email: email, password: password},
                adminsList: [],
                errorMessage: errors.array(),
                validationErrors: errors.array()
            });
    }

    return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                username: username,
                optInNewsletter: true,
                privacy: true,
                admin: true
            });
            return user.save().then(user => {
                const date = new Date();
                const admin = new Admin({
                    userId: user._id, role: role, expiration: date.setMonth(date.getMonth() + 6)
                });
                return admin.save();
            });
        })
        .then(result => {
            res.redirect('/admin/admin-accounts');
            // return emailTemplates.adminWelcomeEmail(username, email, role, password);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditAdminAccount = (req, res, next) => {
    const adminId = req.params.adminId;
    const role = req.body.role;
    const submit = req.body.update;
    if (submit === 'update') {
        Admin.findById(adminId)
            .then(admin => {
                if (!admin) {
                    res.redirect('/admin/admin-accounts');
                }
                admin.role = role;
                return admin.save()
                    .then(result => {
                        res.redirect('/admin/admin-accounts');
                    });
            })
            .catch(err => {
                console.log(err)
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    } else if (submit === 'delete') {
        Admin.findById(adminId).populate('userId')
            .then(admin => {
                if (!admin) {
                    return next(new Error('Admin account not found!'));
                }

                User.findById(admin.userId._id)
                    .then(user => {
                        if (!user) {
                            return next(new Error('User account not found!'));
                        }

                        return User.deleteOne(user);
                    })

                return Admin.deleteOne(admin);
            })
            .then(() => {
                res.redirect('/admin/admin-accounts');
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    } else {
        res.redirect('/admin/admin-accounts');
    }
};

exports.getResources = (req, res, next) => {
    Resource.find()
        .then(resources => {
            res.render('admin/resources', {
                pageTitle: 'Resources',
                path: 'admin/resources',
                resourcesList: resources,
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

exports.getAddResource = (req, res, next) => {
    res.render('admin/addresource', {
        pageTitle: 'Add Resources',
        path: 'admin/resources/add',
        oldInput: {},
        validationErrors: []
    });
};

exports.postAddResource = (req, res, next) => {
    const name = req.body.name;
    const price = req.body.price;
    const status = req.body.status;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('admin/addresource', {
                pageTitle: 'Add Resources',
                path: 'admin/resources/add',
                oldInput: {name: name, price: price, status: status, image: image},
                errorMessage: errors.array(),
                validationErrors: errors.array()
            });
    }

    if (!image) {
        let errors = [{param: 'image', msg: 'Please upload an image.'}];
        return res.status(422)
            .render('admin/addresource', {
                pageTitle: 'Add Resources',
                path: 'admin/resources/add',
                oldInput: {name: name, price: price, status: status},
                resorucesList: [],
                errorMessage: errors,
                validationErrors: errors
            });
    }

    const imagePath = image.path;

    const resource = new Resource({
        name: name,
        price: price,
        status: status,
        imagePath: imagePath,
        unit: 'kg'
    });

    resource.save()
        .then(result => {
            res.redirect('/admin/resources');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditResources = (req, res, next) => {
    const resourceId = req.params.resourceId;
    const name = req.body.name;
    const price = req.body.price;
    const status = req.body.status;
    const image = req.file;
    const submit = req.body.update;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.errors.push({param: resourceId});
        return Resource.find()
            .then(resources => {
                return res.status(422)
                    .render('admin/resources', {
                        pageTitle: 'Resources',
                        path: 'admin/resources',
                        oldInput: {name: name, price: price, status: status, image: image},
                        resourcesList: resources,
                        errorMessage: errors.array(),
                        validationErrors: errors.array()
                    });
            });
    }

    if (submit === 'update') {
        Resource.findById(resourceId)
            .then(resource => {
                resource.name = name;
                resource.price = price;
                resource.status = status;
                if (image) {
                    fileHelper.deleteFile(resource.imagePath);
                    resource.imagePath = image.path;
                }
                return resource.save()
                    .then(result => {
                        res.redirect('/admin/resources');
                    });
            }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    } else if (submit === 'delete') {
        Resource.findById(resourceId)
            .then(resource => {
                if (!resource) {
                    return next(new Error('Resource not found!'));
                }
                fileHelper.deleteFile(resource.imagePath);
                return Resource.deleteOne(resource);
            })
            .then(() => {
                res.redirect('/admin/resources');
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    } else {
        res.redirect('/admin/resources');
    }
};

exports.getAdminOrders = (req, res, next) => {
    Order.find()
        .then(orders => {
            res.render('admin/orders', {
                pageTitle: 'All Orders',
                path: 'admin/orders',
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAdminOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            res.render('admin/order', {
                pageTitle: 'Order',
                path: 'admin/orders/' + orderId,
                order: order,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAdminOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    const status = req.body.status;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Order.findById(orderId)
            .then(order => {
                res.render('admin/order', {
                    pageTitle: 'Order',
                    path: 'admin/orders/' + orderId,
                    order: order,
                    validationErrors: errors.array()
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    }

    Order.findById(orderId)
        .then(order => {
            order.status = status;
            return order.save()
        })
        .then(result => {
            res.redirect('/admin/orders/' + orderId)
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
