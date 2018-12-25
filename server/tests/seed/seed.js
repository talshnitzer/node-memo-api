const {ObjectId} = require('mongodb');

const {User} = require('./../../../models/user');

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

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {users,populateUsers};