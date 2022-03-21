//Node imports
const mongoose = require('mongoose');

//Custom imports

//Define constants
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
      type: String,
      required: true
    },
    active: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Resource', resourceSchema);