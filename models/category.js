var {mongoose} = require('../db/mongoose.js');

var CategorySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
    },
    Name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    ShortName: {
        type: String,
        trim: true,
        minlength: 1
    },
    DisablesImage: {
        type: String,
        requires: true,
        trim: true,
        minlength: 1
    },
    EnabledImage: {
        type: String,
        trim: true,
        minlength: 1
    },
    ShowOrder: {
        type: String,
        trim: true,
        minlength: 1,
        required: true
    },
    Status: {
        type: String,
        trim: true,
        minlength: 1
    },
    StatusName: {
        type: String,
        trim: true,
        minlength: 1
    }
});

const Category = mongoose.model('Category', CategorySchema);
const categories = [
    {
        Code: "1",
        DisabledImage:  "eatGray.png",
        EnabledImage: "eat.png",
        Name: "Eat",
        ShortName: "Eat",
        ShowOrder: "1",
        Status: "1",
        StatusName: "Active"
        },
            {
        Code: "2",
        DisabledImage: "seeGray.png",
        EnabledImage:  "see.png",
        Name:  "See",
        ShortName: "See",
        ShowOrder: "2",
        Status: "1",
        StatusName:  "Active"
        },
            {
        Code: "5",
        DisabledImage:  "sleepGray.png",
        EnabledImage: "sleep.png",
        Name: "Sleep",
        ShortName:  "Sleep",
        ShowOrder: "3",
        Status: "1",
        StatusName:  "Active"
        },
            {
        Code: "4",
        DisabledImage:  "feelGray.png",
        EnabledImage: "feel.png",
        Name: "Feel",
        ShortName:  "Feel",
        ShowOrder: "4",
        Status: "2",
        StatusName:  "Disabled",
        Type: "Category",
        },
            {
        Code: "6",
        DisabledImage:  "spoilGray.png",
        EnabledImage:  "spoil.png",
        Name: "Spoil",
        ShortName:  "Spoil",
        ShowOrder: "5",
        Status: "2",
        StatusName:  "Disabled"
        },
            {
        Code: "3",
        DisabledImage:  "fixGray.png",
        EnabledImage: "fix.png",
        Name: "Fix",
        ShortName:  "Fix",
        ShowOrder: "6",
        Status: "2",
        StatusName:  "Disabled"
        }
];

module.exports = {Category,categories};