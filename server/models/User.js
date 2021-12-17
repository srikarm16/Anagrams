const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    player_type: String,
    score: Number,
    ready: Boolean,
    name: String,
    connected: Boolean,
});

const User = mongoose.model('User', userSchema);
