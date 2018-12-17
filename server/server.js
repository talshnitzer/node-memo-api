require('../server/config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('../db/mongoose.js');
const {ObjectId} = require('mongodb');
const {User} = require('../models/user.js');

const app = express();
const port = process.env.PORT;

var errorToSend = {};

app.use(bodyParser.json());

app.post('/users', async (req, res) => {

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
            res.status(errorToSend.errorCode).send(errorToSend);
        }
        res.send({appFriends: updatedUser.appFriends, _id: updatedUser._id});
    } catch (e) {
        errorToSend.errorCode =  400;
        errorToSend.errorMessage = e.errmsg;
        res.send(400).send(errorToSend);
    }
});

app.listen(port,() =>{
    console.log(`Started up at port ${port}`);

});

module.exports = {app};
