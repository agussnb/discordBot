const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const  Member = require('../../serverDb'); // Asegúrate de que esta importación sea correcta

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trabajar')
    .setDescription('Trabajas en distintos campos para conseguir plata$'),

  async execute(interaction) {
    const select = new StringSelectMenuBuilder()
      .setCustomId('trabajar')
      .setPlaceholder('Selecciona un lugar para trabajar')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Mina')
          .setDescription('Trabaja en una mina')
          .setValue('mina'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Delivery')
          .setDescription('Trabaja como delivery de comida rápida')
          .setValue('delivery'),
      );
    const row = new ActionRowBuilder()
      .addComponents(select);

    await interaction.reply({ content: 'Elige un lugar para trabajar:', components: [row] });

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelectMenuOptionBuilder, time: 15000 });

    collector.on('collect', async (selectInteraction) => {
      const subCommand = selectInteraction.values[0];
      const userId = selectInteraction.user.id;
      console.log(subCommand);
      
      switch (subCommand) {
        case "mina":
          const minerales = ["carbon", "hierro", "oro", "platino", "cobre", "plata", "rubi", "safiro", "diamante", "esmeralda", "amatista"];
          const mineralPrecio = {
            carbon: 2,
            hierro: 3,
            oro: 5,
            platino: 8,
            cobre: 3,
            plata: 5,
            rubi: 10,
            safiro: 15,
            diamante: 20,
            esmeralda: 18,
            amatista: 25
          };

          const mineralAleatorio = minerales[Math.floor(Math.random() * minerales.length)];
          const mineralObtenido = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
          const precio = mineralPrecio[mineralAleatorio];
          const obtainedMoney = mineralObtenido * precio;

          const existingMember = await Member.findOne({ discordId: userId });
          if (!existingMember) {
            console.error(`Miembro con id ${userId} no encontrado`);
            return;
          }

          existingMember.money += obtainedMoney;
          await existingMember.save();

          await selectInteraction.reply(
            `Trabajaste en la mina:\n` +
            `Conseguiste:\n` +
            `${mineralAleatorio.charAt(0).toUpperCase() + mineralAleatorio.slice(1)}\n` +
            `Cantidad: ${mineralObtenido}\n` +
            `Lo vendiste cada uno a $${precio} obteniendo $${obtainedMoney}`
          );
          collector.stop();
          break;

        case "delivery":
          const comida = [
            "Pizza", "Hamburguesa", "Milanesa", "Mila napo", 
            "Hamburguesa doble", "Hamburguesa doble c/ cheddar y bacon", 
            "Empanada de carne", "Empanada de humita", "Empanada de pollo"
          ];
          const precioComida = [5, 10, 15, 20, 15, 25, 20, 25, 30];

          async function processDelivery(userId) {
            const indiceRandom = Math.floor(Math.random() * comida.length);
            const comidaAEntregar = comida[indiceRandom];
            const pago = precioComida[indiceRandom] / 2;
            const propinaObtenida = Math.floor(Math.random() * 16);

            const existingMember = await Member.findOne({ discordId: userId });
            if (!existingMember) {
              console.error(`Miembro con id ${userId} no encontrado`);
              return;
            }

            existingMember.money += pago + propinaObtenida;
            await existingMember.save();
            await selectInteraction.reply(
              `Trabajaste como delivery:\n` +
              `Entregaste ${comidaAEntregar} y te pagaron $${pago}.\n` +
              `Propina: ${propinaObtenida}.\n` +
              `Dinero total obtenido: ${pago + propinaObtenida}`
            );
          }

          await processDelivery(userId);
          collector.stop();
          break;

        default:
          await selectInteraction.reply("Opción no válida");
          break;
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await interaction.followUp('Se acabó el tiempo para seleccionar una opción.');
      }
    });
  },
};
