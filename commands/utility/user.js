const { SlashCommandBuilder } = require('discord.js');
const Member = require('../../serverDb'); // Asegúrate de que el modelo Member esté importado correctamente
const { userLevel } = require('../../levelSystem'); // Asegúrate de que esta función esté correctamente importada

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Muestra la información de un usuario')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar').setRequired(true)),  // El usuario es obligatorio
    
    async execute(interaction) {
        // Obtener el usuario mencionado
        const user = interaction.options.getUser('usuario');  // Obtener el objeto del usuario
        
        if (!user) {
            return interaction.reply({ 
                content: 'Por favor, selecciona un usuario válido para obtener su información.', 
                ephemeral: true 
            });
        }

        // Ahora obtenemos el miembro del servidor (guild member), que nos da más detalles como la fecha de ingreso
        const member = await interaction.guild.members.fetch(user.id);
        if (!member) {
            return interaction.reply({
                content: `No se pudo obtener el miembro ${user.username} en este servidor.`,
                ephemeral: true,
            });
        }

        const userId = user.id;
        const userName = user.username;
        const joinDate = member.joinedAt;  // Fecha de ingreso al servidor

        try {
            // Obtener estadísticas del usuario desde la base de datos (Mongoose)
            const existingMember = await Member.findOne({ discordId: userId });
            
            // Si encontramos al usuario en la base de datos
            if (existingMember) {
                const { level, experience, money } = existingMember;

                // Obtener las estadísticas del usuario (userLevel) para obtener la experiencia necesaria
                const userStats = await userLevel(userId);

                // Si encontramos las estadísticas de nivel
                if (userStats) {
                    const { expToNextLvl } = userStats;

                    // Responder con toda la información del usuario
                    await interaction.reply({ 
                        content: `**Información de ${userName}**\n` +
                            `- Nombre: ${userName}\n` +
                            `- Nivel: ${level} :space_invader: \n` +
                            `- Experiencia: ${experience} / ${expToNextLvl} (para el siguiente nivel)\n` +
                            `- Dinero: $ ${money} pesos :dollar: \n` +
                            `- Fecha de ingreso al servidor: ${joinDate.toLocaleDateString()} ${joinDate.toLocaleTimeString()}`,
                        ephemeral: false // Esto permite que todos los miembros del servidor vean la información
                    });
                } else {
                    // Si no se encuentran las estadísticas del nivel
                    await interaction.reply({ 
                        content: `No se pudo obtener la información de nivel para el usuario ${userName}.`, 
                        ephemeral: false 
                    });
                }
            } else {
                // Si no se encuentra al usuario en la base de datos
                await interaction.reply({ 
                    content: `No se pudo encontrar información para el usuario ${userName}.`, 
                    ephemeral: false 
                });
            }
        } catch (error) {
            // Manejo de errores
            console.error(error);
            await interaction.reply({ 
                content: `Ocurrió un error al intentar obtener la información de ${userName}.`, 
                ephemeral: false 
            });
        }
    },
};
