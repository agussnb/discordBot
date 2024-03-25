const { SlashCommandBuilder } = require('discord.js');
const { userLevel } = require('../../levelSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelcheck')
        .setDescription('Muestra la experiencia y el nivel del usuario')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar').setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getUser('usuario').id;
        const userName = interaction.options.getUser('usuario').username; 
        const userStats = await userLevel(userId);

        if (userStats) {
            const { level, experience } = userStats;
            await interaction.reply({ content: `El usuario ${userName} está en el nivel ${level} con ${experience} puntos de experiencia.`, ephemeral: true });
        } else {
            await interaction.reply({ content: `No se pudo encontrar información para el usuario ${userName}.`, ephemeral: false });
        }
    },
};