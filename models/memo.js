const mongoose = require('mongoose');

var MemoSchema = new mongoose.Schema({
    _creatorId: {
        type: String,
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

MemoSchema.statics.findMyMemos = async function(_id){
    var Memo = this;
    var memos = await Memo.find({
        _creatorId: _id
    });
    return memos;
};

MemoSchema.statics.findUserMemos = async function(_id, isPrivate) {
var Memo = this;
var memos = await Memo.find({
    _creatorId: _id,
    isPrivate: isPrivate
});
return memos;
};

MemoSchema.statics.findManyUsersMemos = async function (usersIds) {
    var friendsMemos = [];
    for (const usersId of usersIds) {
        const publicMemos = await Memo.findUserMemos(usersId, false);
        friendsMemos = friendsMemos.concat(publicMemos);
    }
    return friendsMemos;
};

var Memo = mongoose.model('Memo', MemoSchema);

module.exports = {Memo};