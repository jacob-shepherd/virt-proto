require('dotenv').config()


const express = require("express")
const methodOverride = require('method-override')
const path = require('path')
const AppError = require('./views/AppError')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const ejs = require('ejs')
const Joi = require('joi')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const multer  = require('multer')
const multerS3  = require('multer-s3')
const fs = require('fs-extra')
const AWS = require('aws-sdk');
const { getMaxListeners } = require('process');
const nodemailer = require("nodemailer");
const { google } = require('googleapis')
const mongoSanitize = require('express-mongo-sanitize');
const jwt = require('jsonwebtoken')
const puppeteer = require('puppeteer');
const { v4: uuid } = require('uuid');
uuid(); 







const Concert = require('./models/post')
const Audio = require('./models/audio')
const Quote = require('./models/quotes')
const Artist = require('./models/artist')
const Refund = require('./models/refund')
const User = require('./models/user')
const ChatMsg = require('./models/chat')
const Watchtime = require('./models/watchtime')
const Feedback = require('./models/feedback')
const Discount = require('./models/discount')
const Purchase = require('./models/purchase')
const postRoutes = require('./routes/posts')
const artistRoutes = require('./routes/artists')
const accountRoutes = require('./routes/account')
const uploadRoutes = require('./routes/upload')
const paymentRoutes = require('./routes/payments')
const catchAsync = require('./utility/catchAsync')
const { authorize, checkUser } = require('./middleware/authMiddleware')
const mongoose = require('mongoose');
const { func } = require("joi")
const { Console } = require('console')


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo is working, connection is now open")
    })
    .catch(err => {
        console.log("OH NO ERROR WITH MONGO!!!!")
        console.log(err)
    })

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.use(mongoSanitize());





const sessionOptions = {
    name: 'sid',
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //change to secure on deployment
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: + 1000 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionOptions))
app.use(flash())


app.use((req, res, next) => {
    res.locals.activeUser = req.cookies.uid
    res.locals.sp = req.flash('sp')
    res.locals.saa = req.flash('saa')
    res.locals.ad = req.flash('ad')
    res.locals.search = req.flash('search')
    res.locals.pd = req.flash('pd')
    res.locals.pnf = req.flash('pnf')
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
    res.locals.sir = req.flash('sir')
    res.locals.slo = req.flash('slo')
    res.locals.na = req.flash('na')
    res.locals.ntdaa = req.flash('ntdaa')
    res.locals.ahbb = req.flash('ahbb')
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
//asi = already signed in
//sir = sign in required
//slo = successfully logged out
//na = not authorized


app.use('/posts', postRoutes)
app.use('/artists', artistRoutes)
app.use('/account', accountRoutes)
app.use('/upload', uploadRoutes)
app.use('/pay', paymentRoutes)




    

        


//aws environment 
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
        const fullPath = `audio/${Date.now()}/` + Date.now() + "-" + file.originalname;
        ab_callback(null, fullPath);
    },
})
})




const stripe = require('stripe')(process.env.STRIPE_SECRET);


const oauth2client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 
    process.env.REDIRECT_URI)

    oauth2client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})



app.get('/', async (req, res) => {
  res.redirect('/posts')
})










app.get('/purchase-complete/post=:id', (req, res) => {
  return res.render('thanks-for-your-purchase')
})












