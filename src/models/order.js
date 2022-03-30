//Node imports
const mongoose = require('mongoose');

//Define constants
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    resources: [{
        resource: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    customer: {
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        address: [{
            street: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            }
        }],
        mobile: {
            type: String,
            required: true
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);