require('../server/config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('../db/mongoose.js');
const {ObjectId} = require('mongodb');
const {User} = require('../models/user.js');
const {Memo, MemoSchema} = require('../models/memo');
const {appId2DbId} = require('./../server/middleware/conversion');
const {categories} = require('./../models/category.js');
const {createToken, generateToken, sendToken, authenticate, passport} = require('./../server/middleware/authentication');

const app = express();
const port = process.env.PORT;

var errorToSend = {};

app.use(bodyParser.json());

//POST memos
//to add authentication of user
//add getting _creatorId from authentication method

app.post('/auth/facebook/token',
  passport.authenticate('facebook-token',{session: false}),
  async function(req, res, next) {
    if (!req.user) {
        console.log('/auth/facebook/token - User Not Authenticated, req.body:', req.body);
      return res.send(401, 'User Not Authenticated');
    }
   
    // prepare token for API
    req.auth = {
      id: req.user.id
    };

    next();
  },appId2DbId, generateToken, sendToken);

  app.post('/users/login',
  passport.authenticate('facebook-token',{session: false}),
  async function(req, res, next) {
    if (!req.user) {
      return res.send(401, 'User Not Authenticated');
    }
   
    // prepare token for API
    req.auth = {
      id: req.user.id
    };

    next();
  },appId2DbId, generateToken, sendToken);

app.post('/memos/create',authenticate,async (req,res)=>{
    try{
        var body = req.body;
        body._creatorId = req.user._id;
        var duplicateMemo = await Memo.findOne({_creatorId: body._creatorId, placeId: body.placeId});
        if (duplicateMemo) {
            console.log('%%%%post /memos/create duplicate memo- duplicateMemo, : body._creatorId, body.placeId', duplicateMemo);
           res.status(400).send('duplicate memo, not inserted to db') ;
           return;
        }
        var memo = new Memo(body);   
        var doc = await memo.save();
        res.send(doc);
    }   catch (e) {
        console.log('post /memos/create error. memo not saved. e: ', e);
        res.status(400).send(e);
    }   
});
//DELETE memo
app.post('/memos/delete',authenticate,async (req,res)=>{
    try{
        var reqMemoId = req.body._id;
        var req_creatorId = req.user._id;
        if(!ObjectId.isValid(reqMemoId)){
            return res.status(404).send('memo Id not valid');
        }
         //find memo
         var memo = await Memo.findOne({
                _id: reqMemoId,
                _creatorId: req_creatorId
            });
        if (!memo) {
                return res.status(404).send('memo not found');
        }
         //if not convereged - delete from DB
        if (memo._creatorId.length === 1) {
            console.log('***/memos/delete*** memo has 1 creator');
            try {
                await Memo.deleteOne({_id: reqMemoId});
            } catch (e) {
                throw e;
            }  
            return res.send({});
        }
         //if convereged memo - find it's place in array by finding _creatorId
         //delete only array items in this place
         memo.removeFromMemo(req_creatorId); 
         console.log('***/memos/delete*** memo has several creators removed items:',doc);     
        res.send({});
    }   catch (e) {
        res.status(400).send(e);
    }   
});

//UPDATE memo
app.post('/memos/update',authenticate,async (req,res)=>{
    try{
        const body = req.body;
        body.date = new Date();
        body._creatorId = req.user._id;
        console.log('***.memos/update/ body***', body);
    
        if(!ObjectId.isValid(body._id)){
            return res.status(404).send('memo Id not valid');
        }
         //find memo
         await Memo.findOne({
                _id: body._id,
                _creatorId: body._creatorId
            },(err, memo)=>{
                if (err || !memo ) {
                    return  res.status(404).send('memo not found');
                }
                //update one instance memo
                if (memo._creatorId.length === 1) {
                    memo.updateMemo(body).then((updatedMemo) => {
                        res.send(updatedMemo);
                    });     
                    //update more than one instance memo
                } else {
                    memo.updateConvergeMemo(body).then((updatedMemo) => {
                        res.send(updatedMemo);
                    });   
                }
            });

    }   catch (e) {
        res.status(400).send(e);
    }   
});

//paging function
var paging = async (myCollection, pagesToSkip, docsInPage) => {
    var results = {};
    try {
        var myCollectionModel = mongoose.model(myCollection, MemoSchema, myCollection);  
    } catch (e) {
        console.log('***paging error', e);
    }
    
    results.memos = await myCollectionModel.find({}).skip(pagesToSkip*docsInPage).limit(docsInPage);
    if (pagesToSkip === 0) {
        results.totalDocsNum =  await myCollectionModel.estimatedDocumentCount();
    }
    
    console.log('***paging result',results);
    return results;       
}


//GET all my memos
app.get('/memos', authenticate, async (req,res) => {
    try{
        const categoryString = req.query.category;
        const pageNumber = Number(req.query.pageNum);
        const limit = Number(req.query.limit);
        var category = categoryString? categoryString.split(',').map(Number) : categoryString;
        console.log('***server point 1');
        if (pageNumber === 0) {
            await Memo.findMyMemos(req.user._id.toString(), category);
        }
        var memos = await paging(req.user._id.toString(), pageNumber, limit);
        res.send({memos});
    } catch (e) {
        res.status(400).send(e);
    }    
});

//GET all  my friends memos
// app.get('/allMemos/:userId', async (req,res) => {
//     try{
//         const {category} = req.query;
//         //find user friends
//         const friends = await User.getFriends(req.params.userId);
//         //for each of user friend find all public memos of user
//         var friendsMemos = await Memo.findManyUsersMemos(friends, category);
//         // var myMemos = await Memo.findMyMemos(req.params.userId);
//         // var allMemos = friendsMemos.concat(myMemos);
//         res.send({friendsMemos});

//         } catch (e) {
//             res.status(400).send(e);
//         }
//     });


    //GET my friends and my memos, around geopoint
app.get('/allMemos', authenticate, async (req,res) => {
    try{
        
        const categoryString = req.query.category;
        const category = categoryString ? categoryString.split(',').map(Number) : categoryString;
        const lat = req.query.lat;
        const long = req.query.long;
        const distance = req.query.distance;
        const isPrivate = false;
        const pageNumber = Number(req.query.pageNum);
        const limit = Number(req.query.limit);
       
        //find user friends
        const friends = await User.getFriends(req.user._id.toString());
        console.log('***friends***',friends );
        if (!lat || !long || !distance){
            //for each of user friend find all public memos of user
            if (pageNumber === 0) {
                await Memo.findManyUsersMemos(friends, category, req.user._id.toString());
            }  
            var friendsMemos = await paging(req.user._id.toString(), pageNumber, limit);
        } else {
            //for each of user friends find all public memos in 'distance' from 'long,lat' point
            console.log('found lat and long');
            var friendsMemos = await Memo.findMemosByGeopoint(friends, category, lat, long, distance, isPrivate, req.user._id.toString());
            console.log('***friendsMemos in server.js***' , friendsMemos);
        }
        res.send({friendsMemos});
        } catch (e) {
            res.status(400).send(e);
        }
    });
    
        
        
// app.post('/users/signup', appId2DbId, async (req, res) => {

//      try{
//          const body = req.body;
//          const user = new User(body);
//          await user.save();
//          var userIdFriends = {  _id: user._id,
//                                 appFriends: user.appFriends,
//                                 friends_id: user.friends_id,
//                                 categories: categories
//                             };
//          res.send(userIdFriends);
//      } catch (e) {
//         errorToSend.errorCode =  400;
//         errorToSend.errorMessage = e.errmsg;
//          res.status(errorToSend.errorCode).send(errorToSend);
//      }
// });


//Login - existing user  get updated
// app.post('/users/login', appId2DbId,async (req,res)=> {
    
//     try{
//         const body = req.body;
//         const updatedUser = await User.findOneAndUpdate({appId: body.appId},{$set: body}, {new: true});
//         if (!updatedUser) {
//             errorToSend.errorCode =  404;
//             errorToSend.errorMessage = 'User not found';
//             return res.status(errorToSend.errorCode).send(errorToSend);
//         }
//         res.send({
//                     appFriends: updatedUser.appFriends, 
//                     _id: updatedUser._id,
//                     friends_id: updatedUser.friends_id,
//                     categories: categories
//                 });
//     } catch (e) {
//         errorToSend.errorCode =  400;
//         errorToSend.errorMessage = e.errmsg;
//         res.status(400).send(errorToSend);
//     } 
// });

app.listen(port,() =>{
    console.log(`Started up at port ${port}`);
});

module.exports = {app};
