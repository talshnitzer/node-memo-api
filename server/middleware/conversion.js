const {User} = require('./../../models/user');

var appId2DbId =  async (req,res,next) => {
    try{
        //extract appFriends
        var appFriends = req.body.appFriends;
        console.log('*****appId2DbId**** appFriends', appFriends);
        var friends_id = [];
        //find for each appId the matching DB _Id
        for(const appFriend of appFriends) {
            const user = await User.findOne({appId: appFriend});
            console.log('*****appId2DbId**** user', user);
            if (user){
                friends_id.push(user._id);
                console.log('*****appId2DbId**** friends_id', friends_id);
            }
        }
        req.body.friends_id = friends_id;    //add array of friends_Id to req
        console.log('*****appId2DbId**** req.body.friends_id', req.body.friends_id);
        next();      
    } catch (e) {
        res.status(e);
    }
    
};

module.exports = {appId2DbId};