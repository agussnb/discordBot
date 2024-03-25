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

        const participantes = [nombreParticipanteUno, nombreParticipanteDos, nombreParticipanteTres, nombreParticipanteCuatro];
        let participanteUnoEquipoUno, participanteDosEquipoUno, participanteUnoEquipoDos, participanteDosEquipoDos;

        // Validar para el equipo 1
        do {
            participanteUnoEquipoUno = participantes[Math.floor(Math.random() * participantes.length)];
            participanteDosEquipoUno = participantes[Math.floor(Math.random() * participantes.length)];
        } while (participanteUnoEquipoUno === participanteDosEquipoUno);
    
        // Validar para el equipo 2
        do {
            participanteUnoEquipoDos = participantes[Math.floor(Math.random() * participantes.length)];
            participanteDosEquipoDos = participantes[Math.floor(Math.random() * participantes.length)];
        } while (
            participanteUnoEquipoDos === participanteUnoEquipoUno ||
            participanteUnoEquipoDos === participanteDosEquipoUno ||
            participanteDosEquipoDos === participanteUnoEquipoUno ||
            participanteDosEquipoDos === participanteDosEquipoUno
        );
        
        await interaction.reply(`Equipo 1: ${participanteUnoEquipoUno} y ${participanteDosEquipoUno}\nEquipo 2: ${participanteUnoEquipoDos} y ${participanteDosEquipoDos}`);
    },
};
