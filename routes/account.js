
require('dotenv').config()


const express = require("express")
const app = express()
const methodOverride = require('method-override')
const path = require('path')
const AppError = require('../views/AppError')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const ejs = require('ejs')
const Joi = require('joi')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const multer  = require('multer')
const multerS3  = require('multer-s3')
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const { google } = require('googleapis')
const jwt = require('jsonwebtoken')
const sanitizeHtml = require('sanitize-html');
const mongoSanitize = require('express-mongo-sanitize');
const puppeteer = require('puppeteer');
const { v4: uuid } = require('uuid');
uuid(); 



app.use(express.urlencoded( { extended: true } ))
app.use(session({ secret: 'secret'}))
app.use(express.json())
app.use(methodOverride('_method'))
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser('secretData'))
app.use(mongoSanitize());
app.use(express.static(path.join(__dirname, 'public')))


app.set('view engine', 'ejs')

app.use(morgan('tiny'))
// app.use((req, res   ) => {
//     console.log('new request...')
//     // res.send('request recieved')
// })

const Concert = require('../models/post')
const Quote = require('../models/quotes')
const Artists = require('../models/artist')
const User = require('../models/user')
const Purchase = require('../models/purchase')
const posts = require('../routes/posts')
const catchAsync = require('../utility/catchAsync')
const authController = require('../controllers/authContollers')
const { authorize, checkUser } = require('../middleware/authMiddleware')




const sessionOptions = {
    secret: 'secret', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: + 1000 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionOptions))
app.use(flash())


app.use((req, res, next) => {
    req.session.returnTo = req.originalUrl
    res.locals.sp = req.flash('sp')
    res.locals.saa = req.flash('saa')
    res.locals.ad = req.flash('ad')
    res.locals.search = req.flash('search')
    res.locals.pd = req.flash('pd')
    res.locals.postnf = req.flash('postnf')
    res.locals.postFail = req.flash('postFail')
    res.locals.paynf = req.flash('paynf')
    res.locals.anf = req.flash('anf')
    res.locals.ls = req.flash('ls')
    res.locals.lf = req.flash('lf')
    res.locals.lus = req.flash('lus')
    res.locals.ac = req.flash('ac')
    res.locals.acbc = req.flash('acbc')
    res.locals.eca = req.flash('eca')
    res.locals.error = req.flash('error')
    res.locals.asi = req.flash('asi')
    res.locals.slo = req.flash('slo')
    res.locals.ntdaa = req.flash('ntdaa')
    res.locals.acs = req.flash('acs')
    res.locals.accs = req.flash('accs')
    next();
})


//req.flash abreviation meanings - 
//sp = successfully posted
//saa = successful artist account creation
//ad = account deletion
//search is obvious
//pd = post deletion
//postnf = post not found
//paynf = payment route not found (it couldn't find the concert that you want to purchase)
//anf = artist not found
//ls = login successful
//lf = login failed
//lus = login unsuccessful
//ac = account created
//acbc = account couldn't be created
//eca = error creating account
//sir = sign in required
//slo = successfully logged out
//ntdaa = need to delete artist accounts


const router = express.Router()

const mongoose = require('mongoose');
const Artist = require("../models/artist")
const { findById } = require('../models/post')


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo is working, connection is now open")
    })
    .catch(err => {
        console.log("OH NO ERROR WITH MONGO!!!!")
        console.log(err)
    })

    const oauth2client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 
        process.env.REDIRECT_URI)
    
        oauth2client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})
    
    

    const stripe = require('stripe')(process.env.STRIPE_SECRET);





    router.get('/sign-in',authController.sign_in_get)
    
    router.post('/sign-in', authController.sign_in_post)

