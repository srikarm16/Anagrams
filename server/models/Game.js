const mongoose = require("mongoose");

// TODO: store current game to allow checking for correct localstorage values
const gameSchema = mongoose.Schema({
    gameState: String,
    wordLength: {
        type: Number,
        default: 3,
    },
    letters: [String],
    endTime: {
        type: Number,
        default: 0,
    },
    players: [mongoose.Types.ObjectId],
    first: {
        _id: mongoose.Types.ObjectId,
        name: String,
        score: Number,
        words: [String],
    },
    second: {
        _id: mongoose.Types.ObjectId,
        name: String,
        score: Number,
        words: [String],
    },
    third: {
        _id: mongoose.Types.ObjectId,
        name: String,
        score: Number,
        words: [String],
    },
    playerRankings: [{
        _id: mongoose.Types.ObjectId,
        name: String,
        score: Number,
    }],
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;