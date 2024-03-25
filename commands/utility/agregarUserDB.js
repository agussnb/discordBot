const { SlashCommandBuilder } = require('@discordjs/builders');
const { Member } = require('../../serverDb');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('insertmember')
        .setDescription('Inserta un nuevo miembro en la base de datos')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas insertar en la base de datos')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Verificar que el usuario que ejecuta el comando sea el autorizado
        if (interaction.user.id !== '462426383264514068') {
            await interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
            return;
        }

        // Obtener el usuario seleccionado
        const selectedUser = interaction.options.getUser('usuario');
        
        // Obtener la ID de Discord y el nombre de usuario del usuario seleccionado
        const discordId = selectedUser.id;
        const username = selectedUser.username;

        try {
            // Verificar si el usuario ya está en la base de datos
            const existingMember = await Member.findOne({ where: { discordId } });

            if (existingMember) {
                await interaction.reply('El usuario ya está en la base de datos.');
                return;
            }

            // Insertar el nuevo miembro en la base de datos
            await Member.create({ discordId, username });
            await interaction.reply('Miembro insertado correctamente en la base de datos.');
        } catch (error) {
            console.error('Error al insertar miembro en la tabla:', error);
            await interaction.reply('Ocurrió un error al insertar el miembro en la base de datos.');
        }
    },
};

