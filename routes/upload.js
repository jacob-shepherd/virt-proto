
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
const multer  = require('multer')
const multerS3  = require('multer-s3')
const fs = require('fs');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken')
const puppeteer = require('puppeteer'); 
const { v4: uuid } = require('uuid');
uuid(); 







app.use(express.urlencoded( { extended: true } ))
app.use(express.json())
app.use(methodOverride('_method'))
app.set('views', path.join(__dirname, 'views'))
app.use(cookieParser('secretData'))
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')


const Concert = require('../models/post')
const Audio = require('../models/audio')
const Quote = require('../models/quotes')
const Artists = require('../models/artist')
const User = require('../models/user')
const Purchase = require('../models/purchase')
const posts = require('../routes/posts')
const wrapAsync = require('../utility/catchAsync')
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
    res.locals.ntdaa = req.flash('ntdaa')
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










const stripe = require('stripe')(process.env.STRIPE_SECRET);

const router = express.Router()

const mongoose = require('mongoose');
const Artist = require("../models/artist")
const catchAsync = require("../utility/catchAsync")



mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo is working, connection is now open")
    })
    .catch(err => {
        console.log("OH NO ERROR WITH MONGO!!!!")
        console.log(err)
    })

  const accessKeyId = process.env.ACCESS_KEY
  const region = process.env.REGION 
  const secretAccessKey = process.env.ACCESS_SECRET
  const bucketName = process.env.BUCKET_TWO 

//aws environment 
AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
})


const s3Uid = uuid()

const s3 = new AWS.S3()

const upload = multer({
    storage: multerS3({
    bucket: bucketName,
    s3:s3,
    key: function(request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = `videos/${Date.now()}/` + Date.now() + "-" + file.originalname;
        ab_callback(null, fullPath);
    },
})
})



const test = multer({
    storage: multerS3({
    bucket: bucketName,
    s3:s3,
    key: function(request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = `test-data/${Date.now()}/` + Date.now() + "-" + file.originalname;
        ab_callback(null, fullPath);
    },
})
})
































//video





router.get('/:id/new', async (req, res) => {
    try{
        const { id } = req.params
        const artist = await Artist.findById(id)
        const userArtist = artist.userInfo.toString()
        const uid = req.cookies.uid
        if(uid == null || undefined){
            return res.redirect('/posts')
        }
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/posts')
            }
        const id  = decodedToken.id
        const user = await User.findById(id)
        console.log(user)
        // if(user.account_sub == '' && user.account_tier == null || undefined && !user.first_artist.includes(artist.id)){
        //     return res.send('bad no sub')
        // }
        // if(user.account_sub && user.account_tier == 1 && user.first_two.includes(artist.id)){
        //     return res.render('new', { user, userArtist, artist, id })
        // }
        // if(user.account_sub && user.account_tier == 2 && user.first_ten.includes(artist.id)){
        //     return res.render('new', { user, userArtist, artist, id })
        // }
        // if(user.account_sub && user.account_tier == 3 && user.fifty.includes(artist.id)){
        //     return res.render('new', { user, userArtist, artist, id })
        // }
        // if(user.account_sub && user.account_tier == 1 && !user.first_two.includes(artist.id)){
        //     return res.send('bad tier 1')
        // }
        // if(user.account_sub && user.account_tier == 2 && !user.first_ten.includes(artist.id)){
        //     return res.send('bad tier')
        // }
    if (user.first_artist == artist.id && userArtist === user.id && artist.banned === 'false'){
        return res.render('new', { user, userArtist, artist, id })
//     } else{
//     req.flash('na', "you're NOT authorized to do this")
//     return res.redirect('/posts')
   }})
    }catch(e){
    console.dir(e)
    req.flash('na', "you're NOT authorized to do this")
    return res.redirect('/posts')
}
})

