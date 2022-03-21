//Node imports

//Custom imports
const User = require('../models/user');

module.exports = (req, res, next) => {
    User.findOne({email: req.session.user.email})
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }

            if (user.admin !== true) {
                return res.redirect('/user');
            }

            next();
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
