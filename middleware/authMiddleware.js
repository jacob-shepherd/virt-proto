const jwt = require('jsonwebtoken')
const Concert = require('../models/post')
const Quote = require('../models/quotes')
const Artists = require('../models/artist')
const User = require('../models/user')
const Purchase = require('../models/purchase')
const posts = require('../routes/posts')

const authorize = (req, res, next) => {
    const token = req.cookies.vt

if(token){
    jwt.verify(token, '1nt5rN0l-combu7tion_EnGin8s#Rule', (err, decodedToken) => {
        if(err){
            req.flash('sir', 'you must be signed in')
            res.redirect('/account/sign-in')
            }else{
                next()
            }
        })
    }else{
        req.flash('sir', 'you must be signed in')
        res.redirect('/account/sign-in')
    }
}

const checkUser = async (req, res, next) => {
    const token = req.cookies.vt
    if(token){
        jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                res.locals.user = null
                res.redicrect('/account/sign-in')
                next()
            }else{
                let user = await User.findById(decodedToken.id)
                console.log(decodedToken.id)
                res.locals.user = user
                next()
            }     
        })
    }else{
        res.locals.user = null
        next()
    }
}

module.exports = {authorize, checkUser}