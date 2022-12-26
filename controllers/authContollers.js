require('dotenv').config()


const express = require("express")
const methodOverride = require('method-override')
const path = require('path')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const ejs = require('ejs')
const Joi = require('joi')
const bodyParser = require('body-parser')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const multer  = require('multer')
const multerS3  = require('multer-s3')
const fs = require('fs');
const AWS = require('aws-sdk');
const { getMaxListeners } = require('process');
const nodemailer = require("nodemailer");
const { google } = require('googleapis')
const mongoSanitize = require('express-mongo-sanitize');
const puppeteer = require('puppeteer');
const { v4: uuid } = require('uuid');
uuid(); 



const User = require('../models/user')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authorize, checkUser } = require('../middleware/authMiddleware')
const Artist = require('../models/artist')


const oauth2client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 
    process.env.REDIRECT_URI)

    oauth2client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})


const maxAge = 1 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({ id }, 'e445_@678u&6oij3knps630(isyjeh', {
    expiresIn: maxAge
    })
}

module.exports.sign_in_get = (req, res) => {
    try{
        if (req.cookies.id == null || undefined && req.cookies.id == null || undefined){
            return res.render('sign-in')
        }else{
            return res.render('sign-in')
        }
    }catch(e){
        console.log(e)
        return res.redirect('/posts')
    }
    }

module.exports.create_account_get = (req, res) => {
    try{
        if (req.cookies.id == null || undefined && req.cookies.vt == null || undefined){
            res.render('create-account')
        }if(req.cookies.id || req.cookies.vt){
            req.flash('asi', 'you are already signed in')
            return res.redirect('/posts')
        }
    }catch(e){
        return res.redirect('/posts')
    }        
    }


    module.exports.sign_in_post = async(req, res) => {
        const { email, password } = req.body
        try{
            const user = await User.signIn(email, password)
            const token = createToken(user._id)
            const userId = user.id
            const salt = await bcrypt.genSalt(10)
            const userIdHash = await bcrypt.hash(userId, salt)
            if(user.banned === 'true'){
            req.flash('lus', 'account has been banned')
            return res.redirect('/account/sign-in')
            } 
            res.cookie('uid', token, { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
                maxAge: + 1000 * 60 * 60 * 24 * 1 })
            res.cookie('uih', userIdHash, { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
                maxAge: + 1000 * 60 * 60 * 24 * 1})             
            if(req.cookies.url){
            return res.redirect(req.cookies.url)
            }
        }catch(e){
            req.flash('lus', 'incorrect email or password')
            res.redirect('/account/sign-in')
                return
            }
            req.flash('ls', 'successfully logged in!')
            return res.redirect('/posts')
        }
    

module.exports.create_account_post = async (req, res,) => {
    const { email, username, password, passwordConfirm} = req.body
    try{   
    if(req.cookies.id || req.cookies.vt){
        req.flash('asi', 'you are already signed in')
        return res.redirect('/posts')
    }
        const doc = Date.now()
        const allowedCharsName = /^[a-zA-Z0-9_?]{3,30}$/
        const allowedCharsEmail = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
        const allowedCharsPwd = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.]{8,50}$/
        const validEmail = allowedCharsEmail.test(email)
        const validName = allowedCharsName.test(username)
        const validPwd = allowedCharsPwd.test(password)
        const validReEnterPwd = allowedCharsPwd.test(passwordConfirm)
        const repeatMail = await User.findOne({email: email})
        if(repeatMail){
            req.flash('eca', "email is taken")
            res.redirect('/account/create-account')
            return
        }
        if(!validEmail){
            req.flash('eca', "invalid email")
            res.redirect('/account/create-account')
            return
        }if(!validName){
            req.flash('eca', "invalid username")
            res.redirect('/account/create-account') 
            return 
        }if(!validPwd){
            req.flash('eca', "invalid password")
            res.redirect('/account/create-account')
            return
        }if(!validReEnterPwd){
            req.flash('eca', "")
            res.redirect('/account/create-account')
            return
        }if(password !== passwordConfirm){
            req.flash('eca', "invalid password")
            res.redirect('/account/create-account') 
            return 
        }else{
        const user = await User.create({email, username, password, doc})
        const token = createToken(user._id)
        const userId = user.id.toString()
        const salt = await bcrypt.genSalt(10)
        const userIdHash = await bcrypt.hash(userId, salt)
        res.cookie('vt', token, { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
                maxAge: + 1000 * 60 * 60 * 24 * 1 })
        res.cookie('id', user.id, { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
                maxAge: + 1000 * 60 * 60 * 24 * 1 })
        res.cookie('uih', userIdHash, { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
                maxAge: + 1000 * 60 * 60 * 24 * 1 })
        // const accessToken = await oauth2client.getAccessToken()

        // let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: process.env.USER,
        //         pass: process.env.PASS,
        //         clientId: process.env.CLIENT_ID,
        //         clientSecret: process.env.CLIENT_SECRET,
        //         refreshToken: process.env.REFRESH_TOKEN,
        //         accessToken: accessToken
        //     }
        //   })
        //   ejs.renderFile("views/create-account-email.ejs",  { user }, { name: 'test' }, function (err, data) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         var mainOptions = {
        //             from: 'virtconcerts@gmail.com',
        //             to: user.email,
        //             subject: 'test mail',
        //             html: data
        //         };
        //         console.log("html data ======================>", mainOptions.html);
        //         transporter.sendMail(mainOptions, function (err, info) {
        //             if (err) {
        //                 console.log(err);
        //             } else {
        //                 console.log('Message sent: ' + info.response);
        //             }
        //         });
// }
// })
        req.flash('ac', "account successfuly created")
        return res.redirect('/posts')
        }
    }catch(e){
        console.log(e)
        req.flash('eca', "account cound't be created, please try again using different information")
        return res.redirect('/account/create-account')
    }}






//my artist accounts

module.exports.my_accounts_get = async (req, res,) => {
    const id  = req.cookies.uid
    const uih = req.cookies.uih
    try{
    if (id == null || undefined){
        return res.redirect('/account/sign-in')
    }
    if (uih == null || undefined){
        return res.redirect('/account/sign-in')
    }
    jwt.verify(id, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
        if(err){
        console.log('error for token verification')
        return res.redirect('/account/sign-in')
    }else{
        const user = await User.findById(decodedToken.id)
        const userID = decodedToken.id
        const artists = await Artist.find({userId: userID})
        const checkUserId = await bcrypt.compare(user.id, uih)
        return res.render('userArtists', { user, artists})
    }
    })
    }catch(e){
        req.flash('anf', 'the artist you are looking for could not be found')
        return res.redirect('/artists')
        return
    }
}