app.post('/pay-fetch', async(req, res) => {
  try{
  console.log('request sent')
      console.log(req.body.pi)
  if(req.body.status === 'succeeded'){
    console.log('the redirect was made')
  }
  const uid = req.cookies.uid
  const pid = JSON.stringify(req.body.pi)
  console.log(pid)
  const paymentIntent = await stripe.paymentIntents.retrieve(
    req.body.pi
  );
  jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
    if(err){
        console.log('error for token verification')
        return res.render('artistShowUser', { artist }) 
    }
const userId = decodedToken.id
const user = await User.findById(userId)
  if(paymentIntent.status === 'succeeded'){
    const purchaseInfo = await Purchase.findOne({ intent_id: req.body.pi })
    if(purchaseInfo.successful === 'true'){
      console.log('already successful')
    }else{
    const puid = purchaseInfo.id

    //update the purchase in the database and register it as being successful
    const up = await Purchase.findByIdAndUpdate(puid, { successful: 'true' })
    
    
    //add money and purchase to concert table
    //push concert to users purchased content
    const post = await Concert.findById(up.post_id)
console.log(user.purchased_content.toString())
const userPurchases = user.purchased_content.toString()
    if (userPurchases.includes(post.id)){
      console.log('you have already purchased this content')
      return res.redirect('/sww')
    }else{

    const userSave = await User.findByIdAndUpdate(userId, {$push: {purchased_content: post.id}}, { runValidators: true, new: true });
    console.log('user update:', userSave)

    //add up revenue and add to total
    const currentRevenue = parseInt(post.revenue)
    const toAdd = parseInt(up.amount)
    const totalRevenue = parseInt(currentRevenue+toAdd)
    //upadte number of purchases and revenue
    const postUpdateRevenue = await Concert.findByIdAndUpdate(post.id, { revenue: totalRevenue})
    
    //update the number of purchase
    const currentNOP = parseInt(post.NOP)
    const totalNOP = parseInt(currentNOP+1)
    const postUpdateNop = await Concert.findByIdAndUpdate(post.id, { NOP: totalNOP})
    
    
    //update artist revenue    
    const artist = await Artist.findById(post.artId)
    const currentArtistRevenue = parseInt(artist.totalRevenue)
    const toAddtoArtist = parseInt(up.amount)
    const newArtistRevenue = parseInt(currentArtistRevenue+toAddtoArtist)
    
    const artistRevenue = await Artist.findByIdAndUpdate(post.artId, { totalRevenue: newArtistRevenue })

    //update artists number of sales
    const currentNOS = parseInt(artist.number_of_sales)
    const totalNOS = parseInt(currentNOS+1)

    const artistNOS = await Artist.findByIdAndUpdate(post.artId, { number_of_sales: totalNOS })
    console.log('done')
  }}}})}catch(e){
    console.log(e)
    return res.redirect('/posts')
  }// }
})



























app.get('/create-discount', (req, res) => {
  try{
    const uid = req.cookies.uid
    if(uid == null || undefined){
      console.log('no uid')
        return res.redirect('/posts')
    }
    jwt.verify(uid, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
      const id = decodedToken.id
      const user = await User.findById(id)
      const userId = user.id
      if(err){
          console.log('error for token verification')
          return res.redirect('/posts')
      }
      if(!user || user == undefined || null){
          console.log('no user')
          return res.redirect('/posts')
      }
      const findDiscount = await Discount.findOne({ user_id: userId })
      if(findDiscount == null || undefined){
        const createDiscount = new Discount()
        createDiscount.user_id = userId
        createDiscount.percent_off = 20
        createDiscount.multiplier = 0.2
        createDiscount.percent_off = 20
        createDiscount.code = 'virt100'
        createDiscount.created = Date.now() 
        createDiscount.expires = Date.now() + 2592000
        await createDiscount.save()
        return res.send(createDiscount)
    }else{
      return res.send('you already have a coupon')
    }})}catch(e){
    return res.send(e)
  }})




app.post('/save-time', (req, res) => {
  console.log(req.body.timeReached)
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
      const timeReached = req.body.timeReached
      const findTime = await Watchtime.findOne({user: '62c6b73d0ec25891c6106c9d', post_id: '633adf8a3d9c517cd3bf7d01'})
      if(findTime == null || undefined){
      const saveTime = new Watchtime()
      saveTime.user = id
      saveTime.time = timeReached
      saveTime.post_id = '633adf8a3d9c517cd3bf7d01'
      await saveTime.save()
      }else{
      console.log('updating time')
      const updateTime = await Watchtime.findByIdAndUpdate(findTime.id, { time: timeReached }, { runValidators: true, new: true })
      }
        console.log('save to db reached')
}})
  }catch(e){
  console.log(e)
  return res.redirect('/posts')
  }
})

