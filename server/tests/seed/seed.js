const {ObjectId} = require('mongodb');

const {User} = require('./../../../models/user');
const {Memo} = require('./../../../models/memo')

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

const users = [{
    _id: userOneId,
    facebookId: '100011240225477',
    fullName: 'Tal Snitzer',
    appFriends: ['301011240225891', '710125477']
}, {
    _id: userTwoId,
    facebookId: '50101230225478',
    fullName: 'Galit Shalev',
    appFriends: ['301011240225891', '710125477', '80887909490'],
    email: 'TreeWalker.shnitzer@SpeechGrammarList.com',
    phoneNum: '97254678910'
}];

const memos = [{
    _creatorId: "3330b18f4230672300fe606c",
    memoName: "AROMA",
    address: "Ma'ale Kamon St 2, Karmiel",
    country: "Israel",
    city: "Karmiel",
    longitute:"32.928406",
    latitude: "35.323580",
    memoText: "test memo num 0",
    image: "https://www.google.co.il/maps/place/Burgus+Burger+Bar/@32.926822,35.323596,3a,75y,90t/data=!3m8!1e2!3m6!1sAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipPPlHFOin6FF7P83mLaoiYFa4RmRn4aXYXV5uqs%3Dw114-h86-k-no!7i3984!8i2988!4m14!1m8!2m7!1sRestaurants!3m5!1sRestaurants!2s32.926719,+35.322678!4m2!1d35.3226781!2d32.9267185!3m4!1s0x151c3174c34db3fd:0xfdf6ecd71400a3b2!8m2!3d32.926822!4d35.323596?hl=en#",
    phoneNum: "04-988-5050",
    category: "1",
    isPrivate: "true"
}, {
    _creatorId: "3330b18f4230672300fe606c",
    memoName: "Cafe Klil",
    address: "Klil",
    country: "Israel",
    city: "Klil",
    longitute:"32.981196   ",
    latitude: "35.205052",
    memoText: "test memo num 1",
    category: "1",
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

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {users,populateUsers, memos, populateMemos};