router.get('/sign-out', (req, res) => {
        res.cookie('uid', '', { maxAge: 1 })
        res.cookie('uih', '', { maxAge: 1 })
        req.flash('slo', 'successfully logged out')
        return res.redirect('/posts')
})



    router.get('/create-account', authController.create_account_get)


    router.post('/create-account', authController.create_account_post)



    router.get('/forgot-password', (req, res) => {
        res.render('forgot-password')
    })


    
    const JWT_SECRET = process.env.JWT_SECRET

    router.post('/forgot-password', async(req, res) => {
        const { userEmail } = req.body
        const user = await User.findOne({ email: userEmail})
        const toString = user.toString()
        if(userEmail !== user.email){
        res.send('no user registered with that email')
        return
        }

        const secret = JWT_SECRET + user.password
        const payload = {
            id: user.id,
            email: user.email
        }

        const token = jwt.sign(payload, secret, {expiresIn: '10m'})
        const link = `http://localhost:3000/account/reset-password/${user.id}/${token}`
        console.log(link)
        const accessToken = await oauth2client.getAccessToken()

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.USER,
            pass: process.env.PASS,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
        }
      })
      ejs.renderFile("views/reset-email.ejs",  { link }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'virtconcerts@gmail.com',
                to: user.email,
                subject: 'test mail',
                html: data
            };
            console.log("html data ======================>", mainOptions.html);
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
}
})
        res.send('password reset link has been sent')
    })
    
    router.get('/reset-password/:id/:token', async (req, res) => {
        const { id, token } = req.params
        const user = await User.findById(id)
        if(id !== user.id){
            res.send('invalid id!')
            return
        }
        const secret = JWT_SECRET + user.password
        try{
        const payload = jwt.verify(token, secret)
        res.render('change-password', {email: user.email, user, id, token})
        }
        catch(e){
            res.send(e)
    }})
    


    router.post('/reset-password/:id/:token', async (req, res) => {
        try{
        const { id, token } = req.params
        const allowedCharsPwd = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.]{8,50}$/
        const ID = id.trim()
        const user = await User.findOne({_id: ID})
        const password = req.body.password
        const validPwd = allowedCharsPwd.test(password)
        if(!validPwd){
        console.log('invalid password')
        return res.redirect('/posts')
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const userSave = await User.findByIdAndUpdate(ID, { password: hash}, { runValidators: true, new: true });
        req.flash('ac', 'password successfuly reset')
        return res.redirect('/account/sign-in')
        }
        catch(e){
            console.log(e)
            return res.redirect('/posts')
        }
        
    })

    router.get('/change-password', (req, res) => {
        res.render('change-password')
    })
    


    router.get('/apply-for-artist-account', async (req, res) => {
        try{
            console.log('applying...')
            const uid = req.cookies.uid
            if(uid == null || undefined){
                console.log('no id')
                return res.redirect('/account/sign-in')
            }
            jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
                const id = decodedToken.id
                const user = await User.findById(id)
                const artists = await Artist.find({userId: id})
                if(err){
                    console.log('error for token verification')
                    return res.redirect('/posts')
                }
            // if(user.artists.length > 0 && user.account_tier == null || undefined){
            //     console.log('teir 1')
            //     return res.redirect('/account/upgrade-account')
            // }
            // if(user.artists.length > 0 || user.artists.length < 10 && user.account_tier === 2){
            //     console.log('teir 3')
            //     return res.redirect('/account/upgrade-account')
            // }
            // if(user.artists.length > 0 || user.artists.length < 50 && user.account_tier === 3){
            //     console.log('teir 4')
            //     return res.redirect('/account/upgrade-account')
            // }else{
            return res.render('apply-for-artist-account')
        // }
            })
    }catch(e){
            console.log(e)
            return res.redirect('/posts')
        }
    })

  




    router.get('/upgrade-account', async (req, res) => {
        try{
              const uid = req.cookies.uid
              if(uid == null || undefined){
                console.log('no uid')
                  return res.redirect('/posts')
              }
              jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
                const id = decodedToken.id
                const user = await User.findById(id)
                if(err){
                    console.log('error for token verification')
                    return res.redirect('/posts')
                }
                if(!user || user == undefined || null){
                    console.log('no user')
                    return res.redirect('/posts')
                }else{
              return res.render('account-upgrade', { user })
          }})
            }catch(e){
            console.log(e)
            return res.redirect('/posts')
            }
      })




















    

    router.get('/my-accounts', authController.my_accounts_get)
    
    
    router.get('/purchases', async (req, res) => {
        try{
        const uid  = req.cookies.uid
        if(uid == null || undefined){
            console.log('no uid')
            return res.redirect('/posts')
        }
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/posts')
            }
            const userId  = decodedToken.id
        const user = await User.findById(userId).populate('purchased_content')
    if(user == null || undefined){
        req.flash('sir', 'you must be signed in to view this page')
        res.redirect('/account/sign-in')   
    }
        if(user){
            const purchases = user.purchased_content
            res.render('purchases', { user, purchases })
        }
            const { genre } = req.query;
    
        if(genre){
            const Concerts = await Concert.find({ genre })
            res.render('purchases', { Concerts })
        }
    })}catch(e){
        console.log(e)
        return res.redirect('/posts')
        }})
    

























// account settings

