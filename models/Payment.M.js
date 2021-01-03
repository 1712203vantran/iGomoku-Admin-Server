const mongoose = require('mongoose');
const Utils = require('../utils/Utils');

// Payment Scheme
/*
    - userId: String
    - dateOfPaying: date
    - status: int (0-fail, 1-success)
    - denominations: string
*/ 

const PaymentScheme = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    dateOfPaying: {
        type: String,
        default: new Date()
    },
    status: {
        type: Number,
        required: true
    },
    denominations: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Payment', PaymentScheme);