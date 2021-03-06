const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {User} = require('./../../../models/user');
const {Memo} = require('./../../../models/memo');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const userThreeId = new ObjectId();


const users = [{
    _id: userOneId,
    appId: '1',
    fullName: 'Tal Snitzer',
    appFriends: ['2', '3'],
    friends_id: [userTwoId._id, userThreeId._id],
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET).toString()
}, 
{
    _id: userTwoId,
    appId: '2',
    fullName: 'or Shalev',
    appFriends: ['1', '3', '80887909490'],
    friends_id: [userOneId._id, userTwoId._id],
    email: 'TreeWalker.shnitzer@SpeechGrammarList.com',
    phoneNum: '97254678910',
    token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET).toString()
},
{
    _id: userThreeId,
    appId: '3',
    fullName: 'shimon',
    appFriends: ['1', '2', '80887909490'],
    friends_id: [userOneId._id, userTwoId._id],
    email: 'TreeWalker.shnitzer@SpeechGrammarList.com',
    phoneNum: '97254678910',
    token: jwt.sign({_id: userThreeId}, process.env.JWT_SECRET).toString()
}];

const memos = [{
    _creatorId: userOneId._id,
    memoName: "AROMA",
    address: "Ma'ale Kamon St 2, Karmiel",
    country: "Israel",
    city: "Karmiel",
    longitute:"35.32344",
    latitude: "32.92703",
    memoText: "test memo num 0",
    image: "https://www.google.co.il/maps/place/Burgus+Burger+Bar/@32.926822,35.323596,3a,75y,90t/data=!3m8!1e2!3m6!1sAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs%3Dw114-h86-k-no!7i3984!8i2988!4m14!1m8!2m7!1sRestaurants!3m5!1sRestaurants!2s32.926719,+35.322678!4m2!1d35.3226781!2d32.9267185!3m4!1s0x151c3174c34db3fd:0xfdf6ecd71400a3b2!8m2!3d32.926822!4d35.323596?hl=en#",
    phoneNum: "04-988-5050",
    category: "1",
    placeId: "1",
    isPrivate: "true"
}, {
    _creatorId: userTwoId._id,
    memoName: "American Eagle Outfitters",
    address: "Klil",
    country: "Israel",
    city: "Klil",
    longitute:"35.322658   ",
    latitude: "32.926897",
    memoText: "test memo num 1",
    category: "1",
    placeId: "2",
    isPrivate: "false"
}, {
   _creatorId: userThreeId._id,
    memoName: "home centre",
    address: "Tuval",
    country: "Israel",
    city: "Klil",
    longitute:"32.9268287   ",
    latitude: "35.3268775",
    memoText: "test memo num 1",
    category: "1",
    placeId: "3",
    isPrivate: "false"
},{
    _creatorId: userOneId._id,
    memoName: "toys r us",
    address: "Ma'ale Kamon St 2, Karmiel",
    country: "Israel",
    city: "Karmiel",
    longitute:"35.326152",
    latitude: "32.927810",
    memoText: "test memo num 0",
    image: "https://www.google.co.il/maps/place/Burgus+Burger+Bar/@32.926822,35.323596,3a,75y,90t/data=!3m8!1e2!3m6!1sAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs%3Dw114-h86-k-no!7i3984!8i2988!4m14!1m8!2m7!1sRestaurants!3m5!1sRestaurants!2s32.926719,+35.322678!4m2!1d35.3226781!2d32.9267185!3m4!1s0x151c3174c34db3fd:0xfdf6ecd71400a3b2!8m2!3d32.926822!4d35.323596?hl=en#",
    phoneNum: "04-988-5050",
    category: "2",
    placeId: "12",
    isPrivate: "false"
}, {
    _creatorId: userTwoId._id,
    memoName: "Cafe Klil",
    address: "Klil",
    country: "Israel",
    city: "Klil",
    longitute:"32.981196   ",
    latitude: "35.205052",
    memoText: "test memo num 1",
    category: "2",
    placeId: "22",
    isPrivate: "false"
}, {
    _creatorId: userThreeId._id,
    memoName: "yohad",
    address: "Tuval",
    country: "Israel",
    city: "Klil",
    longitute:"32.981196   ",
    latitude: "35.205052",
    memoText: "test memo num 1",
    category: "2",
    placeId: "32",
    isPrivate: "false"
},{
    _creatorId: userThreeId._id,
     memoName: "home centre",
     address: "Tuval",
     country: "Israel",
     city: "Klil",
     longitute:"32.9268287   ",
     latitude: "35.3268775",
     memoText: "test memo num 1",
     category: "1",
     placeId: "33",
     isPrivate: "false"
 },{
     _creatorId: userOneId._id,
     memoName: "toys r us",
     address: "Ma'ale Kamon St 2, Karmiel",
     country: "Israel",
     city: "Karmiel",
     longitute:"35.326152",
     latitude: "32.927810",
     memoText: "test memo num 0",
     image: "https://www.google.co.il/maps/place/Burgus+Burger+Bar/@32.926822,35.323596,3a,75y,90t/data=!3m8!1e2!3m6!1sAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs%3Dw114-h86-k-no!7i3984!8i2988!4m14!1m8!2m7!1sRestaurants!3m5!1sRestaurants!2s32.926719,+35.322678!4m2!1d35.3226781!2d32.9267185!3m4!1s0x151c3174c34db3fd:0xfdf6ecd71400a3b2!8m2!3d32.926822!4d35.323596?hl=en#",
     phoneNum: "04-988-5050",
     category: "1",
     placeId: "13",
     isPrivate: "false"
 }, {
     _creatorId: userTwoId._id,
     memoName: "Cafe Klil",
     address: "Klil",
     country: "Israel",
     city: "Klil",
     longitute:"32.981196   ",
     latitude: "35.205052",
     memoText: "test memo num 1",
     category: "1",
     placeId: "23",
     isPrivate: "false"
 }, {
     _creatorId: userThreeId._id,
     memoName: "yohad",
     address: "Tuval",
     country: "Israel",
     city: "Klil",
     longitute:"32.981196   ",
     latitude: "35.205052",
     memoText: "test memo num 1",
     category: "1",
     placeId: "34",
     isPrivate: "false"
 }];


const populateMemos = (done) => {
    Memo.remove({}).then(() => {
        return Memo.insertMany(memos);
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        var userThree = new User(users[2]).save();

        return Promise.all([userOne, userTwo, userThree]);
    }).then(() => done());
};

const removeCachedCollection = (done) => {
    //users[0]._id.toHexString().collection.remove({}).then(() => done());
    //mongoose.connection.db.collection(users[0]._id.toHexString()).remove({}).then(() => {
        
    mongoose.connection.db.collection(users[0]._id.toHexString()).drop().then(() => {
                console.log('@@@@user[0]._id : ', users[0]._id.toHexString());    
            }, (e) => {
                console.log('remove cache error', e);
            });
     done();
};

module.exports = {users,populateUsers, memos, populateMemos, removeCachedCollection};