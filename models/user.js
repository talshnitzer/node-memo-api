
var {mongoose} = require('../db/mongoose.js');
const validator = require('validator');
const jwt = require('jsonwebtoken');


// console.log('*mongoose', mongoose);
// console.log('**ObjectId', ObjectId);
// console.log('***validator', validator);

var UserSchema = new mongoose.Schema({
    appId: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        dropDups: true 
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        trim: true,
        minlength: 1,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    phoneNum: {
        type: String,
        trim: true,
        minlength: 1
    },
    appFriends: [String],
    friends_id: [String],
    token: {
        type: String,
        required: true
    }
});

UserSchema.statics.getFriends = async function(_id) {
    
        var User = this;
        var user = await User.findOne({_id});
        if (!user) {
            console.log('***user not found');
            throw new Error('user not found');    
        }
        return user.friends_id;
    }; 



UserSchema.statics.upsertFbUser = async function(req,accessToken, refreshToken, profile, cb) {
    var User = this;
    var err = "";
    console.log('upsert user , profile: ', profile);

    var user = await User.findOne({
            'appId': profile.id
    });
   console.log('upsert user, user', user);

    // no user was found, lets create a new one
    if (!user && req.url=== '/auth/facebook/token') {
        console.log('upsert user, 1st if, req.url', req.url);
        var newUser = new User({
                email: profile.emails[0].value,
                fullName:profile.displayName,
                appId: profile.id,
                phoneNum: req.body.phoneNum,
                appFriends: req.body.appFriends
        });
            return cb(err, newUser);
    } else if (user && req.url==='/users/login') {
        console.log('upsert user - login, req.body:',req.body);
        
        return cb(err, user);
    } else {
        console.log('upsert user last if req.url', req.url);
        return cb(err, user);
    }
}    

UserSchema.statics.findByToken = function (token)  {
    var User = this; //(instance methods get called with the individual document)
                     // *model* methods get called with the model as the 'this' binding
    var decoded;
    console.log('find by token -  token',  token, typeof token);
    try{  //we want to catch error result fron decode and do something with it
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        // return new Promise((resolve, reject) => {
        //     reject();
        // });
        console.log('find by token - decode error',e );
        return Promise.reject(); //same as lines in comment above       
    }
    console.log('find by token - decoded, decoded.id, decoded._id: ', decoded, decoded.id, decoded._id);
    return User.findOne({
        '_id': decoded._id,
        'token': token
    }); //return a promise.need to return that in order to add some chaining.
                          //so we can add a then call on to find by token over in serve.js

};

const User = mongoose.model('User', UserSchema);
// mongoose.connection.db.collection('userCollection').insert({
//     username: 'user1',
//     firstName: 'Steve',
//     lastName: 'LastName', 
//   });

// Model_name.collection.insertMany(array, { ordered: false },function(err, success){
//     console.log(success);
// });
User.createIndexes();
module.exports = {User};