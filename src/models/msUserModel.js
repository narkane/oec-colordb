const mongoose = require("mongoose");

const msUserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 8},
    msName: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
});

module.exports = MSUser = mongoose.model("msUser", msUserSchema, "msUsers");