app.get('/audio', async (req, res) => {
  try{

    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.BUCKET_TWO,
      Key: 'audio/1662198790256/1662198790256-serum test song.mp3',
      Expires: 10800
  });

  console.log(url);
  const time = 2500
  return res.render('audio', { url, time })
  }catch(e){
    res.send('oh no')
  }
})






app.post('/send-feedback', (req, res) => {
  try{
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
  const allowedCharsFeedback = /^[a-zA-Z0-9 &()_.',"!-]{10,350}$/
  const feedback = req.body.further_feedback
  console.log(feedback)
  const validFeedback = allowedCharsFeedback.test(feedback)

  if(validFeedback){
    console.log('valid feedback')
  }if (!validFeedback){
      console.log('invalid feedback')
  }})}catch(e){
    console.log(e)
  }
})

















//subscription







const YOUR_DOMAIN = 'http://localhost:3000';


app.get('/sub', async (req, res) => {
    return res.render('sub')
})

app.get('/thanks-for-your-purchase/?session_id={CHECKOUT_SESSION_ID}', async (req, res) => {
  const CHECKOUT_SESSION_ID = req.params
  console.log(CHECKOUT_SESSION_ID)
})


app.post('/create-checkout-session-tier-1',authorize, checkUser, async (req, res) => {
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
    const prices = await stripe.prices.list({
      lookup_keys: [req.body.lookup_key],
      expand: ['data.product'],
    });
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: 'price_1LFZmmEnftAKbusCZie0tQwg',
          // For metered billing, do not pass quantity
          quantity: 1,
  
        },
      ],
      mode: 'subscription',
      metadata: {tier: 1},
      subscription_data: {
        trial_period_days: 30
      },
      success_url: `${YOUR_DOMAIN}/thanks-for-your-purchase-tier-1`,
      cancel_url: `${YOUR_DOMAIN}/posts`,
      payment_intent_data: {
    }});
    const userSave = await User.findByIdAndUpdate(id, { account_sub: session.id}, { runValidators: true, new: true });
    return res.redirect(303, session.url);
  });
  









  app.post('/create-checkout-session-tier-2',authorize, checkUser, async (req, res) => {
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
      const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
      });
      const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: 'price_1LFZoCEnftAKbusCcR6swtTK',
            // For metered billing, do not pass quantity
            quantity: 1,
    
          },
        ],
        mode: 'subscription',
        metadata: {tier: 2},
        success_url: `${YOUR_DOMAIN}/thanks-for-your-purchase-tier-2`,
        cancel_url: `${YOUR_DOMAIN}/posts`,
        payment_intent_data: {
      }});
      const userSave = await User.findByIdAndUpdate(id, { account_sub: session.id}, { runValidators: true, new: true });
      return res.redirect(303, session.url);
    });


















    app.post('/create-checkout-session-tier-3',authorize, checkUser, async (req, res) => {
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
        const prices = await stripe.prices.list({
          lookup_keys: [req.body.lookup_key],
          expand: ['data.product'],
        });
        const session = await stripe.checkout.sessions.create({
          billing_address_collection: 'auto',
          line_items: [
            {
              price: 'price_1LFZpkEnftAKbusC6R79Cr5h',
              // For metered billing, do not pass quantity
              quantity: 1,
      
            },
          ],
          mode: 'subscription',
          metadata: {tier: 3},
          success_url: `${YOUR_DOMAIN}/thanks-for-your-purchase-tier-3`,
          cancel_url: `${YOUR_DOMAIN}/posts`,
          payment_intent_data: {
        }});
        const userSave = await User.findByIdAndUpdate(id, { account_sub: session.id}, { runValidators: true, new: true });
        return res.redirect(303, session.url);
      });

















  app.post('/create-portal-session', async (req, res) => {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = YOUR_DOMAIN;
  
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });
  
    res.redirect(303, portalSession.url);
  });
  
  app.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    (request, response) => {
      let event = request.body;
      // Replace this endpoint secret with your endpoint's unique secret
      // If you are testing with the CLI, find the secret by running 'stripe listen'
      // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
      // at https://dashboard.stripe.com/webhooks
      const endpointSecret = 'whsec_12345';
      // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = request.headers['stripe-signature'];
        try {
          event = stripe.webhooks.constructEvent(
            request.body,
            signature,
            endpointSecret
          );
        } catch (err) {
          console.log(`⚠️  Webhook signature verification failed.`, err.message);
          return response.sendStatus(400);
        }
      }
      let subscription;
      let status;
      // Handle the event
      switch (event.type) {
        case 'customer.subscription.trial_will_end':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription trial ending.
          // handleSubscriptionTrialEnding(subscription);
          break;
        case 'customer.subscription.deleted':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription deleted.
          // handleSubscriptionDeleted(subscriptionDeleted);
          break;
        case 'customer.subscription.created':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription created.
          // handleSubscriptionCreated(subscription);
          break;
        case 'customer.subscription.updated':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription update.
          // handleSubscriptionUpdated(subscription);
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }
      // Return a 200 response to acknowledge receipt of the event
      response.send();
    }
  );

