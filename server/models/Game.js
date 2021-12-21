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
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;