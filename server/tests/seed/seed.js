const {User} = require('./../../../models/user');

const users = [{

}, {

}];
const populateUsers = (done) => {
    User.remove({}).then(() => done());
};

module.exports = {populateUsers};