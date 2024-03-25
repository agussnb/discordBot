const { Client, Events, GatewayIntentBits, Collection,Partials} = require('discord.js');
const { token } = require('./config.json');
const fs = require ('node:fs');
const path = require ('node:path');
const { sequelize, insertMember,syncDatabase  } = require('./serverDb');
const {giveExperience,levelUpEvent,checkLevelUp} = require('./levelSystem')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.MessageContent,GatewayIntentBits.DirectMessages],partials: [Partials.Channel] });


client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Inicia sesion del bot con el token del cliente
client.login(token);

//Carga los archivos de comandos
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders){
    const commandPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles){
        const filePath = path.join(commandPath, file);
        const command = require(filePath)
        if ('data' in command && 'execute' in command){
            client.commands.set(command.data.name, command);
        }
        else{
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }
}
//Carga los comandos
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand())return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command){
        console.error(`No command matching ${interaction.commandName} was found.`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred){
            await interaction.followUp({content: 'Ocurrio un error al ejecutar este comando!',ephemeral: true});
        }
        else{
            await interaction.reply({content:'Ocurrio un error al ejecutar este comando!', ephemeral: true})
        }
    }
})

syncDatabase()


// Detecta cuando un usuario se une a un canal de voz
const voiceJoinTimes = {};

client.on('voiceStateUpdate', async (oldState, newState) => {
    const oldChannelID = oldState.channel ? oldState.channel.id : null;
    const newChannelID = newState.channel ? newState.channel.id : null;
    console.log('ID del canal anterior:', oldChannelID);
    console.log('ID del nuevo canal:', newChannelID);
    const currentTime = new Date();

    if (!oldChannelID && newChannelID) {
        console.log('Se unió uno o más usuarios a un canal de voz');
        voiceJoinTimes[newState.member.id] = { joinTime: currentTime, accumulatedTime: 0 };
    } else if (oldChannelID && !newChannelID) {
        console.log('Se fue uno o más usuarios de un canal de voz');
        if (voiceJoinTimes[oldState.member.id]) {
            const joinTime = voiceJoinTimes[oldState.member.id].joinTime;
            const accumulatedTime = voiceJoinTimes[oldState.member.id].accumulatedTime + (currentTime - joinTime);
            voiceJoinTimes[oldState.member.id].accumulatedTime = accumulatedTime;
        }
    }
});


// Intervalo para otorgar experiencia por cada 30 segundos en el canal de voz
setInterval(() => {
    // Obtén la hora actual
    const currentTime = new Date();
    
    // Itera sobre los usuarios en el objeto voiceJoinTimes
    for (const userId in voiceJoinTimes) {
        // Obtén la información del usuario
        const userInfo = voiceJoinTimes[userId];
        const joinTime = userInfo.joinTime;
        
        // Calcula la diferencia de tiempo en segundos desde la entrada al canal de voz
        const elapsedTime = currentTime - joinTime;
        const secondsPassed = Math.floor(elapsedTime / 1000);
        
        // Verifica si han pasado al menos 30 segundos desde la última vez que se otorgó experiencia
        if (secondsPassed >= 30) {
            //console.log(`El usuario ${userId} ha estado al menos 30 segundos en un canal de voz`);
            // Otorga 1 punto de experiencia por cada 30 segundos
            giveExperience(userId, 1);
            // Actualiza el tiempo de entrada al canal solo cuando se otorga experiencia
            userInfo.joinTime = currentTime;
        }
    }
}, 30000); // 30000 milisegundos = 30 segundos

//Evento para enviar un mensaje al canal de voz Comunicacion para felicitar a un usuario cuando sube de nivel
levelUpEvent.on('levelUp', (member) => {
    // Envía un mensaje al canal de texto específico
    const channelId = '838989571374317578'; 
    const channel = client.channels.cache.get(channelId);
    //console.log(channel)
    if (channel) {
        const userMention = `<@${member.discordId}>`;
        const message = `${userMention} ha subido de nivel y ahora es nivel ${member.level}! 🎉`;
        channel.send(message);
    } else {
        console.error('El canal de texto específico no fue encontrado.');
    }
});

//Respuestas del bot ante ciertos mensajes
client.on('messageCreate', message => {
    const contentLowerCase = message.content.toLowerCase();
    if (contentLowerCase === 'hola' && !message.author.bot) {
        message.reply('Hola');
    }
});


client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if (contentLowerCase == 'gabi' && !message.author.bot){
        message.reply('Un gordo aplastado')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    const frasesAle = ['VLLC','Main skarner','Hay que matar a todos los k','Que asco que me dan los kirchneristas']
    const respuestaAleatoria = frasesAle[Math.floor(Math.random() * frasesAle.length)];
    if (contentLowerCase == 'ale' && !message.author.bot){
        message.reply(respuestaAleatoria)
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if (contentLowerCase == 'toti' && !message.author.bot){
        message.reply('Yo me pase el darksouls 3')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if (contentLowerCase == 'agus' && !message.author.bot){
        message.reply('Gymbro')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'gragas' && !message.author.bot){
        message.reply('Booomba')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'guido' && !message.author.bot){
        message.reply('Soy challanger')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'motiel' && !message.author.bot){
        message.reply('Un rockstar')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'triky' && !message.author.bot){
        message.reply('Heredero de la guzmoneria')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'ivo' && !message.author.bot){
        message.reply('El carry de las guerras')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'chola' && !message.author.bot){
        message.reply('Sale timba?')
    }
})

client.on('messageCreate', message =>{
    const contentLowerCase = message.content.toLowerCase();
    if(contentLowerCase === 'juan' && !message.author.bot){
        message.reply('Cuando sea grande quiero tocar la guitarra como el')
    }
})