app.post('/cancel-subscription', async (req, res) => {
    const deleted = await stripe.subscriptions.del(
        'sub_1LFJK3EnftAKbusCjM23vDl3'
      );
      console.log(deleted)
})





























app.get('/thanks-for-your-purchase-tier-1', authorize, checkUser, async (req, res) => {
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
    const session = await stripe.checkout.sessions.retrieve(
      user.account_sub
    );
    const tier = session.metadata.tier
    if(session.subscription && session.payment_status == 'paid' && session.payment_status == 'paid' && session.subscription && session.success_url == `${YOUR_DOMAIN}/thanks-for-your-purchase-tier-1`){
      const tier = 1
      const userSave = await User.findByIdAndUpdate(req.cookies.id, { account_sub: session.subscription}, { runValidators: true, new: true });
      const userSaveTier = await User.findByIdAndUpdate(req.cookies.id, { account_tier: tier}, { runValidators: true, new: true });
      return res.render('thanks-for-your-purchase')
    }else{
      res.send('bad')
    }}catch(e){
      return res.redirect('/posts')
    }
})



















app.get('/thanks-for-your-purchase-tier-2', authorize, checkUser, async (req, res) => {
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
    const session = await stripe.checkout.sessions.retrieve(
      user.account_sub
    );
    if(session.payment_status == 'paid' && session.subscription && session.success_url == `${YOUR_DOMAIN}/thanks-for-your-purchase-tier-2`){
      const tier = 2
      const userSave = await User.findByIdAndUpdate(req.cookies.id, { account_sub: session.subscription}, { runValidators: true, new: true });
      const userSaveTier = await User.findByIdAndUpdate(req.cookies.id, { account_tier: tier}, { runValidators: true, new: true });
      return res.render('thanks-for-your-purchase')
    }else{
      res.send('bad')
    }}catch(e){
      console.log(e)
    }
})

























app.get('/thanks-for-your-purchase-tier-3', authorize, checkUser, async (req, res) => {
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
    const session = await stripe.checkout.sessions.retrieve(
      user.account_sub
    );
    console.log(session)
    const tier = session.metadata.tier
    if(session.subscription && session.payment_status == 'paid' && session.payment_status == 'paid' && session.subscription && session.success_url == `${YOUR_DOMAIN}/thanks-for-your-purchase-tier-3`){
      const tier = 3
      const userSave = await User.findByIdAndUpdate(req.cookies.id, { account_sub: session.subscription}, { runValidators: true, new: true });
      const userSaveTier = await User.findByIdAndUpdate(req.cookies.id, { account_tier: tier}, { runValidators: true, new: true });
      return res.render('thanks-for-your-purchase')
    }else{
      res.send('bad')
    }}catch(e){
      return res.redirect('/posts')
    }
})



































app.get('/something-went-wrong', (req, res) => {
  return res.render('sww')
})

