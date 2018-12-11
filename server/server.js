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

    console.log('request', req.body);
     try{
         const body = req.body;
         console.log('***body***', body);
         const user = new User(body);
         console.log('***user***', user);
         await user.save();
         res.send(user.appFriends);
     } catch (e) {
         res.status(400).send(e);
     }
});

app.listen(port,() =>{
    console.log(`Started up at port ${port}`);

});

module.exports = {app};
