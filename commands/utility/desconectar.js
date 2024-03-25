const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('desconectar')
        .setDescription('Desconecta el bot'),
    async execute(interaction) {
        // Obtener tu ID de usuario
        const ownerId = '462426383264514068'; // Reemplaza 'TU_ID_DE_USUARIO' con tu ID de usuario

        // Verificar si el usuario que interactúa con el comando es igual a tu ID de usuario
        const ownerIdIsTrue = interaction.user.id === ownerId;

        // Si el usuario es igual a tu ID de usuario, permitir ejecutar el comando
        if (ownerIdIsTrue) {
            await interaction.reply({content:'¡Desconectando el bot!',ephemeral:true});
            interaction.client.destroy();
        } else {
            // Si el usuario no es igual a tu ID de usuario, responder con un mensaje personalizado
            await interaction.reply({content:'No tienes permiso para usar este comando.',ephemeral:true});
        }
    }
};