app.get('/test-refund', async (req, res) => {
  const refund = await stripe.refunds.create({
    payment_intent: 'pi_3LvLJjEnftAKbusC1CDerZYa',
    reverse_transfer: true
  });
  return res.send(refund)
})



//payment routes


app.get('/basket', async (req, res) => {
    if (req.cookies.id && req.cookies.vt == null || undefined){
        req.flash('sir', 'you must be signed in')
        return res.redirect('/account/sign-in')
    }
    try{
        const { genre } = req.query;

    if(genre){
        const Concerts = await Concert.find({ genre })
        res.render('basket', { Concerts })
    }else {
        const Concerts = await Concert.find({})
        res.render('basket', { Concerts })
    }
}catch(e){
    req.flash('paynf', 'sorry, the concert you are looking for could not be found')
    res.redirect(`/posts/${concert._id}`)
}
})








app.get('/posts/:id/purchase', async (req, res) => {
  try{
    const { id } = req.params
    const concert = await Concert.findById(id)
    const uid = req.cookies.uid
    const artistId = concert.artId
    const artist = await Artist.findById(artistId)
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
  // if(user.purchased_content.includes(concert.id)){
  //   return res.redirect('/posts')
  // }
  if(user.cus_id == null || undefined){
      const customer = await stripe.customers.create({
      email: user.email,
      })
      const cus_id = customer.id
      const userSave = await User.findByIdAndUpdate(userId, { cus_id: customer.id}, { runValidators: true, new: true });
  }
  const stripe_acct = artist.stripe_acct
  const totalPrice = concert.price*100
    const intent = await stripe.paymentIntents.create({
    amount: Math.floor(totalPrice),
    currency: 'usd',
    automatic_payment_methods: {enabled: true},
    customer: user.cus_id,
    application_fee_amount: Math.floor(totalPrice*0.25),
    transfer_data: {
      destination: stripe_acct,
    },
    });
    // const purchase = new Purchase()
    // purchase.email = user.email
    // purchase.refunded = 'false'
    // purchase.country = 'usa'
    // purchase.user_id = user.id
    // purchase.post_id = concert.id
    // purchase.currency = 'usd'
    // purchase.successful = 'false'
    // purchase.cus_id = user.cus_id
    // purchase.post = concert
    // purchase.amount = concert.price
    // purchase.artist = artist
    // purchase.intent_id = intent.id
    // await purchase.save()
    const up = await Purchase.runCommand
    const pid = intent.id
    // console.log(purchase)
   return res.render('checkout', { client_secret: intent.client_secret, pid, concert, artist, totalPrice})
})}
catch(e){
  console.log(e)
}})




app.post('/posts/:id/purchase/discount', async (req, res) => {
  try{
    const { id } = req.params
    var  code  = req.body.code
    console.log(code)
    console.log(req.body)
    const concert = await Concert.findById(id)
    const uid = req.cookies.uid
    const artistId = concert.artId
    const artist = await Artist.findById(artistId)
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
    // if(user.purchased_content.includes(concert.id)){
    //   return res.redirect('/posts')
    // }


    //check if user is in possesion of the discount
    const foundDiscount = await Discount.findOne({code: code, user_id: userId})
    if(foundDiscount == null || undefined){
      res.send('discount not found')
    }
    if(user.cus_id == null || undefined){
        const customer = await stripe.customers.create({
        email: user.email,
        })
        const cus_id = customer.id
        const userSave = await User.findByIdAndUpdate(userId, { cus_id: customer.id}, { runValidators: true, new: true });
    }
    const stripe_acct = artist.stripe_acct
    const price = concert.price
    const stripePrice = price*100
    const moneyOff = price*100*foundDiscount.multiplier
    const totalPrice = stripePrice - moneyOff
    const originalPrice = price
    const displayPercent_off = foundDiscount.percent_off
    const displayPrice = totalPrice/100
      const intent = await stripe.paymentIntents.create({
      amount: Math.floor(totalPrice),
      currency: 'usd',
      automatic_payment_methods: {enabled: true},
      customer: user.cus_id,
      application_fee_amount: Math.floor(totalPrice*0.25),
      transfer_data: {
        destination: stripe_acct,
      },
      });
      const purchase = new Purchase()
      purchase.email = user.email
      purchase.refunded = 'false'
      purchase.country = 'usa'
      purchase.user_id = user.id
      purchase.post_id = concert.id
      purchase.currency = 'usd'
      purchase.successful = 'false'
      purchase.cus_id = user.cus_id
      purchase.post = concert
      purchase.amount = displayPrice
      purchase.artist = artist
      purchase.discount_code = code
      purchase.percent_off = foundDiscount.multiplier*100
      purchase.intent_id = intent.id
      await purchase.save()
      const up = await Purchase.runCommand
      const pid = intent.id
     return res.render('checkout', { client_secret: intent.client_secret, pid, concert, artist, displayPrice, originalPrice, displayPercent_off})
})}
catch(e){
  console.log(e)
}})









