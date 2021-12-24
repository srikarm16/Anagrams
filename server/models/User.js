const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    gameMode: String,
    score: Number,
    liveUpdateScore: Number,
    ready: Boolean,
    name: String,
    connected: Boolean,
    words: [String],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