router.get('/create-stripe-account/:id', async (req, res) => {
    try{
    const { id } = req.params
    const artist = await Artist.findById(id)
    const uid = req.cookies.uid
        if(uid == null || undefined){
            return res.redirect('/account/sign-in')
        }
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/') 
            }
        const userId = decodedToken.id
        const user = await User.findById(userId)
    const artistUser = artist.userId
    if(artistUser === userId){
    return res.render('create-stripe-account', { artist, user })
    }else{
        return res.redirect('/') 
    }})}catch(e){
        return res.redirect('/') 
    }
})

router.post('/create-stripe-account/:id', async (req, res) => {
    try{
    const { id } = req.params
    const artist = await Artist.findById(id)
    const uid = req.cookies.uid
    if(uid == null || undefined){
        return res.redirect('/account/sign-in')
    }
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.redirect('/') 
        }
    const userId = decodedToken.id
    const user = await User.findById(userId)
const artistUser = artist.userId
if(artistUser === userId){
    const { name, email, country, currency, stripe_tos } = req.body
    const nameRegex = /^[a-zA-Z0-9-' ]{1,150}$/
    const allowedCharsEmail = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
    const validName = nameRegex.test(name)
    const validEmail = allowedCharsEmail.test(email)
        if(!validName){
            res.send('error')
        }
        if(!validEmail){
            res.send('error')
        }if(stripe_tos !== 'on' || stripe_tos == null || undefined){
            res.send('error')
        }
        const account = await stripe.accounts.create({
            type: 'express',
            country: country,
            email: email,
          });
          const artist = await Artist.findById(id)
          artist.stripe_acct = account.id
          artist.stripe_acct_progress = 'halfway'
          artist.create_account_tos_agree = true
          await artist.save()
          const accountLink = await stripe.accountLinks.create({
            account: artist.stripe_acct,
            refresh_url: 'https://example.com/reauth',
            return_url: `http://localhost3000/artists/${artist.id}/stripe-connect/success`,
            type: 'account_onboarding',
          });
      return  res.redirect(accountLink.url)
        }else{
            return res.redirect('/')
        }
    })}catch(e){
        console.log(e)
        return res.redicrect('/posts')
    }    
})


router.get('/stripe-connect/:id', async (req, res) => {
    const { id } = req.params
    const artist = await Artist.findById(id)
    try{
        const uid = req.cookies.uid
        if(uid == null || undefined){
            return res.redirect('/account/sign-in')
        }
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/') 
            }
        const userId = decodedToken.id
        const user = await User.findById(userId)
    const artistUser = artist.userId
    if(userId === artistUser && artist.stripe_acct == null || undefined){
        res.redirect(`/account/create-stripe-account/${artist.id}`)
    }
    if(userId === artistUser){
        const accountLink = await stripe.accountLinks.create({
            account: artist.stripe_acct,
            refresh_url: 'https://example.com/reauth',
            return_url: `http://localhost3000/artists/${artist.id}/stripe-connect/success`,
            type: 'account_onboarding',
          });
      return  res.redirect(accountLink.url)
    }else{
        return res.redirect('/posts')
    }})
    }catch(e){
        console.log(e)
        return res.redirect('/posts')
    }
})



router.get('/:id/stripe-login', authorize, checkUser, async (req, res) => {
    try{
    const { id } = req.params
    const uih = req.cookies.uih
    const userId = req.cookies.id
    const user = await User.findById(userId)
    const artist = await Artist.findById(id)
    if(uih == null || undefined){
    return res.redirect('/posts')
    }
    const checkUserId = await bcrypt.compare(user.id, uih)
    if(artist.stripe_acct == null || undefined){
    return res.redirect('/posts')
    }
    if(checkUserId){
        const loginLink = await stripe.accounts.createLoginLink(
            artist.stripe_acct
          );
        return res.redirect(loginLink.url)
    }
    }catch(e){
        console.log(e)
        return res.redirect('/posts')
    }
})





   
router.get('/account-settings', async (req, res) => {
    try{
        const uid = req.cookies.uid
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/posts')
            }
        const id  = decodedToken.id
        const user = await User.findById(id)
        if(user.country){
        return res.render('account-settings', { user })
        }else{
            return res.render('account-settings-incomplete', { user })
        }
        })
        }catch(e){
            console.dir(e)
            return res.redirect('/posts')
        }
})

router.get('/add-payment-method', authorize, checkUser, async (req, res) => {
    try{
        const  id  = req.cookies.id
        const user = await User.findById(id)
        return res.render('payment-method')
    }catch(e){
        res.send(e)
    }
})

