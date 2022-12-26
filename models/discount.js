const { string, required } = require('joi');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Concert = require('./post');
const Artist = require('./artist');
const Refund = require('./refund')
const { Schema } = mongoose;



mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo is working, connection is now open")
    })
    .catch(err => {
        console.log("OH NO ERROR WITH MONGO!!!!")
        console.log(err)
    })

const discountSchema = new mongoose.Schema({
    
    user_id: {
        type: String,
        required: true
    },

    percent_off: {
        type: Number,
        required: true
    },

    multiplier: {
        type: Number,
        required: true
    },

    code: {
        type: String,
        required: true
    },

    created: {
        type: Number,
        required: true
    },

    expires: {
        type: Number,
        required: true
    }
})




const discount = mongoose.model('discount', discountSchema)

module.exports = discount

