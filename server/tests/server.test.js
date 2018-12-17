const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../../models/user');
const {populateUsers} = require('./seed/seed');

beforeEach(populateUsers);

describe ('POST /users', () => {
    it('Should create a new user', (done) => {
        var facebookId = '100011240225477';
        var fullName = 'Tal Snitzer';
        var appFriends = ['301011240225891', '710125477'];


        request(app)
        .post('/users')
        .send({facebookId, fullName, appFriends })
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBeTruthy();
            expect(res.body.fullName).toBeFalsy();
            expect(res.body.appFriends).toEqual(appFriends);
        })
        .end((err) =>{
            if (err) {
                return done(err);
            }

            User.findOne({facebookId}).then((user) => {
                expect(user).toBeTruthy();
                expect(user.facebookId).toBe(facebookId);
                done();
            }).catch((e) => done());
        });

    });
});