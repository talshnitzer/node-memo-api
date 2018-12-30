const mongoose = require('mongoose');

var MemoSchema = mongoose.Schema({
    _creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    memoName: {
        type: String,
        require: true,
        trim: true,
        minlength: 1
    },
    address: {
        type: String,
        require: true,
        trim: true
    },
    country: {
        type: String,
        require: true,
        trim: true
    },
    city: {
        type: String,
        require: true,
        trim: true
    },
    longitute:{
        require: true,
        type: Number
    },
    latitude: {
        require: true,
        type: Number        
    },
    memoText: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    phoneNum: {

    },
    category: {
        require: true,
        type: Number,
        min: 0,
        max: 99
    },
    isPrivate: {
        type: Boolean,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

var Memo = mongoose.model('Memo', MemoSchema);
module.exports = {Memo};