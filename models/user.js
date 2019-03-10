
var {mongoose} = require('../db/mongoose.js');
const validator = require('validator');


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
    friends_id: [String]
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



UserSchema.statics.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
            'appId': profile.id
    }, function(err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                    email: profile.emails[0].value,
                    fullName:profile.displayName,
                    //facebookProvider: {
                    appId: profile.id
                      // token: accessToken
                   // }
            });

            newUser.save(function(error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
        });
        } else {
            return cb(err, user);
        }
    });
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