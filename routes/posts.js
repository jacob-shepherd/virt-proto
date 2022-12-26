require('dotenv').config()


const express = require("express")
const app = express()
const methodOverride = require('method-override')
const path = require('path')
const AppError = require('../views/AppError')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const Joi = require('joi')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const mongoose = require('mongoose')
const multer  = require('multer')
const multerS3  = require('multer-s3')
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const { google } = require('googleapis')
const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');
const puppeteer = require('puppeteer');
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid');
uuid(); 



app.use(express.urlencoded( { extended: true } ))
app.use(express.json())
app.use(methodOverride('_method'))
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser('secretData'))
app.use(express.static( 'public'))
app.set('view engine', 'ejs')

app.use(morgan('tiny'))
// app.use((req, res   ) => {
//     console.log('new request...')
//     // res.send('request recieved')
// })

app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );




const Concert = require('../models/post')
const Artist = require('../models/artist')
const User = require('../models/user')
const Purchase = require('../models/purchase')
const Refund = require('../models/refund')
const posts = require('../routes/posts')
const ChatMsg = require('../models/chat')
const catchAsync = require('../utility/catchAsync')
const allowedChars = require('../utility/allowedChars')
const { authorize, checkUser } = require('../middleware/authMiddleware')
const validateLogin = (req, res, next) => {
    if (!req.cookies.id && req.cookies.vt){
    return res.redirect('/account/sign-in')
    }else{
        next()
    }
}



mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true, 
 useUnifiedTopology: true, useFindAndModify: false})
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
  const bucketName = process.env.BUCKET 

//aws environment 
AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
})


const s3Uid = uuid()

const s3 = new AWS.S3()

const uploadIMG = multer({
    storage: multerS3({
    bucket: bucketName,
    s3:s3,
    key: function(request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = `thumbs/${Date.now()}/` + Date.now() + "-" + file.originalname;
        ab_callback(null, fullPath);
    }
})
})






const stripe = require('stripe')(process.env.STRIPE_SECRET);

const router = express.Router()
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

router.get('/', catchAsync (async(req, res) => {
    try{
        const { genre } = req.query;
        const { search } = req.query;
        const cookies = req.cookies.consent
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(!clearSearch){
        console.log('bad 1')
        return res.redirect('/posts')
        }
        const createToken = (id) => {
            return jwt.sign({ id }, 'e445_@678u&6oij3knps630(isyjeh', {
            expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 1
            })
        }
        const token = req.cookies.consent
        jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error!')
            }else{
                console.log(decodedToken.id)
            }  
        })
    const priceRange = 'all'
    if(genre){
        console.log('genre')
        const Concerts = await Concert.find({ genre }).populate('artist')
        const refunds = await Refund.find()
        const posts = Concerts && refunds
        return res.render('home', { Concerts, cookies, posts, priceRange})
    }
    if(search){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(clearSearch){
        const Concerts = await Concert.find({ title: {$regex:search}}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
        }else{
        req.query.search = ''
        req.query = ''
        console.log('bad')
        const Concerts = await Concert.find().populate('artist');
        return res.redirect('/posts')
        }
    }
    if(genre && search !== '' || null){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        console.log('both')
        if(clearSearch){
        const Concerts = await Concert.find({genre: genre}, { title: {$regex:search}}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange})
        }else{
            console.log('bad both')
            return res.redirect('/posts')
        }
    }
    if(!genre || genre == 'all'){
        const Concerts = await Concert.find({}).populate('artist');
        const refunds = await Refund.find()
        const posts = Concerts && refunds
        return res.render('home', { Concerts, cookies, posts, priceRange })
}
}catch(e){
    console.log(e)
    const Concerts = await Concert.find({}).populate('artist');
    return res.render('home', { Concerts, cookies, priceRange })
}
}))
















