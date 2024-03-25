const { Member } = require('./serverDb');
const { EventEmitter } = require('events');
const levelUpEvent = new EventEmitter();

async function giveExperience(discordId, amount) {
    try {
        const member = await Member.findOne({ where: { discordId } });
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
        const member = await Member.findOne({ where: { discordId: userId } });
        if (!member) {
            console.error(`No se encontró al usuario con ID ${userId}.`);
            return;
        }

        const experienceNeeded = 100 + (member.level - 1) * 30; // Cantidad necesaria para subir de nivel
        if (member.experience >= experienceNeeded) {
            member.level++;
            member.experience -= experienceNeeded; // Restar la experiencia necesaria para subir de nivel
            console.log(`¡${member.discordId} subió de nivel! Ahora es nivel ${member.level}.`);
            await member.save(); // Guarda los cambios en la base de datos
            levelUpEvent.emit('levelUp', member); // Emite el evento de subida de nivel
        }
        else{
            console.log('El usuario no sube de nivel')
        }
    } catch (error) {
        console.error('Error al verificar la subida de nivel:', error);
    }
}

async function userLevel(userId) {
    try {
        const member = await Member.findOne({ where: { discordId: userId } });
        if (!member) {
            console.error(`No se encontró al usuario con ID ${userId}.`);
            return null;
        }
        return { level: member.level, experience: member.experience };
    } catch (error) {
        console.error('Error al verificar la informacion del usuario:', error);
        return null;
    }
}



// Otros métodos relacionados con el sistema de niveles y experiencia

module.exports = {
    giveExperience,
    checkLevelUp,
    levelUpEvent,
    userLevel
};
