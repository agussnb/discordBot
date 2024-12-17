const { EventEmitter } = require('events');
const levelUpEvent = new EventEmitter();
const Member = require('./serverDb.js');

async function giveExperience(discordId, amount) {
    try {
        const member = await Member.findOne({ discordId }); // Usamos findOne sin 'where'
        if (member) {
            member.experience += amount;
            await member.save();
            //console.log(`Se otorgaron ${amount} puntos de experiencia a ${discordId}.`);
            checkLevelUp(discordId);
        } else {
            console.error(`No se encontró al usuario con ID ${discordId}.`);
        }
    } catch (error) {
        console.error('Error al otorgar experiencia:', error);
    }
}

async function checkLevelUp(userId) {
    try {
        const member = await Member.findOne({ discordId: userId }); // Usamos findOne sin 'where'
        if (!member) {
            console.error(`No se encontró al usuario con ID ${userId}.`);
            return;
        }

        const experienceNeeded = 100 + (member.level - 1) * 30; // Calcula la experiencia necesaria para subir de nivel
        if (member.experience >= experienceNeeded) {
            member.level++;
            member.experience -= experienceNeeded; // Restamos la experiencia necesaria para subir
            console.log(`¡${member.username} subió de nivel! Ahora es nivel ${member.level}.`);
            await member.save(); // Guarda los cambios en la base de datos
            levelUpEvent.emit('levelUp', member); // Emite el evento de subida de nivel
        }
    } catch (error) {
        console.error('Error al verificar la subida de nivel:', error);
    }
}

async function userLevel(userId) {
    try {
        const member = await Member.findOne({ discordId: userId }); // Usamos findOne sin 'where'
        if (!member) {
            console.error(`No se encontró al usuario con ID ${userId}.`);
            return null;
        }
        const expToLvlUp = 100 + (member.level - 1) * 30; // Calcula la experiencia necesaria para subir al siguiente nivel
        return { level: member.level, experience: member.experience, expToNextLvl: expToLvlUp };
    } catch (error) {
        console.error('Error al verificar la información del usuario:', error);
        return null;
    }
}

// Exportamos las funciones necesarias
module.exports = {
    giveExperience,
    checkLevelUp,
    levelUpEvent,
    userLevel
};