router.post('/new/video/:id', upload.single('file'), async (req, res) => {
    try{
        const allowedCharsTitle = /^[a-zA-Z0-9 _?&()_.',"!-]{5,60}$/
        const allowedCharsDesc = /^[a-zA-Z0-9 &()_.',"!-]{50,350}$/
        const allowedFileTypes =  /(\.mp4|\.AVI|\.MOV|\.WEBM|\.MPEG-4)$/i;
        const priceRegex = /^\d+(.\d{1,2})?$/
        const { id } = req.params
        const artist = await Artist.findById(id)
        const newConcert = new Concert(req.body)
        const uid = req.cookies.uid
        if(uid == null || undefined){
            return res.redirect('/posts')
        }
        const userArtist = artist.userId.toString()
        const {title, desc, file, img, year, month, genre, visibility, price} = req.body
        const validTitle = allowedCharsTitle.test(title)
        const validDesc = allowedCharsDesc.test(desc)
        const validPrice = priceRegex.test(price)
        const fileName = req.file.originalname
    if (!validTitle){
        return res.redirect('/posts')
    }if (!validDesc){
        return res.redirect('/posts')
    }if (!validPrice){
        return res.redirect('/posts')
    }if(!allowedFileTypes.exec(fileName)){
        return res.redirect('/posts')
    }
    console.log('reached jwt verify')
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.redirect('/posts')
        }
        const userId  = decodedToken.id
        const user = await User.findById(userId)
        console.log(userArtist, userId, user.id)
        if (userArtist === userId){
        console.log('reached concert settings')
        newConcert.artist = artist
        newConcert.artName = artist.artName
        newConcert.artId = artist.id
        newConcert.uploadDate = Date.now()
        newConcert.NOP = 0
        newConcert.revenue = 0
        newConcert.content = req.file.location
        newConcert.content_key = req.file.key
        newConcert.stripe_acct = artist.stripe_acct
        newConcert.type = 'video'
        newConcert.rating = 'all ages'
        newConcert.userId = user.id
        newConcert.merchant_country = artist.country
        console.log('about to save concert')
        await newConcert.save()
        console.log('saved concert')
        const updateArtist = await Artist.findByIdAndUpdate(id, {$push: {posts: newConcert}}, { runValidators: true, new: true });
        req.flash('sp', 'post has been successfully created')
        return res.redirect(`/posts/${newConcert._id}/edit-thumbnail`)
        }})
        }catch(e){
            console.log(e)
    req.flash('na', "error, please try again")
    return res.redirect('/posts')
            }})

  
  
  
  
  
  






            router.get('/:id/new/audio', async (req, res) => {
                try{
                    const { id } = req.params
                    const artist = await Artist.findById(id)
                    const userArtist = artist.userInfo.toString()
                    const uid = req.cookies.uid
                    if(uid == null || undefined){
                        return res.redirect('/posts')
                    }
                    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
                        if(err){
                            console.log('error for token verification')
                            return res.render('artistShowUser', { artist }) 
                        }
                    const userId = decodedToken.id
                    const user = await User.findById(userId)
                    if(!user || user == undefined || null){
                    return res.redirect('/account/sign-in')
                    }
                    if(user.account_sub == '' && user.account_tier == null || undefined && !user.first_artist.includes(artist.id)){
                        return res.send('bad no sub')
                    }
                    if(user.account_sub && user.account_tier == 1 && user.first_two.includes(artist.id)){
                        console.log('1')
                        return res.render('new-audio', { user, userArtist, artist, id })
                    }
                    if(user.account_sub && user.account_tier == 2 && user.first_ten.includes(artist.id)){
                        console.log('2')
                        return res.render('new-audio', { user, userArtist, artist, id })
                    }
                    if(user.account_sub && user.account_tier == 3 && user.fifty.includes(artist.id)){
                        console.log('3')
                        return res.render('new-audio', { user, userArtist, artist, id })
                    }
                    if(user.account_sub && user.account_tier == 1 && !user.first_two.includes(artist.id)){
                        return res.send('bad tier 1')
                    }
                    if(user.account_sub && user.account_tier == 2 && !user.first_ten.includes(artist.id)){
                        return res.send('bad tier')
                    }
                if (user.first_artist == artist.id && userArtist === user.id && artist.banned === 'false'){
                    return res.render('new-audio', { user, userArtist, artist, id })
                } else{
                req.flash('na', "you're NOT authorized to do this")
                return res.redirect('/posts')
               }
                })}catch(e){
                console.log(e)
                req.flash('na', "you're NOT authorized to do this")
                return res.redirect('/posts')
            }
            })
            







            
            


const audioUploads = upload.fields([{ name: 'track_1', maxCount: 1 }, { name: 'track_2', maxCount: 1 }, 
{ name: 'track_3', maxCount: 1 }, { name: 'track_4', maxCount: 1 }, { name: 'track_5', maxCount: 1 }])

router.post('/new/audio/:id', audioUploads, async (req, res) => {
    try{
        return res.send(req.body)
        // const { id } = req.params
        // const body = JSON.stringify(req.body)
        // console.log(body)
        // const artist = await Artist.findById(id)
        // const userArtist = artist.userInfo.toString()
        // const uid = req.cookies.uid
        // if(uid == null || undefined){
        //     return res.redirect('/posts')
        // }
        // jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        //     if(err){
        //         console.log('error for token verification')
        //         return res.render('artistShowUser', { artist }) 
        //     }
        // const userId = decodedToken.id
        // const user = await User.findById(userId)
        // if(!user || user == undefined || null){
        // return res.redirect('/account/sign-in')
        // }
        // if(user.account_sub == '' && user.account_tier == null || undefined && !user.first_artist.includes(artist.id)){
        //     return res.send('bad no sub')
        // }
        // //add validation
        //     const newConcert = new Concert(req.body)
        //     const product = await stripe.products.create({
        //         name: req.body.title,
        //         active: true,
    
        //       });
        //       const createPrice = await stripe.prices.create({
        //         unit_amount: newConcert.price*100,
        //         currency: 'usd',
        //         product: product.id,
        //         tax_behavior: 'exclusive'
        //       });
        //       const account = await stripe.accounts.retrieve(
        //         artist.stripe_acct
        //       );
        //     console.log('track 1 info', req.files.track_1)
        //     newConcert.artist = artist
        //     newConcert.artName = artist.artName
        //     newConcert.artId = artist.id
        //     newConcert.img = artist.banner
        //     newConcert.uploadDate = Date.now()
        //     newConcert.NOP = 0
        //     newConcert.revenue = 0
        //     newConcert.track_1_name = req.body.track_1_name
        //     newConcert.track_1_url = req.files.track_1[0].location
        //     newConcert.track_1_key = req.files.track_1[0].key
        //     // newConcert.track_2_name = req.body.track_2_name
        //     // newConcert.track_2_url = req.files.track_2[0].location
        //     // newConcert.track_2_key = req.files.track_1[0].key
        //     newConcert.type = 'audio'
        //     newConcert.rating = 'all ages'
        //     newConcert.stripe_product_id = product.id
        //     newConcert.stripe_price_id = createPrice.id
        //     newConcert.stripe_acct = artist.stripe_acct
        //     newConcert.merchant_country = artist.country
        //     newConcert.userId = user.id
        //     await newConcert.save()
        //     return res.send(newConcert)
            // return res.redirect(`/posts/${newConcert.id}/edit-thumbnail`)
   }catch(e){
    console.dir(e)
    req.flash('na', "you're NOT authorized to do this")
    return res.redirect('/posts')
}})
            
              
              
              
              
              
              
            
            
            
            
            
            
            
            
            
            




            
module.exports = router