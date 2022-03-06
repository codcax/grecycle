
exports.getIndex = (req, res, next) => {
            res.render("shop/index", {
                pageTitle: "Shop",
                path: '/'
            });
};

exports.getSignUp= (req, res, next) => {
    res.render("auth/signup", {
        pageTitle: "Sign Up",
        path: '/signup'
    });
};

exports.getLogin= (req, res, next) => {
    res.render("auth/login", {
        pageTitle: "Login",
        path: '/login'
    });
};