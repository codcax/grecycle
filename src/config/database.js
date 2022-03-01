//Node modules
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

//Define constants
const mongodb_uri = process.env.MONGODB_URI;

const store = new MongoDBStore({
    uri: mongodb_uri,
    collection: 'sessions'
})

module.exports = store;
