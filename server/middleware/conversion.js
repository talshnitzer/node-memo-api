const {User} = require('./../../models/user');

var appId2DbId =  async (req,res,next) => {
    try{
        //extract appFriends
        var appFriends = req.body.appFriends;
        var friends_id = [];
        //find for each appId the matching DB _Id
        for(const appFriend of appFriends) {
            const user = await User.findOne({appId: appFriend});
            if (user){
                friends_id.push(user._id);
            }
        }
        req.body.friends_id = friends_id;    //add array of friends_Id to req
        next();      
    } catch (e) {
        res.status(e);
    }
    
};

module.exports = {appId2DbId};