router.get('/free', catchAsync (async(req, res) => {
    try{
        const { genre } = req.query;
        const { search } = req.query;
        const cookies = req.cookies.consent
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(!clearSearch){
        console.log('bad 1')
        return res.redirect('/posts')
        }
        const createToken = (id) => {
            return jwt.sign({ id }, 'e445_@678u&6oij3knps630(isyjeh', {
            expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 1
            })
        }
        const token = req.cookies.consent
        jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error!')
            }else{
                console.log(decodedToken.id)
            }  
        })
    const priceRange = 0
    if(genre){
        console.log('genre')
        const Concerts = await Concert.find({ genre: genre, price: 0 }).populate('artist')
        return res.render('home', { Concerts, cookies, priceRange })
    }
    if(search){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(clearSearch){
        const Concerts = await Concert.find({ title: {$regex:search}, price: 0 }).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
        }else{
        req.query.search = ''
        req.query = ''
        console.log('bad')
        const Concerts = await Concert.find({price: 0}).populate('artist');
        return res.redirect('/posts')
        }
    }
    if(genre && search !== '' || null){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        console.log('both')
        if(clearSearch){
        const Concerts = await Concert.find({genre: genre}, { price: 0 }, { title: {$regex:search}}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange})
        }else{
            console.log('bad both')
            return res.redirect('/posts')
        }
    }
    if(!genre || genre == 'all'){
        const Concerts = await Concert.find({price: 0}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
}
}catch(e){
    console.log(e)
    const Concerts = await Concert.find({ price: 0 }).populate('artist');
    return res.render('home', { Concerts, cookies, priceRange })
}
}))












router.get('/under-10', catchAsync (async(req, res) => {
    try{
        const { genre } = req.query;
        const { search } = req.query;
        const cookies = req.cookies.consent
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(!clearSearch){
        console.log('bad 1')
        return res.redirect('/posts')
        }
        const createToken = (id) => {
            return jwt.sign({ id }, 'e445_@678u&6oij3knps630(isyjeh', {
            expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 1
            })
        }
        const token = req.cookies.consent
        jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error!')
            }else{
                console.log(decodedToken.id)
            }  
        })
    const priceRange = 10
    if(genre){
        console.log('genre')
        const Concerts = await Concert.find({ genre: genre, price: { $lte: 10 } }).populate('artist')
        return res.render('home', { Concerts, cookies, priceRange })
    }
    if(search){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(clearSearch){
        const Concerts = await Concert.find({ title: {$regex:search}, price: { $lte: 10 }}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
        }else{
        req.query.search = ''
        req.query = ''
        console.log('bad')
        const Concerts = await Concert.find({price: { $lte: 10 }}).populate('artist');
        return res.redirect('/posts')
        }
    }
    if(genre && search !== '' || null){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        console.log('both')
        if(clearSearch){
        const Concerts = await Concert.find({genre: genre}, { price: { $lte: 10 }}, { title: {$regex:search}}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange})
        }else{
            console.log('bad both')
            return res.redirect('/posts')
        }
    }
    if(!genre || genre == 'all'){
        const Concerts = await Concert.find({price: { $lte: 10 }}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
}
}catch(e){
    console.log(e)
    const Concerts = await Concert.find({ price: { $lte: 10 }}).populate('artist');
    return res.render('home', { Concerts, cookies, priceRange })
}
}))













router.get('/under-15', catchAsync (async(req, res) => {
    try{
        const { genre } = req.query;
        const { search } = req.query;
        const cookies = req.cookies.consent
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(!clearSearch){
        console.log('bad 1')
        return res.redirect('/posts')
        }
        const createToken = (id) => {
            return jwt.sign({ id }, 'e445_@678u&6oij3knps630(isyjeh', {
            expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 1
            })
        }
        const token = req.cookies.consent
        jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error!')
            }else{
                console.log(decodedToken.id)
            }  
        })
    const priceRange = 15
    if(genre){
        console.log('genre')
        const Concerts = await Concert.find({ genre: genre, price: { $lte: 15 } }).populate('artist')
        return res.render('home', { Concerts, cookies, priceRange })
    }
    if(search){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        if(clearSearch){
        const Concerts = await Concert.find({ title: {$regex:search}, price: { $lte: 15 }}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
        }else{
        req.query.search = ''
        req.query = ''
        console.log('bad')
        const Concerts = await Concert.find({price: { $lte: 15 }}).populate('artist');
        return res.redirect('/posts')
        }
    }
    if(genre && search !== '' || null){
        const allowedChars = /^[a-zA-Z0-9 _?&()_.',"-]{0,60}$/
        const clearSearch = allowedChars.test(search)
        console.log('both')
        if(clearSearch){
        const Concerts = await Concert.find({genre: genre}, { price: { $lte: 15 }}, { title: {$regex:search}}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange})
        }else{
            console.log('bad both')
            return res.redirect('/posts')
        }
    }
    if(!genre || genre == 'all'){
        const Concerts = await Concert.find({price: { $lte: 15 }}).populate('artist');
        return res.render('home', { Concerts, cookies, priceRange })
}
}catch(e){
    console.log(e)
    const Concerts = await Concert.find({ price: { $lte: 15 }}).populate('artist');
    return res.render('home', { Concerts, cookies, priceRange })
}
}))



















