// NOTE: node deploy-commands.js updates commands, runs bot, and connects to db
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientID, botToken } = require("./index");

const commands = [
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Shows our server's leaderboard!"),
  new SlashCommandBuilder()
    .setName("pregame")
    .setDescription("Requests pregame info!"),
  new SlashCommandBuilder()
    .setName("postgame")
    .setDescription(
      "Requests postgame stats i.e. points scored, kills, assists, rating!",
    )
    .addStringOption((option) =>
      option
        .setName("points-scored")
        .setDescription("Points Scored")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("kills").setDescription("Kills").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("assists").setDescription("Assists").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("rating").setDescription("Rating").setRequired(true),
    ),
  // NOTE: additional slash commands can be added here
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(botToken);

rest
  .put(Routes.applicationCommands(clientID), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
