const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('hola')
		.setDescription('Responde saludando al usuario'),
	async execute(interaction) {
		const userId = interaction.user.id;
		await interaction.reply(`Hola! <@${userId.toString()}>`);
	},
};