router.get('/:id', async(req, res) => {
    try{
     const { id } = req.params
     const uih = req.cookies.uih
     const uid = req.cookies.uid
     const concert = await Concert.findById(id).populate('artist')
     if(concert == null || undefined){
        req.flash('pnf', 'post not found')
        return res.redirect('/posts')
     }
     const price = concert.price
     const currency = new Intl.NumberFormat('en-US', 
     { style: 'currency', currency: 'USD' }).format(price)
     const artist = concert.artist
     const artistId = artist.id
     const concertArtist = await Artist.findById(artistId)
     if(!concert) {
     //    return next(new routerError('page not found', 404))
     req.flash('pnf', 'post not found')
     return res.redirect('/posts')
     }
    if(uid == null || undefined){
        return res.render('detailsSO', { concert, currency })
    }
    const token = req.cookies.uid
    jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.render('detailsSO', { concert, currency })  
        }else if(decodedToken.id === artist.userId){
            console.log('user is the owner')
            const user = await User.findById(decodedToken.id)
            const userPurchases = user.purchased_content
            console.log(userPurchases)
            return res.render('details', { concert, currency, user, userPurchases, artist}) 
        } else if (decodedToken.id !== artist.userId){
          return res.render('detailsSO', { concert, currency, })  
        }
    })

 }catch(e){
    console.log(e)
    req.flash('pnf', 'post not found')
    return res.redirect('/posts')

 }
 })





















//editing

router.get('/:id/edit', async(req, res) => {
 try{
    const { id } = req.params
    const concert = await Concert.findById(id).populate('artist')
    const concertArtist = concert.artist.userId
    const artistId = concert.artId
    const artist = await Artist.findById(artistId)
    const uid = req.cookies.uid
    if(uid == null || undefined){
        return res.redirect('/account/sign-in')
    }
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.redirect('/account/sign-in')
        }
    const userId = decodedToken.id
    const user = await User.findById(userId)
    if(!user || user == undefined || null){
    return res.redirect('/account/sign-in')
    }
    if (artist.banned === 'true' || artist.isVerified === 'false'){
            return res.redirect('/posts')
    }
   if (user && concertArtist === user.id && artist.banned === 'false'){
        return res.render('edit', {concert, concertArtist, user})
   }
    if(!concert) {
        //    return next(new routerError('page not found', 404))
            res.redirect('/posts')
        }else
        req.flash('na', "you're not authorized to view this page")
   return res.redirect('/posts')
    })
    }catch(e){
        console.log(e)
        res.redirect('/posts')
    }
})



router.put('/:id',  async(req, res) => {
    try{
    const { id } = req.params;
    const concert = await Concert.findById(id).populate('artist')
    const concertArtist = concert.artist.userId
    const artistId = concert.artId
    const artist = await Artist.findById(artistId)
    const uid = req.cookies.uid
    if(uid == null || undefined){
        return res.redirect('/account/sign-in')
    }
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.redirect('/posts')
        }else{
    const userId = decodedToken.id
    const user = await User.findById(userId)
    const allowedCharsTitle = /^[a-zA-Z0-9_? ]{5,60}$/
    const allowedCharsDesc = /^[a-zA-Z0-9_.:? ]{50,350}$/
    const allowedFileTypes =  /(\.mp4|\.AVI|\.MOV|\.WEBM|\.MPEG-4)$/i;
    const priceRegex = /^\d+(.\d{1,2})?$/
    const {title, desc, year, month, genre, visibility, price} = req.body
    const validTitle = allowedCharsTitle.test(title)
    const validDesc = allowedCharsDesc.test(desc)
    const validPrice = priceRegex.test(price)
    if (!validTitle){
        return res.redirect('/posts')
    }if (!validDesc){
        return res.redirect('/posts')
    }if (!validPrice){
        return res.redirect('/posts')
    }if(artist.banned === 'true' || artist.iVerified === 'false'){
        return res.redirect('/posts')
    }if (concertArtist === userId && artist.banned === 'false'){
    const concertUpdate = await Concert.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    return res.redirect(`/posts/${concert._id}`)
    }}})
    }catch(e) 
    {
        console.log(e)
    return res.redirect('/posts')
    }
})







