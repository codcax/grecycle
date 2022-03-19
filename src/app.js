//Node imports
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csrf = require('csurf');

//Custom imports
const sessionStore = require('./config/database')
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const csrfProtection = csrf(undefined);

//.env constants
const mongo_user = process.env.MONGO_USER;
const mongo_password = process.env.MONG_PASSWORD;
const mongo_default_db = process.env.MONGO_DEFAULT_DATABASE;
const mongodb_uri = process.env.MONGODB_URI;
const port = process.env.PORT;

// Templating engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
}));
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    };

    User.findById(req.session.user_id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
});

//Routes
app.use(shopRoutes);
app.use(authRoutes);
app.use('/user',userRoutes);
app.use('/500', errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
    console.log(error)
    res.status(500)
        .render('errors/500', {
            pageTitle: 'Error!',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn
        });
});

mongoose.connect(mongodb_uri)
    .then(() => {
        app.listen(port);
    })
    .catch(error => {
        console.log(error)
    });
