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

const userSchema = new mongoose.Schema({
    email:
    {   type: String,
        required: true,
        unique: true
    },
    username:
    {   type: String,
        required: true,
        unique: true
    },
    password:
    {   type: String,
        required: true,
        unique: false
    },

    currency: {
        type: String,
        required: false
    },

    country: {
        type: String,
        required: false
    },

    doc: {
        type: Number,
        required: true
    },

    cus_id: {
        type: String,
        required: false
    },
    
    phone: {
        type: Number,
        required: false
    },

    payment_method: {
        type: String,
        required: false
    },

    account_tier: {
        type: Number,
        required: false
    },

    account_sub: {
        type: String,
        required: false
    },

    banned: {
        type: String,
        required: false
    },

    following:
    [{
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    }],

    artists:
    [{
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    }],

    first_artist: {
        type: String,
        required: false
    },

    first_two: [{
        type: String,
        required: false
    }],

    first_ten: [{
        type: String,
        required: false
    }],

    fifty: [{
        type: String,
        required: false
    }],

  

    purchased_content: [{
        type: Schema.Types.ObjectId,
        ref: 'Concert'
    }],

    
    watchtime: [{
        type: String,
        required: false
    }],

    refunds:
    [{
        type: Schema.Types.ObjectId,
        ref: 'Refund'
    }],
})

userSchema.post('save', function (doc, next){
    next()
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//sign in

userSchema.statics.signIn = async function (email, password){
    const user = await this.findOne({email})
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
        return user
    }
    throw Error('incorrect email or password')
    }throw Error('no user registered with this email')
}

const User = mongoose.model('User', userSchema)

module.exports = User

