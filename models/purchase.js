const mongoose = require('mongoose');
const Concert = require('./post');
const User = require('./user')

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo is working, connection is now open")
    })
    .catch(err => {
        console.log("OH NO ERROR WITH MONGO!!!!")
        console.log(err)
    })
    
const { Schema } = mongoose

const purchaseSchema = new Schema({

    email: {
        type: String,
        required: true
    },

    refunded: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    user_id: {
        type: String,
        required: true
    },

    post_id: {
        type: String,
        required: true
    },

    currency: {
        type: String,
        required: true
    },

    successful:{
        type: String,
        required: true
    },

    cus_id: {
        type: String,
        required: true
    },



    amount: {
        type: String,
        required: true
    },

    intent_id: {
        type: String,
        required: true
    },

    discount_code: {
        type: String,
        required: false
    },

    percent_off: {
        type: Number,
        required: false
    },

    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },

    post: {
        type: Schema.Types.ObjectId,
        ref: 'Concert',
        required: true
    }
})



const Purchase = mongoose.model('Purchase', purchaseSchema)

module.exports = Purchase