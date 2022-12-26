const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo is working, connection is now open")
    })
    .catch(err => {
        console.log("OH NO ERROR WITH MONGO!!!!")
        console.log(err)
    })

const audioSchema = new Schema({

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
        required: true
    },

    img_key: {
        type: String,
        required: true
    },

    track_1_url: {
        type: String,
        required: true
    },

    track_1_name: {
        type: String,
        required: true
    },

    track_1_key: {
        type: String,
        required: true
    },


    track_2_url: {
        type: String,
        required: true
    },

    track_2_name: {
        type: String,
        required: true
    },

    track_2_key: {
        type: String,
        required: true
    },



    track_3_url: {
        type: String,
        required: true
    },

    track_3_name: {
        type: String,
        required: true
    },

    track_3_key: {
        type: String,
        required: true
    },

    track_4_url: {
        type: String,
        required: true
    },

    track_4_name: {
        type: String,
        required: true
    },

    track_4_key: {
        type: String,
        required: true
    },


    track_5_url: {
        type: String,
        required: true
    },

    track_5_name: {
        type: String,
        required: true
    },

    track_5_key: {
        type: String,
        required: true
    },







    year: {
        type: Number,
        required: true
    },

    month: {
        type: String,
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
        required: true
    },

    stripe_price_id: {
        type: String,
        required: true
    },

    currency: {
        type: String,
        required: true
    },

    stripe_acct: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    merchant_country: {
        type: String,
        required: true
    },

    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    },

})

module.exports = mongoose.model('Audio', audioSchema)











