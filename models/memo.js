const mongoose = require('mongoose');
const GeoPoint = require('geopoint');

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
        type: [Date],
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
    var isPrivate = false
    for (const usersId of usersIds) {
        const publicMemos = await Memo.findUserMemos(usersId, isPrivate, category);
        friendsMemos = friendsMemos.concat(publicMemos);
    }
    return friendsMemos;
};

MemoSchema.statics.findMemosByGeopoint = async function (usersIds, category, lat, long, distance) {
    console.log(`***invoked findMemosByGeopoint*** inputs: userIds: ${usersIds}
    , category: ${category}, lat: ${lat}, long: ${long}, distance: ${distance}`);
    var friendsMemos = [];
    var isPrivate = false;
    for (const usersId of usersIds) {
        const publicMemos = await Memo.findUserMemosByGeopoint(usersId, isPrivate, category,lat,long, distance);
        friendsMemos = friendsMemos.concat(publicMemos);
    }
    return friendsMemos;
};

//find all user public memos within the distance from the given Geopoint. category optional. 
MemoSchema.statics.findUserMemosByGeopoint = async function(_id, isPrivate, category,lat,long, distance) {
    console.log(`***invoked findUserMemosByGeopoint*** inputs: userId: ${_id}
    , category: ${category}, lat: ${lat}, long: ${long}, distance: ${distance}`);
    var Memo = this;
    try {
        var location = new GeoPoint(Number(lat),Number(long));
    } catch (e) {
        console.log('error', e);
    }
    console.log('***location***',location );
    const inKilometers = true;
    //SE-south east, NW-north west
    var locationBbox = location.boundingCoordinates(Number(distance),  inKilometers);
    locationBbox.SElat = locationBbox[0]._degLat;
    locationBbox.SElong = locationBbox[0]._degLon;
    locationBbox.NWlat = locationBbox[1]._degLat;
    locationBbox.NWlong = locationBbox[1]._degLon;
    console.log('***locationBbox***', locationBbox);

    if (!category) {
        var memos = await Memo.find({
            _creatorId: _id,
            isPrivate: isPrivate,
            longitute: {$gte: locationBbox.SElong, $lte: locationBbox.NWlong},
            latitude: {$gte: locationBbox.SElat, $lte: locationBbox.NWlat}
        });
    } else {
        var memos = await Memo.find({
            _creatorId: _id,
            isPrivate: isPrivate,
            category: category,
            longitute: {$gte: locationBbox.SElong, $lte: locationBbox.NWlong},
            latitude: {$gte: locationBbox.SElat, $lte: locationBbox.NWlat}
        });
    }
    
    return memos;
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
                "image": memo.image,
                "date": memo.date
                }
            }, {new: true});
        if (merged_memo) {await Memo.remove(memo);}
    }   
}); 


var Memo = mongoose.model('Memo', MemoSchema);

module.exports = {Memo};