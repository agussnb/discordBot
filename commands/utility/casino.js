const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");
const Member = require("../../serverDb");

const docenas = {
  primera: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  segunda: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  tercera: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36],
};
const rojo = "rojo";
const negro = "negro";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("casino")
    .setDescription("Apuesta toda tu dinero en el casino! :)")
    .toJSON(),

  async execute(interaction) {
    const numeros = Array.from({ length: 37 }, (_, i) => ({ label: i, valueOf: i }));

    async function girarRuleta() {
      const numero = Math.floor(Math.random() * numeros.length);
      return numero;
    }

    async function apostar(userId, apuesta, numeroUsuario) {
      try {
        const numeroRuleta = await girarRuleta();
        const member = await Member.findOne({ discordId: userId });

        if (!member) {
          return { status: "error", message: "Usuario no encontrado", numeroRuleta };
        }

        if (member.money < apuesta) {
          return { status: "error", message: "Fondos insuficientes", numeroRuleta };
        }

        member.money -= apuesta;

        if (numeroUsuario === numeroRuleta) {
          member.money += apuesta * 36;
          await member.save();
          return { status: "ganó", numeroRuleta };
        } else {
          await member.save();
          return { status: "perdió", numeroRuleta };
        }
      } catch (error) {
        console.error("Error al apostar:", error);
        return { status: "error", message: "Hubo un error al procesar la apuesta", numeroRuleta: null };
      }
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId("casino")
      .setPlaceholder("Selecciona un lugar donde jugar")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Ruleta")
          .setDescription("Ruleta tradicional")
          .setValue("ruleta"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Blackjack")
          .setDescription("Blackjack tradicional")
          .setValue("blackjack")
      );

    const row = new ActionRowBuilder().addComponents(select);
    await interaction.reply({
      content: "Elige un lugar para jugar",
      components: [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelectMenu,
      time: 15000,
    });

    collector.on("collect", async (selectInteraction) => {
      const subCommand = selectInteraction.values[0];
      const userId = selectInteraction.user.id;

      switch (subCommand) {
        case "ruleta":
          await selectInteraction.reply(
            "¿A qué número quieres apostar y cuánto deseas apostar? (Ejemplo: \"5 100\")"
          );

          const apuestaCollector = interaction.channel.createMessageCollector({
            filter: (msg) => msg.author.id === userId,
            max: 1,
            time: 15000,
          });

          apuestaCollector.on("collect", async (msg) => {
            const contenido = msg.content.trim().split(" ");
            if (contenido.length === 2) {
              const numero = parseInt(contenido[0]);
              const apuesta = parseInt(contenido[1]);

              if (!isNaN(numero) && !isNaN(apuesta) && numero >= 0 && numero <= 36 && apuesta > 0) {
                const gifRuleta = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3Vlank4d3o1YW44bmpoaThwdG51c2htMnF2aWgxejI5ZTVrb3J5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2OGAkvd4T2Pd9YNiKH/giphy.gif"; // URL del GIF

                // Crear un embed con el GIF
                const embed = new EmbedBuilder()
                  .setDescription("La ruleta está girando... 🎰")
                  .setImage(gifRuleta)
                  .setColor("#FF4500");

                // Enviar el embed con el GIF
                await interaction.followUp({ embeds: [embed] });

                setTimeout(async () => {
                  const resultado = await apostar(userId, apuesta, numero);

                  await interaction.followUp(
                    `La pelota cayó en el número **${resultado.numeroRuleta}**.`
                  );

                  if (resultado.status === "ganó") {
                    await interaction.followUp(
                      `<@${userId}> ganó $${apuesta * 36}. ¡Felicidades! 🎉`
                    );
                  } else if (resultado.status === "perdió") {
                    await interaction.followUp(`<@${userId}> perdió $${apuesta}. 😔`);
                  } else {
                    await interaction.followUp(resultado.message);
                  }
                }, 5000); // Tiempo para mostrar el GIF
              } else {
                await interaction.followUp(
                  "El formato de entrada no es válido. Debes ingresar un número entre 0 y 36 y una apuesta válida."
                );
              }
            } else {
              await interaction.followUp(
                "El formato de entrada no es válido. Debes ingresar un número entre 0 y 36 y una apuesta válida."
              );
            }
            apuestaCollector.stop();
          });

          apuestaCollector.on("end", async (collected, reason) => {
            if (reason === "time") {
              await interaction.followUp(
                "Se acabó el tiempo para ingresar un número y una apuesta."
              );
            }
          });
          break;

        case "blackjack":
          await selectInteraction.reply("El blackjack está en desarrollo.");
          break;
      }
    });
  },
};


