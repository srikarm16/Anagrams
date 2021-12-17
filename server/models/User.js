const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    gameMode: String,
    score: Number,
    ready: Boolean,
    name: String,
    connected: Boolean,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
