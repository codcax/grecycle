//Node imports
const mongoose = require('mongoose');

//Define constants
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    role: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
    }
});

module.exports = mongoose.model('Admin', adminSchema);