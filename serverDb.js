const { Sequelize, QueryTypes } = require('sequelize');

// Crear instancia de Sequelize y conectar a la base de datos
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'C:/Sqlite/discord_bot_db.db',
    logging: false,
});


// Definir modelo para la tabla Members
const Member = sequelize.define('Member', {
    discordId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    experience: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});


// Función para insertar un nuevo miembro en la base de datos
async function insertMember(discordId) {
    try {
        await Member.create({ discordId });
        console.log('Miembro insertado correctamente en la tabla.');
    } catch (error) {
        console.error('Error al insertar miembro en la tabla:', error);
    }
}

async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true }); 
        console.log('Base de datos sincronizada correctamente.');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
}

module.exports = {
    sequelize,
    Member,
    syncDatabase
};