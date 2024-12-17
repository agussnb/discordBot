const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  Partials,
} = require("discord.js");
const { token, Mongo_Uri } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const { giveExperience, levelUpEvent, checkLevelUp } = require("./levelSystem");
const Member = require("./serverDb.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");

// Conectar a MongoDB usando Mongoose
const MONGO_URI = Mongo_Uri;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});
module.exports = { client};
client.once(Events.ClientReady, (readyClient) => {
  console.log(`¡Listo! Conectado como ${readyClient.user.tag}`);
});

client.login(token);

// Cargar los archivos de comandos
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] El comando en ${filePath} le falta la propiedad "data" o "execute".`
      );
    }
  }
}

client.distube = new DisTube(client, {
  //leaveOnFinish: true,
  //searchCooldown: 10,
  //leaveOnEmpty: false,
  //leaveOnStop: true,
  //emitNewSongOnly: true,
  //emitAddSongtWhenCreatingQueue: false,
  //emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin(),
    new YtDlpPlugin(),
  ],
});


const status = (queue) =>
  `Volume: \`${queue.volume}%\` |  Filter: \`${
    queue.filters.names.join(", ") || "Inactive"
  }\` | Repeat: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? "Queue" : "Track") : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
client.distube
  .on("playSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#a200ff")
          .setDescription(
            `🎶 | Reproduciendo: \`${song.name}\` - \`${
              song.formattedDuration
            }\`\nDe: ${song.user}\n${status(queue)}`
          ),
      ],
    })
  )
  .on("addSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#a200ff")
          .setDescription(
            `🎶 | Agregada \`${song.name}\` - \`${song.formattedDuration}\` a la cola por: ${song.user}`
          ),
      ],
    })
  )
  .on("addList", (queue, playlist) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#a200ff")
          .setDescription(
            `🎶 | Agregada desde \`${playlist.name}\` : \`${
              playlist.songs.length
            } \` queue tracks; \n${status(queue)}`
          ),
      ],
    })
  )
  .on("error", (channel, e) => {
    if (channel) channel.send(`⛔ | Error: ${e.toString().slice(0, 1974)}`);
    else console.error(e);
  })
  .on("empty", (channel) =>
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(
            "⛔ | El canal de voz esta vacio! Abandonando canal..."
          ),
      ],
    })
  )
  .on("searchNoResult", (message, query) =>
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription("`⛔ | No hubo resultados por...: `${query}`!`"),
      ],
    })
  )
  .on("finish", (queue) =>
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#a200ff")
          .setDescription("🏁 | La cola termino!"),
      ],
    })
  );

// Cargar los comandos
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No se encontró el comando ${interaction.commandName}.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Ocurrió un error al ejecutar este comando.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Ocurrió un error al ejecutar este comando.",
        ephemeral: true,
      });
    }
  }
});

// Deteccion de usuarios en canales de voz cuando arranca el bot
client.once(Events.ClientReady, (readyClient) => {
  console.log(`¡Listo! Conectado como ${readyClient.user.tag}`);

  // Obtener todos los estados de voz al iniciar el bot
  client.guilds.cache.forEach((guild) => {
    guild.voiceStates.cache.forEach(async (voiceState) => {
      if (voiceState.channel) {
        const memberId = voiceState.member.id;
        const currentTime = new Date();

        // Verifica si el miembro ya está en la base de datos
        const usuario = await Member.findOne({ discordId: memberId });
        if (!usuario) {
          const newMember = new Member({
            discordId: memberId,
            username: voiceState.member.user.username,
            experience: 0, // o el valor inicial que desees
            level: 1, // o el nivel inicial
          });
          await newMember.save();
          console.log(
            `Se guardó a ${voiceState.member.user.username} en la base de datos.`
          );
        }

        // Inicia el seguimiento de la experiencia para el usuario
        voiceJoinTimes[memberId] = {
          joinTime: currentTime,
          accumulatedTime: 0,
        };
        console.log(
          `${voiceState.member.user.username} ya está en el canal de voz: ${voiceState.channel.name}`
        );
      }
    });
  });
});

//Deteccion cuando un usuario se mutea o se ensordece en un canal de voz
client.on("voiceStateUpdate", (oldState, newState) => {
  const user = newState.member ? newState.member.user : null;
  if (!user) return;

  const username = user.username;

  // Detección de muteo
  if (!oldState.selfMute && newState.selfMute) {
    console.log(`${username} se ha muteado.`);
  } else if (oldState.selfMute && !newState.selfMute) {
    console.log(`${username} se ha desmuteado.`);
  }

  // Detección de ensordecimiento
  if (!oldState.selfDeaf && newState.selfDeaf) {
    console.log(`${username} se ha ensordecido.`);
  } else if (oldState.selfDeaf && !newState.selfDeaf) {
    console.log(`${username} se ha desensordecido.`);
  }
});

