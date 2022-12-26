const mongoose = require('mongoose')
const Schema = mongoose.Schema

const concertSchema = new Schema({

    artName:{
        type: String,
        required: true
    },

    artId:{
        type: String,
        required: true
    },

    userId:{
        type: String,
        required: true
    },
    
    title:{
        type: String,
        required: true
    },


    desc: {
        type: String,
        max: 100,
        required: true
    },

    img: {
        type: String,
        required: false
    },

    img_key: {
        type: String,
        required: false
    },

    video: {
        type: String,
        required: false
    },

    video_key: {
        type: String,
        required: false
    },



    track_1_url: {
        type: String,
        required: false
    },

    track_1_name: {
        type: String,
        required: false
    },

    track_1_key: {
        type: String,
        required: false
    },


    track_2_url: {
        type: String,
        required: false
    },

    track_2_name: {
        type: String,
        required: false
    },

    track_2_key: {
        type: String,
        required: false
    },



    track_3_url: {
        type: String,
        required: false
    },

    track_3_name: {
        type: String,
        required: false
    },

    track_3_key: {
        type: String,
        required: false
    },

    track_4_url: {
        type: String,
        required: false
    },

    track_4_name: {
        type: String,
        required: false
    },

    track_4_key: {
        type: String,
        required: false
    },


    track_5_url: {
        type: String,
        required: false
    },

    track_5_name: {
        type: String,
        required: false
    },

    track_5_key: {
        type: String,
        required: false
    },



    year: {
        type: Number,
        required: true
    },



    genre: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    rating: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    uploadDate: {
        type: Number,
        required: true
    },

    visibility: {
        type: String,
        required: true
    },
    

    NOP:{
        type: Number,
        required: true
    },

    revenue:{
        type: Number,
        required: true
    },


    stripe_product_id: {
        type: String,
        required: false
    },

    stripe_price_id: {
        type: String,
        required: false
    },


    stripe_acct: {
        type: String,
        required: true
    },

    merchant_country: {
        type: String,
        required: true
    },

    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },

    chat: {
        type: Schema.Types.ObjectId,
        ref: 'ChatMsg',
        required: false
    },

})

module.exports = mongoose.model('Concert', concertSchema)