router.get('/:id/edit-thumbnail', async(req, res) => {
    try{
    const { id } = req.params
    const concert = await Concert.findById(id).populate('artist')
    const concertArtist = concert.artist.userId
    var img = concert.img
    if(img == null || undefined){
        var img = 'none'
    }
    console.log(img)
    const artist = concert.artist
    const uid = req.cookies.uid
    if(uid == null || undefined){
        return res.redirect('/posts')
    }
    if(concert == null || undefined){
        return res.redirect('/posts')
    }
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
    if(err){
        console.log('error for token verification')
        return res.redirect('/posts')
    }
    const id  = decodedToken.id
    const user = await User.findById(id)
   if (concertArtist === user.id && user.id === artist.userId){
        return res.render('edit-thumb', {concert, concertArtist, user, img})
    }else
        req.flash('na', "you're not authorized to view this page")
        return res.redirect('/posts')
    })
    }catch(e){
        console.log(e)
        req.flash('na', "you're not authorized to view this page")
        return res.redirect('/posts') 
    }})



router.patch('/:id', uploadIMG.single('img'), async(req, res) => {
    try{
    const { id } = req.params;
    const concert = await Concert.findById(id)
    const allowedFileTypes = /(\.jpg|\.jpeg|\.png)$/i;
    const fileName = req.file.originalname
    const uid = req.cookies.uid
    if(uid == null || undefined){
        return res.redirect('/posts')
    }
    if(!allowedFileTypes.exec(fileName)){
        return res.redirect('/posts')
    }
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.redirect('/posts')
        }
    const userId  = decodedToken.id
    const user = await User.findById(userId)
    if(user && concert.userId === user.id){
    console.log(req.file.location)
    console.log(req.file.key)
    const updateThumb = await Concert.findByIdAndUpdate(id, { img: req.file.location}, { runValidators: true, new: true })
    const updateThumbKey = await Concert.findByIdAndUpdate(id, { img_key: req.file.key}, { runValidators: true, new: true })
    req.flash('sp', 'thumbnail updated')
    return res.redirect(`/posts/${concert._id}`)
    }else{
        return res.redirect(`/posts/${concert.id}/edit-thumbnail`) 
    }})
    }catch(e) 
    {
        console.log(e)
        return res.redirect('/posts')
    }
})



































router.get('/:id/delete', async (req, res) => {
    try{
        const { id } = req.params
        const concert = await Concert.findById(id).populate('artist')
        const concertArtist = concert.artist.userInfo.toString()
        const artist = await Artist.findById(concert.artId)
        const uid = req.cookies.uid
        if(uid == null || undefined){
            return res.redirect('/posts')
        }
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/posts')
            }
        const userId = decodedToken.id
        const user = await User.findById(userId)
        console.log(user)
        if(!user || user == undefined || null){
        return res.redirect('/account/sign-in')
        }
            if (concert && concertArtist === user.id && user.id === artist.userId){
            return res.render('delete-post', { user, artist, concert })
            }else{

                return res.redirect('/posts')
            }
    })}catch(e){
        console.log(e)
        return res.redirect('/posts')
    }
})

router.delete('/:id', catchAsync (async(req, res) => {
    try{
        const { id } = req.params
        const concert = await Concert.findById(id).populate('artist')
        const concertArtist = concert.artist.userInfo.toString()
        const artist = await Artist.findById(concert.artId)
        const uid = req.cookies.uid
        if(uid == null || undefined){
            return res.redirect('/account/sign-in')
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
        if (concert && concertArtist === user.id && user.id === artist.userId){
            const removePost = await Artist.findByIdAndUpdate(artist.id, {$pull: { posts: { id: concert.id } }})
            const deletedConcert = await Concert.findByIdAndDelete(id);
            req.flash('pd', 'post successfully deleted')
            res.redirect('/posts') //make an official page to confirm the deletion of the post
        }
        else{
        req.flash('na', "you're not authorized to do this")
        return res.redirect('/posts')
       }
    })}catch(e){
        req.flash('pnf', 'post could not be found')
        console.log(e)
        return res.redirect('/posts')
    
    }
}))











































