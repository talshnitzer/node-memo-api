require('../server/config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('../db/mongoose.js');
const {ObjectId} = require('mongodb');
const {User} = require('../models/user.js');

const app = express();
const port = process.env.PORT;

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
         var message = {errorCode: 400, errorMessage: e.errmsg, };
         res.status(400).send(message);
     }
});

app.listen(port,() =>{
    console.log(`Started up at port ${port}`);

});

module.exports = {app};
