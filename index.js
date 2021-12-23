// TODO: move to .env
const botToken = "OTE0NTc4MzIxOTgxOTY0Mzgw.YaPFcA.rkUE1bS6NEQ8vQ7pGFQg5s8fuIo";
const clientID = "914578321981964380";

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

const {
  UniteDatabase,
  statsCollection,
  addEntry,
  calculateStats,
} = require("./database");

const {
  Client,
  Intents,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

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
    if (commandName === "stats") {
      var leaderboardData = await calculateStats(
        UniteDatabase,
        statsCollection,
      );
      var highestAvgPts = [0, ""];
      var highestAvgKills = [0, ""];
      var highestAvgAssists = [0, ""];
      var highestAvgRating = [0, ""];

      for (var i = 0; i < leaderboardData.length; i++) {
        var player = leaderboardData[i].player;

        if (leaderboardData[i].averagePointsScored > highestAvgPts[0]) {
          highestAvgPts[0] = leaderboardData[i].averagePointsScored;
          highestAvgPts[1] = player;
        }

        if (leaderboardData[i].averageKills > highestAvgKills[0]) {
          highestAvgKills[0] = leaderboardData[i].averageKills;
          highestAvgKills[1] = player;
        }

        if (leaderboardData[i].averageAssists > highestAvgAssists[0]) {
          highestAvgAssists[0] = leaderboardData[i].averageAssists;
          highestAvgAssists[1] = player;
        }

        if (leaderboardData[i].averageRating > highestAvgRating[0]) {
          highestAvgRating[0] = leaderboardData[i].averageRating;
          highestAvgRating[1] = player;
        }
      }
      var leaderboard = `------------------------------------------------------\n`;
      leaderboard += `HIGHEST AVERAGE PPG :: ${highestAvgPts[0]} (${highestAvgPts[1]})\n`;
      leaderboard += `------------------------------------------------------\n`;

      leaderboard += `HIGHEST AVERAGE KPG :: ${highestAvgKills[0]} (${highestAvgKills[1]})\n`;
      leaderboard += `------------------------------------------------------\n`;

      leaderboard += `HIGHEST AVERAGE APG :: ${highestAvgAssists[0]} (${highestAvgAssists[1]})\n`;
      leaderboard += `------------------------------------------------------\n`;

      leaderboard += `HIGHEST AVERAGE RATING :: ${highestAvgRating[0]} (${highestAvgRating[1]})\n`;
      leaderboard += `------------------------------------------------------\n`;

      await interaction.reply({
        content: leaderboard,
        ephemeral: false,
      });
    } else if (commandName === "postgame") {
      pointsScored = interaction.options.getString("points-scored");
      kills = interaction.options.getString("kills");
      assists = interaction.options.getString("assists");
      rating = interaction.options.getString("rating");

      const doc = {
        player: slashCommandUser,
        pointsScored: pointsScored,
        kills: kills,
        assists: assists,
        rating: rating,
      };

      addEntry(UniteDatabase, statsCollection, doc);

      await interaction.reply({
        content: `Game Summary: Points Scored: ${pointsScored}, Kills: ${kills}, Assists: ${assists}, Rating: ${rating}`,
        ephemeral: true,
      });
    } else if (commandName === "pregame") {
      // match type selection
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
  } else if (interaction.isSelectMenu()) {
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
    } else if (interaction.customId === "path") {
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
    } else if (interaction.customId === "pokémon-role") {
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
      } else if (interaction.values[0] === "attacker") {
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
      } else if (interaction.values[0] === "defender") {
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
      } else if (interaction.values[0] === "speedster") {
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
      } else if (interaction.values[0] === "supporter") {
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
    } else if (
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

client.login(botToken);

module.exports = {
  botToken,
  clientID,
};
