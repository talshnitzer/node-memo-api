
var {mongoose} = require('../db/mongoose.js');


var ImageSchema = new mongoose.Schema({
    image: {
        type: Buffer
    },
    creatorId: {
        type: String
    }    
});


const Image = mongoose.model('Image', ImageSchema);

module.exports = {Image};