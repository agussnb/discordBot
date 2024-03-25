const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('putealo')
        .setDescription('Responde puteando a un usuario')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a putear')),
    async execute(interaction) {
        const respuestas = ['Puto','Mogolico','Imbecil','Idiota','Fracasado','Fraca','Down','Cornudo','Gordo concha','Conchudo','Gordo aplastado']
        const usuarioMencionado = interaction.options.getUser('usuario');
        const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
        await interaction.reply(`${usuarioMencionado} sos un ${respuestaAleatoria}`);
    },
};
