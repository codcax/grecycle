//Node imports
const mongoose = require('mongoose');

//Define constants
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    permission: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
    }
});

module.exports = mongoose.model('Admin', adminSchema);