// Detectar cuando un usuario se une a un canal de voz
const voiceJoinTimes = {};
client.on("voiceStateUpdate", async (oldState, newState) => {
  const oldChannelID = oldState.channel ? oldState.channel.id : null;
  const newChannelID = newState.channel ? newState.channel.id : null;
  const gamingChannel = "832098522148372492";
  const laburandoChannel = "832098522148372491";
  const rotmcChannel = "881187689829912606";
  const penitenciaChannel = "842930897857937420";
  const discordPrimeChannel = "1053832635421556807";
  const extraDiversionChannel = "1051918221277663253";
  const guidoNoChannel = "1051918221277663253";
  const currentTime = new Date();

  if (
    newChannelID === gamingChannel ||
    newChannelID === laburandoChannel ||
    newChannelID === rotmcChannel ||
    newChannelID === penitenciaChannel ||
    newChannelID === discordPrimeChannel ||
    newChannelID === extraDiversionChannel ||
    newChannelID === guidoNoChannel
  ) {
    if (!oldChannelID && newChannelID) {
      const usuario = await Member.findOne({ discordId: newState.member.id });

      // Si el miembro no existe, se agrega a la base de datos
      if (!usuario) {
        const newMember = new Member({
          discordId: newState.member.id,
          username: newState.member.user.username,
          experience: 0, // o el valor inicial que desees
          level: 1, // o el nivel inicial
        });
        await newMember.save();
        console.log(
          `Se guardó a ${newState.member.user.username} en la base de datos.`
        );
      }

      console.log(
        `Se unió ${newState.member.user.username} al canal de voz: ${newState.channel.name}`
      );
      voiceJoinTimes[newState.member.id] = {
        joinTime: currentTime,
        accumulatedTime: 0,
      };
    }
  } else if (oldChannelID && !newChannelID) {
    const usuario = await Member.findOne({ discordId: oldState.member.id });
    console.log(
      `Se fue ${usuario.username} del canal de voz: ${oldState.channel.name}`
    );
    if (voiceJoinTimes[oldState.member.id]) {
      const joinTime = voiceJoinTimes[oldState.member.id].joinTime;
      const accumulatedTime =
        voiceJoinTimes[oldState.member.id].accumulatedTime +
        (currentTime - joinTime);
      voiceJoinTimes[oldState.member.id].accumulatedTime = accumulatedTime;
    }
  }
});

// Intervalo para otorgar experiencia cada 30 segundos
setInterval(() => {
  const currentTime = new Date();
  for (const userId in voiceJoinTimes) {
    const userInfo = voiceJoinTimes[userId];
    const joinTime = userInfo.joinTime;
    const elapsedTime = currentTime - joinTime;
    const secondsPassed = Math.floor(elapsedTime / 1000);

    if (secondsPassed >= 30) {
      giveExperience(userId, 1);
      userInfo.joinTime = currentTime;
    }
  }
}, 30000);

// Evento para felicitar a un usuario cuando sube de nivel
levelUpEvent.on("levelUp", (member) => {
  const channelId = "838989571374317578";
  const channel = client.channels.cache.get(channelId);
  if (channel) {
    const userMention = `<@${member.discordId}>`;
    const message = `${userMention} ha subido de nivel y ahora es nivel ${member.level}! 🎉`;
    channel.send(message);
  } else {
    console.error("El canal de texto específico no fue encontrado.");
  }
});

// Manejo de mensajes
const respuestas = {
  hola: "¡Hola!",
  gabi: "Un gordo aplastado",
  ale: [
    "VLLC",
    "Main skarner",
    "Hay que matar a todos los k",
    "Qué asco que me dan los kirchneristas",
  ],
  toti: "Yo me pase el darksouls 3",
  agus: "Gymbro",
  gragas: "Booomba",
  guido: "Soy challanger",
  motiel: "Un rockstar",
  triky: "Heredero de la guzmoneria",
  ivo: "El carry de las guerras",
  chola: "Sale timba?",
  juan: "Cuando sea grande quiero tocar la guitarra como el",
};

client.on("messageCreate", (message) => {
  const contentLowerCase = message.content.toLowerCase();
  if (!message.author.bot && respuestas[contentLowerCase]) {
    const respuesta = Array.isArray(respuestas[contentLowerCase])
      ? respuestas[contentLowerCase][
          Math.floor(Math.random() * respuestas[contentLowerCase].length)
        ]
      : respuestas[contentLowerCase];
    message.reply(respuesta);
  }
});
