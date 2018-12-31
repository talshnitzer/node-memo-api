require('../server/config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('../db/mongoose.js');
const {ObjectId} = require('mongodb');
const {User} = require('../models/user.js');
const {Memo} = require('../models/memo');

const app = express();
const port = process.env.PORT;

var errorToSend = {};

app.use(bodyParser.json());

//POST memos
//to add authentication of user
//add getting _creatorId from authentication method

app.post('/memos/create',async (req,res)=>{
    try{
        var body = req.body;
        var memo = new Memo(body);
        //memo._creator = req._creatorId;   
        var doc = await memo.save();
        res.send(doc);
    }   catch (e) {
        res.status(400).send(e);
    }   
});

//GET all my memos
app.get('/memos/:userId', async (req,res) => {
    try{
        console.log('req userId***', req.params.userId);
        var memos = await Memo.find({
            _creatorId: req.params.userId
        });
        console.log('memos*******',memos);
        if (!memos){
            return res.status(404).send('no memos found');
        }
        res.send({memos});
    } catch (e) {
        res.status(400).send(400,e);
    }    
});

app.post('/users/signup', async (req, res) => {

     try{
         const body = req.body;
         const user = new User(body);
         await user.save();
         //res.send(user.appFriends);
         var userIdFriends = {_id: user._id,
                                appFriends: user.appFriends};
         res.send(userIdFriends);
     } catch (e) {
        errorToSend.errorCode =  400;
        errorToSend.errorMessage = e.errmsg;
         res.status(errorToSend.errorCode).send(errorToSend);
     }
});


//Login - existing user get token and get updated
app.post('/users/login', async (req,res)=> {
    
    try{
        const body = req.body;
        const updatedUser = await User.findOneAndUpdate({facebookId: body.facebookId},{$set: body}, {new: true});
        if (!updatedUser) {
            errorToSend.errorCode =  404;
            errorToSend.errorMessage = 'User not found';
            return res.status(errorToSend.errorCode).send(errorToSend);
        }
        res.send({appFriends: updatedUser.appFriends, _id: updatedUser._id});
    } catch (e) {
        errorToSend.errorCode =  400;
        errorToSend.errorMessage = e.errmsg;
        res.status(400).send(errorToSend);
    }
});

app.listen(port,() =>{
    console.log(`Started up at port ${port}`);

});

module.exports = {app};
