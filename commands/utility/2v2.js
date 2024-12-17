const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('2v2')
        .setDescription('Responde armando un team para 2v2')
        .addUserOption(option => option.setName('participante-uno').setDescription('Primer participante'))
        .addUserOption(option => option.setName('participante-dos').setDescription('Segundo participante'))
        .addUserOption(option => option.setName('participante-tres').setDescription('Tercer participante'))
        .addUserOption(option => option.setName('participante-cuatro').setDescription('Cuarto participante')),
    async execute(interaction) {
        const participanteUno = interaction.options.getUser('participante-uno');
        const participanteDos = interaction.options.getUser('participante-dos');
        const participanteTres = interaction.options.getUser('participante-tres');
        const participanteCuatro = interaction.options.getUser('participante-cuatro');

        // Obtener nombres de usuarios
        const nombreParticipanteUno = participanteUno ? `<@${participanteUno.id}>` : 'Participante 1';
        const nombreParticipanteDos = participanteDos ? `<@${participanteDos.id}>` : 'Participante 2';
        const nombreParticipanteTres = participanteTres ? `<@${participanteTres.id}>` : 'Participante 3';
        const nombreParticipanteCuatro = participanteCuatro ? `<@${participanteCuatro.id}>` : 'Participante 4';

        // Crear lista con los participantes
        const participantes = [nombreParticipanteUno, nombreParticipanteDos, nombreParticipanteTres, nombreParticipanteCuatro];

        // Barajar los participantes de forma aleatoria
        const shuffledParticipants = participantes.sort(() => Math.random() - 0.5);

        // Asignar los jugadores a los equipos
        const equipoUno = [shuffledParticipants[0], shuffledParticipants[1]];
        const equipoDos = [shuffledParticipants[2], shuffledParticipants[3]];

        // Responder con la asignación de equipos
        await interaction.reply(`Equipo 1: ${equipoUno[0]} y ${equipoUno[1]}\nEquipo 2: ${equipoDos[0]} y ${equipoDos[1]}`);
    },
};
