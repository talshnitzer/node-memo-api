const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../../models/user');
const {Memo} = require('./../../models/memo');
const {users,populateUsers, memos, populateMemos} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateMemos);

describe ('POST /users/signup', () => {
    it('Should create a new user', (done) => {
        var appId = '100';
        var fullName = 'Tal Snitzer';
        var appFriends = ['301011240225891', '710125477'];


        request(app)
        .post('/users/signup')
        .send({appId, fullName, appFriends })
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

            User.findOne({appId}).then((user) => {
                expect(user).toBeTruthy();
                expect(user.appId).toBe(appId);
                done();
            }).catch((e) => done());
        });

    });

    it('it should not create new user', (done) =>{
        request(app)
        .post('/users/signup')
        .send(users[0])
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.find({}).then((users) => {
                expect(users.length).toBe(2);
                done();
            });
        }); 

    });
});

describe ('POST /users/login', () => {
    it('Should update an existing user', (done) => {
        var appFriends = users[0].appFriends.concat('100100');
        request(app)
        .post('/users/login')
        .send({appId: users[0].appId, appFriends: appFriends })
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

            User.findOne({appId: users[0].appId}).then((user) => {
                expect(user.appFriends).toEqual(appFriends);
                done();
            }).catch((e) => done());
        });

    });

    it('it should not login/update new user', (done) =>{
        var appId = users[0].appId.concat('123');
        
        request(app)
        .post('/users/login')
        .send({appId: appId, appFriends: users[0].appFriends})
        .expect(404)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.find({}).then((users) => {
                expect(users.length).toBe(2);
                done();
            });
        }); 

    });
});


describe ('POST /memos/create', () => {
    it('Should create a new memo', (done) => {
        var reqBody = {
            _creatorId: "5c20b18f4230672300fe606c",
            memoName: "BBB",
            address: "Ma'ale Kamon St 2, Karmiel",
            country: "Israel",
            city: "Karmiel",
            longitute:"32.928406",
            latitude: "35.323580",
            category: 1,
            isPrivate: true
            };
        request(app)
        .post('/memos/create')
        .send(reqBody)
        .expect(200)
        .expect((res) => {
            expect(res.body.memoName).toBe(reqBody.memoName)
        })
        .end((err,res) => {
            if (err) {
            return done(err);
            }
        Memo.find({memoName: reqBody.memoName}).then((memos) => {
            expect(memos.length).toBe(1);
            expect(memos[0].address).toBe(reqBody.address);
            done();
        }).catch((e) => done(e));
        });
    });
    it('Should not create a memo with invalid body data',(done) => {
        var reqBody = memos[0];
        reqBody.category = 100;

        request(app)
        .post('/memos/create')
        .send(reqBody)
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            Memo.find().then((memos) => {
                expect(memos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });
    });
});