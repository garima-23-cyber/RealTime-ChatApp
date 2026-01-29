const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: { type: String },
    dateOfBirth: { type: String },
    about: { 
        type: String, 
        trim: true,
        maxLength: 200 // Keep "About Me" concise for chat windows
    },
    contactNumber: { 
        type: Number, 
        trim: true 
    }  
});

module.exports = mongoose.model("Profile", profileSchema);