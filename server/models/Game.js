const mongoose = require("mongoose");

const gameSchema = mongoose.Schema({
    gameState: String,
    letters: [String],
    startTime: {
        type: Date,
        default: undefined,
    },
    players: [mongoose.Types.ObjectId],
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;