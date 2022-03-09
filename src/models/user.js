//Node imports
const mongoose = require('mongoose');

//Define constants
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    optInNewsletter: {
        type: Boolean
    },
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('User', userSchema);