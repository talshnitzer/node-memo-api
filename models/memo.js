const mongoose = require('mongoose');

var MemoSchema = new mongoose.Schema({
    _creatorId: {
        type: [String],
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
        type: [String],
        trim: true
    },
    image: {
        type: [String]
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
    },
    placeId: {
        type: String,
        trim: true
    }
});

MemoSchema.statics.findMyMemos = async function(_id, category){
    var Memo = this;
    if (!category) {
        var memos = await Memo.find({
            _creatorId: _id
        });
    } else {
        var memos = await Memo.find({
            _creatorId: _id,
            category: category
        });
    }
    
    return memos;
};

MemoSchema.statics.findUserMemos = async function(_id, isPrivate, category) {
var Memo = this;
if (!category) {
    var memos = await Memo.find({
        _creatorId: _id,
        isPrivate: isPrivate
    });
} else {
    var memos = await Memo.find({
        _creatorId: _id,
        isPrivate: isPrivate,
        category: category
    });
}

return memos;
};

MemoSchema.statics.findManyUsersMemos = async function (usersIds, category) {
    var friendsMemos = [];
    for (const usersId of usersIds) {
        const publicMemos = await Memo.findUserMemos(usersId, false, category);
        friendsMemos = friendsMemos.concat(publicMemos);
    }
    return friendsMemos;
};


//Merging memos with same placeId after each new memo save
MemoSchema.post('save', async function () {
    var memo = this;
    if (memo.isPrivate === false) {
        var merged_memo = await Memo.findOneAndUpdate({placeId: memo.placeId,
                    category: memo.category,
                    _id: {$ne: memo._id },
                    isPrivate: false
                    },
        {
        $push: {"_creatorId": memo._creatorId,
            "memoText": memo.memoText,
            "image": memo.image
            }
        }, {new: true});
        if (merged_memo) {await Memo.remove(memo);}

    }   
}); 


var Memo = mongoose.model('Memo', MemoSchema);

module.exports = {Memo};