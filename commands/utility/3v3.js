const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('3v3')
        .setDescription('Responde armando un team para 2v2')
        .addUserOption(option => option.setName('participante-uno').setDescription('Primer participante'))
        .addUserOption(option => option.setName('participante-dos').setDescription('Segundo participante'))
        .addUserOption(option => option.setName('participante-tres').setDescription('Tercer participante'))
        .addUserOption(option => option.setName('participante-cuatro').setDescription('Cuarto participante'))
        .addUserOption(option => option.setName('participante-cinco').setDescription('Quinto participante'))
        .addUserOption(option => option.setName('participante-seis').setDescription('Sexto participante')),
        async execute(interaction) {
            const participanteUno = interaction.options.getUser('participante-uno');
            const participanteDos = interaction.options.getUser('participante-dos');
            const participanteTres = interaction.options.getUser('participante-tres');
            const participanteCuatro = interaction.options.getUser('participante-cuatro');
            const participanteCinco = interaction.options.getUser('participante-cinco');
            const participanteSeis = interaction.options.getUser('participante-seis');
        
            // Obtener nombres de usuarios
            const nombreParticipanteUno = participanteUno ? `<@${participanteUno.id}>` : 'Participante 1';
            const nombreParticipanteDos = participanteDos ? `<@${participanteDos.id}>` : 'Participante 2';
            const nombreParticipanteTres = participanteTres ? `<@${participanteTres.id}>` : 'Participante 3';
            const nombreParticipanteCuatro = participanteCuatro ? `<@${participanteCuatro.id}>` : 'Participante 4';
            const nombreParticipanteCinco = participanteCinco ? `<@${participanteCinco.id}>` : 'Participante 5';
            const nombreParticipanteSeis = participanteSeis ? `<@${participanteSeis.id}>` : 'Participante 6';
        
            const participantes = [nombreParticipanteUno, nombreParticipanteDos, nombreParticipanteTres, nombreParticipanteCuatro, nombreParticipanteCinco, nombreParticipanteSeis];
        
            // Barajar los participantes aleatoriamente
            for (let i = participantes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [participantes[i], participantes[j]] = [participantes[j], participantes[i]];
            }
        
            // Dividir los participantes en dos equipos
            const equipo1 = participantes.slice(0, 3);
            const equipo2 = participantes.slice(3);
        
            await interaction.reply(`Equipo 1: ${equipo1.join(', ')}\nEquipo 2: ${equipo2.join(', ')}`);
        },
};
