const { SlashCommandBuilder } = require('discord.js');
const { giveExperience } = require('../../levelSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exp')
        .setDescription('Da exp a un usuario')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a dar exp').setRequired(true))
        .addIntegerOption(option => option.setName('exp').setDescription('Cantidad de experiencia a dar').setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id !== '462426383264514068') {
            await interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
            return;
        }
        const userId = interaction.options.getUser('usuario').id;
        const userName = interaction.options.getUser('usuario').username; // Obtén el nombre de usuario
        const exp = interaction.options.getInteger('exp'); // Corrección de getInterger a getInteger
        await giveExperience(userId, exp);

        await interaction.reply({ content: `Se dio ${exp} puntos de experiencia a ${userName}`, ephemeral: true });
    },
};
