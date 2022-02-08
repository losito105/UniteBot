// imports
const {
  Client,
  Intents,
  MessageActionRow,
  MessageSelectMenu,
  Message,
  MessageButton,
  MessageAttachment,
} = require("discord.js");

const { con } = require('./database');
const https = require('https');

// bot info
// TODO: move to .env
const botToken = "OTE0NTc4MzIxOTgxOTY0Mzgw.YaPFcA.rkUE1bS6NEQ8vQ7pGFQg5s8fuIo";
const clientID = "914578321981964380";
const generalChannelID = "913977196153016391/913977196153016394";

// /pregame vars
var slashCommandUser = "";
var chosenMatchType = "";
var chosenPath = "";
var chosenPokémon = "";

// /postgame vars
var pointsScored = "";
var kills = "";
var assists = "";
var rating = "";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// create client
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// start the bot
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  slashCommandUser = interaction.user.username;

  if (interaction.isCommand()) {
    const { commandName } = interaction;

    /* scoreboard logic */
    if(commandName === "score") {
      const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('team')
          .setLabel('TEAM')
          .setStyle('PRIMARY'),

        new MessageButton()
          .setCustomId('enemy')
          .setLabel('ENEMY')
          .setStyle('SECONDARY'),

        new MessageButton()
          .setCustomId('exit')
          .setLabel('EXIT')
          .setStyle('DANGER'),
      );

      await interaction.reply({ 
        content: " |----------***SCOREBOARD***----------|\n|-------|                                    |-------|\n|-------|                                    |-------|\n|-------|                                    |-------|\n|-------|                                    |-------|\n|-------|                                    |-------|\n|-------|                                    |-------|\n",
        components: [row] });
    }

    /* /shiny logic */
    else if (commandName === "shiny") {
      // get photos from pokeapi
      const axios = require('axios');

      axios.get(`https://pokeapi.co/api/v2/pokemon/${interaction.options.getString("pokémon").toLowerCase()}`)
        .then(response => {
          const shinyUrl = response?.data.sprites?.front_shiny;

          const shinyImg = new MessageAttachment(shinyUrl);
          
          interaction.reply({files: [shinyImg], ephemeral: true});
        })
        .catch(error => {
          console.log(error);
          interaction.reply(`${interaction.options.getString("pokémon")} is not a Pokémon...`);
        });
    }

    /* /stats logic */
    else if (commandName === "stats") {
      var sql_use = 'USE unite';
      con.query(sql_use, function (err, result) {
        if (err) throw err;
        console.log("using unite db");
      });

      var sql_averages_query = `SELECT AVG(points) AS p, AVG(kills) AS k, AVG(assists) AS a, AVG(rating) AS r FROM stats WHERE id = '${interaction.options.getString("username")}'`;
      con.query(sql_averages_query, function (err, result) {
        if (err) throw err;
        console.log("successfully calculated averages");
        interaction.reply({
          content: `${interaction.options.getString("username")}'s Average Stats: Points: ${result[0].p}, Kills: ${result[0].k}, Assists: ${result[0].a}, Rating: ${result[0].r}`,
          ephemeral: true,
        });
      });
    }

    /* /postgame logic */
    else if (commandName === "postgame") {
      pointsScored = interaction.options.getString("points-scored");
      kills = interaction.options.getString("kills");
      assists = interaction.options.getString("assists");
      rating = interaction.options.getString("rating");

      var sql_use = 'USE unite';
      con.query(sql_use, function (err, result) {
        if (err) throw err;
        console.log("using unite db");
      });

      var sql_insert = `INSERT INTO stats (id, points, kills, assists, rating) VALUES ('${slashCommandUser}', ${pointsScored}, ${kills}, ${assists}, ${rating})`;
      con.query(sql_insert, function (err, result) {
        if (err) throw err;
        console.log("/postgame record successfully inserted!");
      });

      await interaction.reply({
        content: `Game Summary: Points Scored: ${pointsScored}, Kills: ${kills}, Assists: ${assists}, Rating: ${rating}`,
        ephemeral: true,
      });
    } 

    /* /pregame logic */
    else if (commandName === "pregame") {
      const matchTypeRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("matchType")
          .setPlaceholder("Select Match Type")
          .addOptions([
            {
              label: "Ranked",
              value: "ranked",
            },
            {
              label: "Standard",
              value: "standard",
            },
            {
              label: "Quick",
              value: "quick",
            },
          ]),
      );
      await interaction.reply({
        content: "Unite Bot is requesting pregame info ...",
        components: [matchTypeRow],
        ephemeral: true,
      });
    }
  } 
  
  else if (interaction.isSelectMenu()) {
    /* entered match type --> prompt for path */
    if (interaction.customId === "matchType") {
      chosenMatchType = interaction.values[0];
      // path selection
      const pathRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("path")
          .setPlaceholder("Select Path")
          .addOptions([
            {
              label: "Top",
              value: "top",
            },
            {
              label: "Mid",
              value: "mid",
            },
            {
              label: "Bottom",
              value: "bottom",
            },
          ]),
      );
      await interaction.update({ components: [pathRow] });
    } 
    
    /* entered path --> prompt for pokémon role */
    else if (interaction.customId === "path") {
      chosenPath = interaction.values[0];
      // Pokémon selection
      const pokémonRoleRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("pokémon-role")
          .setPlaceholder("Select Pokémon Role")
          .addOptions([
            {
              label: "All-Rounder",
              value: "all-rounder",
            },
            {
              label: "Attacker",
              value: "attacker",
            },
            {
              label: "Defender",
              value: "defender",
            },
            {
              label: "Speedster",
              value: "speedster",
            },
            {
              label: "Supporter",
              value: "supporter",
            },
          ]),
      );
      await interaction.update({ components: [pokémonRoleRow] });
    } 
    
    /* entered pokémon role --> prompt for pokémon choice */
    else if (interaction.customId === "pokémon-role") {
      if (interaction.values[0] === "all-rounder") {
        const allRounderRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("all-rounder-pokémon")
            .setPlaceholder("Select Pokémon")
            .addOptions([
              {
                label: "Charizard",
                description: "Melee, All-Rounder",
                value: "charizard",
              },
              {
                label: "Garchomp",
                description: "Melee, All-Rounder",
                value: "garchomp",
              },
              {
                label: "Lucario",
                description: "Melee, All-Rounder",
                value: "lucario",
              },
              {
                label: "Machamp",
                description: "Melee, All-Rounder",
                value: "machamp",
              },
            ]),
        );
        await interaction.update({
          components: [allRounderRow],
        });
      } 
      
      else if (interaction.values[0] === "attacker") {
        const attackerRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("attacker-pokémon")
            .setPlaceholder("Select Pokémon")
            .addOptions([
              {
                label: "Aloan Ninetales",
                description: "Ranged, Attacker",
                value: "aloan ninetales",
              },
              {
                label: "Cinderace",
                description: "Ranged, Attacker",
                value: "cinderace",
              },
              {
                label: "Cramorant",
                description: "Ranged, Attacker",
                value: "cramorant",
              },
              {
                label: "Decidueye",
                description: "Ranged, Attacker",
                value: "decidueye",
              },
              {
                label: "Gardevoir",
                description: "Ranged, Attacker",
                value: "gardevoir",
              },
              {
                label: "Greninja",
                description: "Ranged, Attacker",
                value: "greninja",
              },
              {
                label: "Pikachu",
                description: "Ranged, Attacker",
                value: "pikachu",
              },
              {
                label: "Sylveon",
                description: "Ranged, Attacker",
                value: "sylveon",
              },
              {
                label: "Venusaur",
                description: "Ranged, Attacker",
                value: "venusaur",
              },
            ]),
        );
        await interaction.update({
          components: [attackerRow],
        });
      } 
      
      else if (interaction.values[0] === "defender") {
        const defenderRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("defender-pokémon")
            .setPlaceholder("Select Pokémon")
            .addOptions([
              {
                label: "Blastoise",
                description: "Ranged, Defender",
                value: "blastoise",
              },
              {
                label: "Crustle",
                description: "Melee, Defender",
                value: "crustle",
              },
              {
                label: "Greedent",
                description: "Melee, Defender",
                value: "greedent",
              },
              {
                label: "Mamoswine",
                description: "Melee, Defender",
                value: "mamoswine",
              },
              {
                label: "Slowbro",
                description: "Ranged, Defender",
                value: "slowbro",
              },
              {
                label: "Snorlax",
                description: "Melee, Defender",
                value: "snorlax",
              },
            ]),
        );
        await interaction.update({
          components: [defenderRow],
        });
      } 
      
      else if (interaction.values[0] === "speedster") {
        const speedsterRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("speedster-pokémon")
            .setPlaceholder("Select Pokémon")
            .addOptions([
              {
                label: "Absol",
                description: "Melee, Speedster",
                value: "absol",
              },
              {
                label: "Gengar",
                description: "Melee, Speedster",
                value: "gengar",
              },
              {
                label: "Talonflame",
                description: "Melee, Speedster",
                value: "talonflame",
              },
              {
                label: "Zeraora",
                description: "Melee, Speedster",
                value: "zeraora",
              },
            ]),
        );
        await interaction.update({
          components: [speedsterRow],
        });
      } 
      
      else if (interaction.values[0] === "supporter") {
        const supporterRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("supporter-pokémon")
            .setPlaceholder("Select Pokémon")
            .addOptions([
              {
                label: "Blissey",
                description: "Melee, Supporter",
                value: "blissey",
              },
              {
                label: "Eldegoss",
                description: "Ranged, Supporter",
                value: "eldegoss",
              },
              {
                label: "Mr. Mime",
                description: "Melee, Supporter",
                value: "mr. mime",
              },
              {
                label: "Wigglytuff",
                description: "Melee, Supporter",
                value: "wigglytuff",
              },
            ]),
        );
        await interaction.update({
          components: [supporterRow],
        });
      }
    } 
    
    /* entered pokémon choice --> output /pregame result */
    else if (
      interaction.customId === "all-rounder-pokémon" ||
      interaction.customId === "attacker-pokémon" ||
      interaction.customId === "defender-pokémon" ||
      interaction.customId === "speedster-pokémon" ||
      interaction.customId === "supporter-pokémon"
    ) {
      chosenPokémon = capitalizeFirstLetter(interaction.values[0]);
      await interaction.reply({
        content: `${slashCommandUser} wants to play a ${chosenMatchType} match as ${chosenPokémon} and go ${chosenPath} path!`,
        ephemeral: false,
      });
    }
  }
});

// NOTE: this should be last 
client.login(botToken);

module.exports = {
  botToken,
  clientID,
};
