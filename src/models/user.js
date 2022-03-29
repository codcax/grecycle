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
    admin: {
        type: Boolean,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            resourceId: {
                type: Schema.Types.ObjectId,
                ref: 'Resource',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function (resource, quantity) {
    const cartResourceIndex = this.cart.items.findIndex(cp => {
        return cp.resourceId.toString() === resource._id.toString();
    })

    let newQuantity = parseInt(quantity);
    const updatedCartItems = [...this.cart.items];

    if (cartResourceIndex >= 0) {
        newQuantity = this.cart.items[cartResourceIndex].quantity + parseInt(quantity);
        updatedCartItems[cartResourceIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            resourceId: resource._id,
            quantity: newQuantity
        })
    }
    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save()
}

userSchema.methods.removeFromCart = function (resourceId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.resourceId.toString() !== resourceId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('User', userSchema);