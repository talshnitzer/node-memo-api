require('../config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');


const {ObjectId} = require('mongodb');
const {User} = require('../../models/user.js');
const {Memo, MemoSchema} = require('../../models/memo');
const {appId2DbId} = require('./conversion');
const {categories} = require('../../models/category.js');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const app = express();


app.use(bodyParser.json());
app.use(passport.initialize());
//app.use(passport.session());

var FacebookTokenStrategy = require('passport-facebook-token');

FacebookTokenStrategy.passReqToCallback = true;  
passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    passReqToCallback: true,
    fbGraphVersion: 'v3.0'
  }, function(req, accessToken, refreshToken, profile, done) {
      console.log('^^^^^passport fb token, req.url, req.Url : ', req.url, req.Url);
    User.upsertFbUser(req,accessToken, refreshToken, profile, function (err,user) {
        console.log('error, user:  ', err, user);
            return done(err,user);     
    });
  }
));

var createToken = function(auth) {
    return jwt.sign({
      _id: auth.id
    }, process.env.JWT_SECRET,
    {
      expiresIn: 60 * 420
    });
  };
  
  var generateToken = async function (req, res, next) {
    req.token = createToken(req.auth);
    if (req.url=== '/auth/facebook/token') {
        const user = new User(_.assignIn(req.user,{token: req.token}));
        try {
            await user.save();
        } catch (e ){
            console.log(e);
        }
    } else {
        var user = req.user;
        var userId = req.user._id;
        req.body.friends_id = req.user.friends_id;
        req.body.token = req.token;
        await user.updateOne({$set: req.body});
        req.body._id = userId;
        req.user = req.body;
    }  
    next();
  };
  
  var sendToken = function (req, res) {
    res.setHeader('x-auth-token', req.token);
    var user = _.pick(req.user, ['_id','fullName','appId','email', 'phoneNum','appFriends','friends_id']);
    res.status(200).send(user);
  };

//   var authenticate = expressJwt({
//     secret: process.env.JWT_SECRET,
//     requestProperty: 'auth',
//     getToken: function(req) {
//       if (req.headers['x-auth-token']) {
//         return req.headers['x-auth-token'];
//       }
//       return null;
//     }
//   });

var authenticate = (req,res,next) => {
    var token = req.header('x-auth-token');

    User.findByToken(token).then((user) => {
        if (!user){
            console.log('find by token no such user ');
          return Promise.reject();  
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send('user not found');
    });
};





  

//   app.post('/memos/create',authenticate,async (req,res)=>{
//     try{
//         var body = req.body;
//         body._creatorId = req.user._id;
//         var duplicateMemo = await Memo.findOne({_creatorId: body._creatorId, placeId: body.placeId});
//         if (duplicateMemo) {
//            res.status(400).send('duplicate memo, not inserted to db') ;
//            return;
//         }
//         var memo = new Memo(body);   
//         var doc = await memo.save();
//         res.send(doc);
//     }   catch (e) {
//         res.status(400).send(e);
//     }   
// });

//   function (req, res) {
//     var body = _.pick(req.body, ['text', 'completed']);
//       console.log('@@@@in facebook token route');
//       if (req.user){
        
//       }
//     res.send(req.user? 200 : 401);
//     //res.send({req});
//   }
// );

module.exports = {createToken, generateToken, sendToken, authenticate, passport};
