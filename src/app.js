//Node imports
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Custom imports
const sessionStore = require('./config/database')
const shopRoutes = require('./routes/shop');

const app = express();

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

app.use('/', (req, res, next) => {
    req.session.isLoggedIn = true;
    next();
});

//Routes
app.use(shopRoutes);

mongoose.connect(mongodb_uri)
    .then(() => {
        app.listen(port);
    })
    .catch(error => {
        console.log(error)
    });
