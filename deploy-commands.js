// imports
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientID, botToken } = require("./index");

// define commands 
const commands = [
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Shows averages of a player's stats!")
    .addStringOption((option) =>
      option.setName("username").setDescription("username").setRequired(true),
    ),
  
  new SlashCommandBuilder()
    .setName("melody")
    .setDescription("Generates a random melody!"),

  new SlashCommandBuilder()
    .setName("pregame")
    .setDescription("Requests pregame info!"),
  
  new SlashCommandBuilder()
    .setName("shiny")
    .setDescription("Pull up a photo of a Pokémon's shiny form!")
    .addStringOption((option) =>
      option.setName("pokémon").setDescription("pokémon").setRequired(true),
    ),

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

// register commands
rest
  .put(Routes.applicationCommands(clientID), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