router.post('/payment-method', async (req, res) => {
    try{
        const  id  = req.cookies.id
        const user = await User.findById(id)
        const { type, c_num, exp_month, exp_year, cvc, first_name, last_name, city, address, zip} = req.body
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: c_num,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: cvc,
            },
          });
    console.log(paymentMethod)
    const userSave = await User.findByIdAndUpdate(id, { payment_method: paymentMethod.id}, { runValidators: true, new: true });
    }catch(e){
        return res.send(e)
    }
})

router.put('/account-settings', async (req, res) => {
    try{
        const uid = req.cookies.uid
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/posts')
            }else{
        const id  = decodedToken.id
        const user = await User.findById(id)
        const userUpdate = await User.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        console.log(userUpdate)
        req.flash('saa', 'account changes saved')
        return res.redirect('/account/account-settings')
        }})
        }catch(e){
            console.dir(e)
            return res.render('sww')
        }
})





router.post('/cancel-subscription', authorize, checkUser, async (req, res) => {
    try{
        const id = req.cookies.id
        const user = await User.findById(id)
        const uih = req.cookies.uih
          if(!user || user == undefined || null){
              req.flash('sir', 'you must be signed in')
              return res.redirect('/account/sign-in') 
          }
          if(uih == null || undefined){
              req.flash('sir', 'you must be signed in')
              return res.redirect('/account/sign-in') 
          }
          const checkUserId = await bcrypt.compare(user.id, uih)
          if(!checkUserId){
              req.flash('sir', 'you must be signed in')
              return res.redirect('/account/sign-in') 
          }
          if(user.account_sub == '' || user.account_tier == null || undefined){
            return res.send('bad')
          }
          if(user.account_sub){
          const deleted = await stripe.subscriptions.del(
            user.account_sub
          );
          const userSave = await User.findByIdAndUpdate(req.cookies.id, { account_sub: ''}, { runValidators: true, new: true });
          const userSaveTier = await User.findByIdAndUpdate(req.cookies.id, { account_tier: ''}, { runValidators: true, new: true });
          }
          return res.send(user)
        }catch(e){
            console.log(e)
            return res.send('bad')
          }
})

router.get('/delete-account', authorize, checkUser, async (req, res) => {
    const userID = req.cookies.id
    const uih = req.cookies.uih
    const user = await User.findById(userID)
    if(!user || user == undefined || null){
        return res.redirect('/posts')
    }
    if(uih == null || undefined){
        return res.redirect('/posts')
    }
    const checkUserId = await bcrypt.compare(user.id, uih)
    if(!checkUserId){
        return res.redirect('/posts')
    }
    if(checkUserId){
        return res.render('delete-user')
    }
})

router.delete('/delete-account', authorize, checkUser, async (req, res) => {
    const userID = req.cookies.id
    const uih = req.cookies.uih
    const user = await User.findById(userID)
    if(!user || user == undefined || null){
        return res.redirect('/posts')
    }
    if(uih == null || undefined){
        return res.redirect('/posts')
    }
    const checkUserId = await bcrypt.compare(user.id, uih)
    if(!checkUserId){
        return res.redirect('/posts')
    }
    const artId = user.artists.toString()
    const artist = await Artist.findById(artId)
    if(!checkUserId){
        return res.redirect('/posts')
    }
    if(checkUserId){
        if(user.cus_id == null || undefined){
            const deleteUser = await User.findByIdAndDelete(userId)
        }else{
            const deleteUser = await User.findByIdAndDelete(userId)
            const deletedCus = await stripe.customers.del(
            user.cus_id
          );
        }
    }
    if(checkUserId){  
    const concert = await Concert.find({artId: artist.id})
    if(artist.stripe_acct !== null || undefined){
    const deleted = await stripe.accounts.del(
        artist.stripe_acct
      );
    }
    if(user.cus_id !== null || undefined){
      const deletedCus = await stripe.customers.del(
        user.cus_id
      );
    }
    const concertDelete = await Concert.deleteMany({artId: artist.id})
    const deleteUser = await User.findByIdAndDelete(userID)
    const deleteArtist = await Artist.findByIdAndDelete(artist.id)}
    res.cookie('vt', '', { maxAge: 1 })
    res.cookie('id', '', { maxAge: 1 })
    req.flash('slo', 'successfully deleted account')
    return res.redirect('/posts')
})

    
    


module.exports = router