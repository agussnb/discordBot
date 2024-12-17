// serverDb.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    money: {
        type: Number,
        default: 0,
    },
});

// Definimos el modelo de Mongoose, asegurándonos de que se use correctamente si ya está definido
const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);

// Exportamos solo el modelo Member
module.exports = Member;
