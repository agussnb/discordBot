const { SlashCommandBuilder } = require('discord.js');
const { userLevel } = require('../../levelSystem'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelcheck')
        .setDescription('Muestra la experiencia y el nivel del usuario')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar').setRequired(true)),
    
    async execute(interaction) {
        // Obtener el usuario de la opción seleccionada
        const userId = interaction.options.getUser('usuario').id;
        const userName = interaction.options.getUser('usuario').username; 

        try {
            // Obtener estadísticas del usuario usando la función userLevel (asegúrate de que esté correctamente definida)
            const userStats = await userLevel(userId);

            // Verificar si se encontraron estadísticas del usuario
            if (userStats) {
                const { level, experience, expToNextLvl } = userStats;

                // Responder con la información del nivel y experiencia del usuario
                await interaction.reply({ 
                    content: `El usuario ${userName} está en el nivel ${level} con ${experience} puntos de experiencia. (Para el siguiente nivel: ${experience}/${expToNextLvl})`, 
                    ephemeral: true 
                });
            } else {
                // Responder si no se encontró información para el usuario
                await interaction.reply({ 
                    content: `No se pudo encontrar información para el usuario ${userName}.`, 
                    ephemeral: true 
                });
            }
        } catch (error) {
            // Manejo de errores
            console.error(error);
            await interaction.reply({ 
                content: `Ocurrió un error al intentar obtener la información de ${userName}.`, 
                ephemeral: true 
            });
        }
    },
};