//watch routes

router.get('/watch/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const  uid  = req.cookies.uid
        const concert =  await Concert.findById(id)
        const concert_id = concert.id
        console.log(concert.content_key)
        if(uid == null || undefined){
            return res.redirect('/account/sign-in')
        }
        jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
            if(err){
                console.log('error for token verification')
                return res.redirect('/posts')
            }
        const userId = decodedToken.id
        const user = await User.findById(userId)
        if(!user || user == undefined || null){
        return res.redirect('/account/sign-in')
        }
        const user_purchases = user.purchased_content.toString()
        if (user_purchases.includes(concert_id)){
            const url = s3.getSignedUrl('getObject', {
                Bucket: process.env.BUCKET_TWO,
                Key: concert.content_key,
                Expires: 10800
            })  
              console.log(url)
        return res.render('watch-video', { concert, user, url})
        }else {
            return res.redirect('/posts')
        }
    })}catch(e){
        console.log(e)
        return res.redirect('/posts')
    }
})





 router.get('/:id/request-refund', async (req, res) => {
    try{
     const { id } = req.params
     const concert = await Concert.findById(id)
     const uid = req.cookies.uid
     if(uid == null || undefined){
        return res.send('no uid')
    }
     jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
            console.log('error for token verification')
            return res.redirect('/posts')
        }
      const userId = decodedToken.id
      const user = await User.findById(userId)
      const purchases = user.purchased_content.toString()
     if(!user || user == undefined || null){
        console.log('user is null')
         return res.redirect('/posts')
     }
    if(purchases.includes(concert.id)){
    res.render('refund-request', { concert })
 }else{
    return res.send('not in purchases')
 }})}catch(e){
    console.log(e)
    return res.redirect('/posts')
 }})


 router.post('/:id/request-refund', async (req, res) => {
    try{
    const { id } = req.params
    const concert = await Concert.findById(id).populate('artist')
    const uid = req.cookies.uid
    if(uid == null || undefined){
       return res.redirect('/posts')
   }
   jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
    if(err){
        console.log('error for token verification')
        return res.redirect('/posts')
    }
  const userId = decodedToken.id
  const user = await User.findById(userId)
  const purchases = user.purchased_content.toString()
 if(!user || user == undefined || null){
     return res.redirect('/posts')
 }
   if(purchases.includes(concert.id)){
   const refund = new Refund()
   const purchase = await Purchase.find({ post_id: concert.id, user_id: user.id})
   console.log(req.body)
   purchase.refunded = 'requested'
   refund.cus_id = 'cus_M4JOEBcRxoYf8G'
   refund.intent_id = 'pi_3LttPBEnftAKbusC18BWerxC'
   refund.dateOfRequest = Date.now()
   refund.userEmail = user.email
   refund.user_id = '62c6b73d0ec25891c6106c9d'
   refund.post_id = '633adf8a3d9c517cd3bf7d01'
   refund.refunded = 'requested'
   refund.amountPaid = 12
   refund.reason = req.body.reason
   var today = new Date();
    var yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    today = dd + '/' + mm + '/' + yyyy;
    refund.dateOfRequestFormatted = today
    await refund.save()
    const userRefund = await User.findByIdAndUpdate(userId, {$push: {refunds: refund}}, { runValidators: true, new: true });
   const updatePurchase = await Purchase.findByIdAndUpdate(purchase.id, { refunded: 'requested'}, { runValidators: true, new: true })
   return res.send(refund)
}else{
   return res.redirect('/posts')
}})}catch(e){
    return res.redirect('/posts')
}})




router.get('/:id/test-delete', async (req, res) => {
    const id = '62a1c2327f8443cbfaec3c65'
    const post = await Concert.findById(id)
    const deletePost = await Concert.findByIdAndUpdate(id, { expireAfterSeconds: 30})

})

module.exports = router
