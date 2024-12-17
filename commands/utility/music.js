const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  VoiceChannel,
  GuildEmoji,
} = require("discord.js");
const client = require("../../index");
const distube = client.distube;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("musica")
    .setDescription("Sistema de musica")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Pone una cancion")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Especifica el nombre de la cancion o la URL")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("volumen")
        .setDescription("Ajusta el volumen")
        .addNumberOption((option) =>
          option
            .setName("porcentaje")
            .setDescription("Ajustar volumen en unidades apropiadas: 10 = 10%")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("opciones")
        .setDescription("Opciones para el sistema de musica")
        .addStringOption((option) =>
          option
            .setName("opciones")
            .setDescription("Selecciona opciones de musica")
            .setRequired(true)
            .addChoices(
              { name: "queue", value: "queue" },
              { name: "skip", value: "skip" },
              { name: "pause", value: "pause" },
              { name: "resume", value: "resume" },
              { name: "stop", value: "stop" },
              { name: "loop-queue", value: "loop-queue" },
              { name: "loop-all", value: "loop-all" },
              { name: "autoplay", value: "autoplay" }
            )
        )
    ),
  async execute(interaction, client) {
    const { options, member, guild, channel } = interaction;
    const option = options.getString("options");
    const subcommand = options.getSubcommand();
    const query = options.getString("queue");
    const volume = options.getNumber("pecentage");
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();

    if (!VoiceChannel) {
      embed
        .setColor("Red")
        .setDescription(
          "Tenes que estar conectado a un canl de voz para usar el comando"
        );
      return interaction.reply({ embeds: [embed] });
    }
    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed
        .setColor("Red")
        .setDescription(
          `No podes usar el sistema de musica porque ya esta activado en <#${guild.members.me.voice.channelId}>`
        );
      return interaction.reply({ embeds: [embed] });
    }

    try {
      switch (subcommand) {
        case "play":
          client.distube.play(voiceChannel, query, {
            textChannel: channel,
            member: member,
          });
          return interaction.reply({ content: "Solicitud recibida" });
        case "volume":
          client.distube.setVolume(voiceChannel, volume);
          return interaction.reply({
            content: `El nivel de volumen fue seteado a ${volume}%`,
          });
        case "options":
          const queue = await client.distube.getQueue(voiceChannel);

          if (!queue) {
            embed.setColor("Red").setDescription("No hay una cola activa");
            return interaction.reply({ embeds: [embed], ephemeral: true });
          }
          switch (option) {
            case "skip":
              await queue.skip(voiceChannel);
              embed.setColor("Blue").setDescription("La cancion fue skipeada");
              return interaction.reply({ embeds: [embed] });
            case "stop":
              await queue.stop(voiceChannel);
              embed.setColor("Blue").setDescription("La cancion fue parada");
              return interaction.reply({ embeds: [embed] });
            case "pause":
              await queue.pause(voiceChannel);
              embed.setColor("Blue").setDescription("La cancion fue pauseada");
              return interaction.reply({ embeds: [embed] });
            case "resume":
              await queue.resume(voiceChannel);
              embed.setColor("Blue").setDescription("La cancion se reanudo");
              return interaction.reply({ embeds: [embed] });
            case "queue":
              await voiceChannel;
              embed
                .setColor("Blue")
                .setDescription(
                  `${queue.songs.map(
                    (song, id) =>
                      `\n**${id + 1}.** ${song.name} - \`${
                        song.formattedDuration
                      }`
                  )}`
                );
              return interaction.reply({ embeds: [embed] });

            case "loopqueue":
              if (queue.repeatMode === 2) {
                await client.distube.setRepeatMode(interaction, 0);
                embed
                  .setColor("Blue")
                  .setDescription(
                    "`` :repeat:``| **El track no esta loopeado en modo:** `Queue`"
                  );
                return interaction.reply({ embeds: [embed] });
              } else {
                await client.distube.setRepeatMode(interaction, 2);
                embed
                  .setColor("Blue")
                  .setDescription(
                    "`` :repeat:``| **El track esta loopeado en modo:** `Queue`"
                  );
                return interaction.reply({ embeds: [embed] });
              }
            case "loopall":
              if (queue.repeatMode === 0) {
                await client.distube.setRepeatMode(interaction, 1);
                embed
                  .setColor("Blue")
                  .setDescription(
                    "`` :repeat:``| **El track esta loopeado en modo:** `Todos`"
                  );
                return interaction.reply({ embeds: [embed] });
              } else {
                await client.distube.setRepeatMode(interaction, 0);
                embed
                  .setColor("Blue")
                  .setDescription(
                    "`` :repeat:``| **El track no esta loopeado en modo:** `Todos`"
                  );
                return interaction.reply({ embeds: [embed] });
              }
            case "autoplay":
              if (!queue.autoplay) {
                await client.distube.toggleAutoplay(interaction);
                embed
                  .setColor("Blue")
                  .setDescription(
                    "`` :repeat:``| **El auto play fue:** `Activado`"
                  );
                return interaction.reply({ embeds: [embed] });
              } else {
                await client.distube.toggleAutoplay(interaction);
                embed
                  .setColor("Blue")
                  .setDescription(
                    "`` :repeat:``| **El auto play fue:** `Desactivado`"
                  );
                return interaction.reply({ embeds: [embed] });
              }
          }
      }
    } catch (error) {
      console.log(error);
      embed.setColor("Red").setDescription("Algo salio mal");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
