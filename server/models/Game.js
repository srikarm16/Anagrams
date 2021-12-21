const mongoose = require("mongoose");

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
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;