app.get('/thanks-for-your-purchase/:id', async (req, res) => {
    const { id } = req.params
    const concert = await Concert.findById(id)
    const user = await User.findById(req.cookies.id)
    const artistId = concert.artId
    const artist = await Artist.findById(artistId)
    const purchase = await Purchase.findOne({user_id: user.id, concert_id: concert.id})
    const intent = await stripe.paymentIntents.retrieve(
        purchase.intent_id
    )
    console.log(intent)
    if(intent.amount_capturable === parseInt(purchase.amount * 100)){
      concert.NOP +1
      concert.revenue + concert.price*0.35
    const userSave = await User.findByIdAndUpdate(req.cookies.id, {$push: {purchased_content: concert}}, { runValidators: true, new: true });
    }
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
      ejs.renderFile("views/purchase-email.ejs",  { user }, { name: 'test' }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'virtconcerts@gmail.com',
                to: user.email,
                subject: 'thanks for your purchase',
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
    console.log(intent)
    return res.render('thanks-for-your-purchase')
})


app.post('/login', async (req, res) => {
  const loginLink = await stripe.accounts.createLoginLink(
    'acct_1LMwxTRLLwgkiIkP'
  );
  console.log(loginLink.url)
  return res.redirect(loginLink.url)
})














































//stripe connect



app.get('/stripe-connect-terms', (req, res) => {
  return  res.render('stripe-account-terms')
})































































































//auth


app.get('/verify', async (req, res) => {
try{
  const { id } = req.cookies.id
  const Artists = await Artist.find({})
  const user = req.cookies.id
  return res.render('verify', { Artists })
  }catch(e){
      req.flash('sir', 'nice try lol')
      res.redirect('/posts')
      console.log(e)
  }
})



app.get('/verify/:id', async (req, res) => {
  const user = req.cookies.id
  try{
      const { id } = req.params
      const artist = await Artist.findById(id)
      return res.render('verify-form', { artist })
  }catch(e){
      return res.redirect('/posts')
      console.log(e)
  }})

app.patch('/verify/:id', async (req, res) => {
  try{
      const { id } = req.params
      const user = req.cookies.id
      const artist = await Artist.findByIdAndUpdate(id, { isVerified: true }, { runValidators: true, new: true });
      console.log(artist)
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
          ejs.renderFile("views/verified-email.ejs",  { artist }, { name: 'test' }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'virtconcerts@gmail.com',
                    to: artist.artEmail,
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
      return res.redirect('/verify')
  }catch(e){
      return res.redirect('/posts')
  }
})



app.get('/ban', async (req, res) => {
try{
  const  id  = req.cookies.id
  const Artists = await Artist.find({})
  const user = req.cookies.id
  return res.render('ban', { Artists })
  }catch(e){
      res.redirect('/posts')
      console.log(e)
  }
})

app.get('/ban-user/:id', async (req,res) => {
  const user = req.cookies.id
  try{
      const { id } = req.params
      const artist = await Artist.findById(id)
      res.render('ban-form', { artist, user})
  }catch(e){
      console.log(e)
}})


app.post('/ban-user/:id', async (req, res) => {
  try{
      const { id } = req.params
      const user = req.cookies.id
      const artist = await Artist.findById(id)
      artist.banned = 'true'
      const reason = req.body.reason
      artist.save()
      console.log(artist)
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
          ejs.renderFile("views/banned-email.ejs",  { reason, artist }, { name: 'test' }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'virtconcerts@gmail.com',
                    to: "r6tazer@gmail.com",
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
});
      req.flash('ahbb', "account has been banned")
      return res.redirect('/ban')
  if(!user){
     return res.redirect('/sign-in')
  }}catch(e){
      console.log(e)
      return res.redirect('/posts')
  }
})


app.get('/unban', async (req, res) => {
try{
  const { id } = req.cookies.id
  const { genre } = req.query;
  const { search } = req.query;
  const Artists = await Artist.find({})
  const user = req.cookies.id
  if(genre){
      const Artists = await Artist.find({ genre })
      return res.render('unban', { Artists })
  }
  if(search){
          const Artists = await Artist.find({ title: {$regex:search}});
          return res.render('unban', { Artists })
  }
  if(!search || search == ''){
              const Artists = await Artist.find({})
              return res.render('unban', { Artists })
  }
  if(genre && search){
      const Artists = await Artist.find({ genre })
      return res.render('unban', { Artists })
  }
  if(!genre || genre == 'all'){
      const Artists = await Artist.find({})
      return res.render('unban', { Artists })
  }}catch(e){
     return res.redirect('/posts')
      console.log(e)
  }
})


app.patch('/unban/:id', async (req, res) => {
try{
  const { id } = req.params;
  const artist = await Artist.findById(id)
  artist.banned = 'false'
  artist.save()
  res.redirect(`/artists${artist._id}`)
  }catch(e){
      console.log(e)
      return res.redirect('/unban')
  }})





app.post('/cookies-refuse', (req, res) => {
  const createToken = (id) => {
    return jwt.sign({ id }, 'e445_@678u&6oij3knps630(isyjeh', {
    expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 1
    })
}
const token = createToken('rejected')
res.cookie('consent', token, { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
  maxAge: + 1000 * 60 * 60 * 24 * 1 })
  jwt.verify(token, 'e445_@678u&6oij3knps630(isyjeh', async (err, decodedToken) => {
    if(err){
        return res.redicrect('/account/sign-in')
    }else{
        console.log(decodedToken.id)
    }     
})
return res.redirect('/posts')
})

app.post('/cookies-accept', (req, res) => {
  res.cookie('cookies', 'accepted', { httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
    maxAge: + 1000 * 60 * 60 * 24 * 1 })
    return res.redirect('/posts')
})

  app.get('/greet', async (req, res) => {
    try{
    const id  = req.cookies.id
    const user = await User.findById(id)
    console.log(id)
    return res.send(`hello ${user.username}`)
    }catch(e){
    console.log(e)
    return res.redirect('/posts')
    }
})







app.post('/post-chat/:id', async (req, res) => {
  const { id } = req.params
  const post = await Concert.findById(id)
  const uid = req.cookies.id
  const user = await User.findById('62c6b73d0ec25891c6106c9d')
  console.log(req.body)
  console.log(req.body.message)
  const msg = req.body.messsage
  const chat = new ChatMsg()
  chat.userEmail = user.email
  chat.displayName = user.username
  chat.message = req.body.message
  chat.doc = Date.now()
  chat.post_id = id
  await chat.save()
  console.log(post)
  return res.redirect(`/posts/${post.id}`)
})


//error handling

app.get('/error', (req, res) => {
    throw new Error('an error has occured')
})

//all

app.use((req, res) => {
    res.redirect('/posts')
})

app.use((err, req, res) => {
    res.redirect('/posts')
})

app.use((err, req, res) => {
    res.redirect('/posts')
})

app.get('*', (req, res) => {
    res.redirect('/posts')
})

const PORT = 3000

app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})