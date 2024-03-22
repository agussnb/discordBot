const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('putea')
		.setDescription('Responde puteando'),
	async execute(interaction) {
		const respuestas = ['Puto','Mogolico','Imbecil','Gabi','Idiota','Fracasado','Fraca','Down','Cornudo','Gordo concha','Conchudo','Gordo aplastado']

		const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
		await interaction.reply(respuestaAleatoria);
	},
};