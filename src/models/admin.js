//Node imports
const mongoose = require('mongoose');

//Define constants
const Schema = mongoose.Schema;

const adminSchema = new Schema({
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
    role: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('Admin', adminSchema);