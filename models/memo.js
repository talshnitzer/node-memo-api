const mongoose = require('mongoose');
const GeoPoint = require('geopoint');

var MemoSchema = new mongoose.Schema({
    _creatorId: {
        type: [String],
        require: true,
        index: true
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
    website: {
        type: String,
        trim: true
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
    lastdate: {
        type: Date
    },
    placeId: {
        type: String,
        trim: true,
        index: true
    }
});

//MemoSchema.index({_creatorId: 1, placeId: 1}, {unique: true});


MemoSchema.methods.removeFromMemo =  function (_creatorId) {
    try{
        var memo = this;
        var removedItems = [];
        console.log('***removeFromMemo*** memo:', memo);
        var creatorIndex = memo._creatorId.indexOf(_creatorId);
        console.log('***removeFromMemo*** creatorIndex:', creatorIndex);
        if (creatorIndex === -1) {
            throw new Error('the creator is not found in the memo');
        }
        removedItems[0] = memo._creatorId.splice(creatorIndex, 1);
        removedItems[1] = memo.memoText.splice(creatorIndex, 1);
        removedItems[2] = memo.image.splice(creatorIndex, 1);
        removedItems[3] = memo.date.splice(creatorIndex, 1);
        console.log('***removeFromMemo*** removedItems:', removedItems);
        memo.save();
        return removedItems;

    } catch (e) {
        throw e;
    }
    
};

MemoSchema.methods.updateMemo = async function (body) {
    var memo = this;
     
    if (body.memoText) {memo.memoText = body.memoText};
    if (body.image) {memo.image = body.image};
    if (body.isPrivate) {memo.isPrivate = body.isPrivate};
    memo.date = body.date;
    console.log('***memo.date, body.date', memo.date, body.date);
    var updatedMemo = await memo.save(); 
    console.log('***updateMemo***', updatedMemo);
    return updatedMemo;
}; 

MemoSchema.methods.updateConvergeMemo = async function (body) {
    try {
        var memo = this;

        var creatorIndex = memo._creatorId.indexOf(body._creatorId);
        console.log('***updateConvergeMemo*** creatorIndex:', creatorIndex);
        if (creatorIndex === -1) {
            throw new Error('the creator is not found in the memo');
        }
        //update non private memo
        if (body.isPrivate === false || body.isPrivate === undefined) {
            if (body.memoText) {memo.memoText[creatorIndex] = body.memoText};
            if (body.image) {memo.image[creatorIndex] = body.image};
            memo.date[creatorIndex] = body.date;
            memo.markModified('image');
            memo.markModified('memoText');
            try {
                var updatedMemo = await memo.save(); 
            } catch (e) {
                console.log('***updateConvergeMemo*** save error: ', e);
            }
            
            console.log('***updateMemo***', updatedMemo);
            return updatedMemo;
        }; 
        //update peivate memo - remove it from the converged memo and create a new memo with the creator updates
        var newBody = {};
        newBody.memoName = memo.memoName;
        newBody.address = memo.address;
        newBody. country = memo.country;
        newBody.city = memo.city;
        newBody.longitute = memo.longitute;
        newBody.latitude = memo.latitude
        newBody.phoneNum = memo.phoneNum;
        newBody.category = memo.category;
        newBody.placeId = memo.placeId;
        newBody._creatorId = body._creatorId;
        newBody.memoText = body.memoText || memo.memoText[creatorIndex];
        newBody.image = body.image || memo.image[creatorIndex];
        newBody.isPrivate = true;
        var newMemo = new Memo(newBody); 
        memo.removeFromMemo(body._creatorId);
        try {
            var updatedMemo = await newMemo.save();
        }  catch (e) {
            console.log('***updateConvergeMemo*** save error: ', e);
        }   
        return updatedMemo;
    } catch (e) {
        return e;
    }       
}; 
 
MemoSchema.statics.findMyMemos = async function(_id, category) {
    
    var Memo = this;
    console.log('***memo findMyMemos category: ', category);
    var newCollection = _id;
    // $project:
    //        {
    //          item: 1,
    //          discount:
    //            {
    //              $cond: { if: { $gte: [ "$qty", 250 ] }, then: 30, else: 20 }
    //            }
    //        }
    // $expr: {
    //     $lt:[ {
    //        $cond: {
    //           if: { $gte: ["$qty", 100] },
    //           then: { $divide: ["$price", 2] },
    //           else: { $divide: ["$price", 4] }
    //         }
    //     },
    //     5 ] }

    //{ $match: { $expr: { <aggregation expression> } } }

    try {
        await Memo.aggregate([
            { $match: {
                 _creatorId: _id,
                 $expr: { 
                        $cond: { if: { $eq: [category , undefined] }, then: {category: null}, else: { $in:['$category',  category] }}  
                    } 
                }
            },
            { $project:{
                //_id: 0,
                //id: '$_id',
                _creatorId: 1,
                memoName: 1,
                address: 1,
                country: 1,
                city: 1,
                longitute:1,
                latitude: 1,
                memoText: 1,
                image: 1,
                phoneNum: 1,
                website: 1,
                category: 1,
                isPrivate: 1,
                date: 1,
                lastdate: 1,
                placeId: 1,
                likesSum: {  $size: '$_creatorId' },
                lastUpdated: { $arrayElemAt: [ '$date',  -1 ]}
                }  
            },
            { $sort: {likesSum: -1, lastUpdated: -1}},
            { $out: newCollection} 
          ],
          function(err,docs) {  
            if (err) console.log("error: ", err) ;
            else console.log("the all documents have been written onto out!***:", docs); 
            }
        );
    } catch (e) {
        console.log('***memo findMyMemos error', e);
    }
    
    // var NewCollection = mongoose.model(newCollection, MemoSchema, newCollection);  
    // return NewCollection;
}
// NewCollection.find({}).skip(1).limit(2).exec(function(err, results) {
//     console.log('***result',results);
// });


// MemoSchema.statics.findMyMemos = async function(_id, category){
//     var Memo = this;
//     if (!category) {
//         var memos = await Memo.find({
//             _creatorId: _id
//         }).sort({});
//     } else {
//         var memos = await Memo.find({
//             _creatorId: _id,
//             category: {$in: category}
//         });
//     }
    
//     return memos;
// };

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

// MemoSchema.statics.findManyUsersMemos = async function (usersIds, category) {
//     var friendsMemos = [];
//     var isPrivate = false
//     for (const usersId of usersIds) {
//         const publicMemos = await Memo.findUserMemos(usersId, isPrivate, category);
//         friendsMemos = friendsMemos.concat(publicMemos);
//     }
//     return friendsMemos;
// };

MemoSchema.statics.findManyUsersMemos = async function (usersIds, category, myId) {
    var friendsMemos = [];
    var isPrivate = false
    console.log('***usersId***', usersIds)
    if (!category) {
        friendsMemos = await Memo.find({
            $or: [
                {isPrivate: false,
                _creatorId: {$in: usersIds}},
                {_creatorId: myId}
            ]    
        });
    } else {
        friendsMemos = await Memo.find({
            $or: [
                {category: {$in: category},
                isPrivate: false,
                _creatorId: {$in: usersIds}},
                {
                _creatorId: myId,
                category: {$in: category}
                }
            ]  
        });
    }   
    return friendsMemos;
};


//find all user public memos within the distance from the given Geopoint. category optional. 
MemoSchema.statics.findMemosByGeopoint = async function(usersIds, category,lat,long, distance, isPrivate, myId) {
    console.log(`***invoked findUserMemosByGeopoint*** inputs: usersId: ${usersIds}
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
            $or: [
                {
                    _creatorId: {$in: usersIds},
                    isPrivate: isPrivate,
                    longitute: {$gte: locationBbox.SElong, $lte: locationBbox.NWlong},
                    latitude: {$gte: locationBbox.SElat, $lte: locationBbox.NWlat}
                },
                {
                    _creatorId: {myId},
                    longitute: {$gte: locationBbox.SElong, $lte: locationBbox.NWlong},
                    latitude: {$gte: locationBbox.SElat, $lte: locationBbox.NWlat}
                } 
            ]
            
        });
    } else {
        var memos = await Memo.find({
            $or: [
                {
                    _creatorId: {$in: usersIds},
                    isPrivate: isPrivate,
                    category: category,
                    longitute: {$gte: locationBbox.SElong, $lte: locationBbox.NWlong},
                    latitude: {$gte: locationBbox.SElat, $lte: locationBbox.NWlat}
                },
                {
                    _creatorId: myId,
                    category: category,
                    longitute: {$gte: locationBbox.SElong, $lte: locationBbox.NWlong},
                    latitude: {$gte: locationBbox.SElat, $lte: locationBbox.NWlat}
                }
            ]   
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

module.exports = {Memo,MemoSchema};