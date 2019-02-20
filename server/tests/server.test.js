const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../../models/user');
const {Memo} = require('./../../models/memo');
const {users,populateUsers, memos, populateMemos, removeCachedCollection} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateMemos);
beforeEach(removeCachedCollection);

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
                expect(users.length).toBe(3);
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
                expect(users.length).toBe(3);
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
        
        var reqBody = {
            _creatorId: "5c20b18f4230672300fe606c",
            memoName: "BBB",
            address: "Ma'ale Kamon St 2, Karmiel",
            country: "Israel",
            city: "Karmiel",
            longitute:"32.928406",
            latitude: "35.323580",
            category: 100,
            isPrivate: true
            };
        request(app)
        .post('/memos/create')
        .send(reqBody)
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            Memo.find().then((memos) => {
                expect(memos.length).toBe(10);
                done();
            }).catch((e) => done(e));
        });
    });
});

describe ('POST /memos/update', () => {
    it('Should update existing memo',(done) => {
        let body = {};
        Memo.find().then((memos) => {
            body._id = memos[0]._id;
            body._creatorId = memos[0]._creatorId;
            body.memoText = 'Tal Shnitzer the great';
            body.isPrivate = !memos[0].isPrivate;   
            console.log('**POST /memos/update body',body);
            request(app)
            .post('/memos/update')
            .send(body)
            .expect(200)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            Memo.find({_id: body._id}).then((memo) => {
                expect(memo[0].memoText[0]).toBe('Tal Shnitzer the great');
                done();
            }).catch((e) => done(e)); 
        }); 
    });  
    });
});

 describe ('GET /memos/:userId?pageNum=0&limit=${users.length}', () => {
    it ('Should return all user memos', (done) => {
        request(app)
        .get(`/memos/${users[0]._id.toHexString()}?pageNum=0&limit=${users.length}`)
        .expect(200)
        .expect((res) => {
            console.log('***respond body', res.body);
            expect(res.body.memos.memos[0]._creatorId).toContain(users[0]._id.toHexString());
            expect(res.body.memos.memos.length).toBe(3);
        })
        .end(done)
    });  
    it ('Should return user memos with category 1', (done) => {
        request(app)
        .get(`/memos/${users[0]._id.toHexString()}?category=1&pageNum=0&limit=${users.length}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.memos.memos[0]._creatorId).toContain(users[0]._id.toHexString());
            expect(res.body.memos.memos.length).toBe(2);
        })
        .end(done)
    });  
     
 });

 describe ('GET /allMemos/:userId', () => {
    it (`Should return all user's memos and friends memos`, (done) => {
        request(app)
        .get(`/allMemos/${users[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.friendsMemos.length).toBe(10);
            const userIdAndFriends = users[0].friends_id.toString().concat(users[0]._id.toString());
            expect(userIdAndFriends).toContain(res.body.friendsMemos[0]._creatorId.toString());
            //expect(users[0].friends_id.toString()).toContain(res.body.friendsMemos[0]._creatorId.toString());
        })
        .end(done)
    });   

    it (`Should return all user's and friends memos with category 2`, (done) => {
        request(app)
        .get(`/allMemos/${users[0]._id.toHexString()}?category=2`)
        .expect(200)
        .expect((res) => {
            expect(res.body.friendsMemos.length).toBe(3);
            const userIdAndFriends = users[0].friends_id.toString().concat(users[0]._id.toString());
            expect(userIdAndFriends).toContain(res.body.friendsMemos[0]._creatorId.toString());
        })
        .end(done)
    });

    it (`Should return all user's friends memos with category 1 and around location within distance`, (done) => {
        var location = {
                        long: 35.323596,
                        lat: 32.926822
                        };
        var distance = 0.3;
        request(app)
        .get(`/allMemos/${users[0]._id.toHexString()}?category=1&&long=${location.long}&&lat=${location.lat}&&distance=${distance}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.friendsMemos.length).toBe(3);
            expect(res.body.friendsMemos[0].memoName).not.toBe("home centre");
        })
        .end(done)
    });
 });