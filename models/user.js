
var {mongoose} = require('../db/mongoose.js');
const validator = require('validator');


// console.log('*mongoose', mongoose);
// console.log('**ObjectId', ObjectId);
// console.log('***validator', validator);

var UserSchema = new mongoose.Schema({
    facebookId: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
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
    appFriends: [String]
});

const User = mongoose.model('User', UserSchema);


module.exports = {User};