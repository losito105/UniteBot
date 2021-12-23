const { MongoClient } = require("mongodb");

const db_password = "Giants132"; // TODO: add to .env file

const uri = `mongodb+srv://losito105:${db_password}@unitestats.cmi2g.mongodb.net/UniteStats?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var UniteDatabase = client.db("UniteStats");
var statsCollection = UniteDatabase.collection("stats");

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to the database!");
  } catch (error) {
    console.log(error);
  }
}
run(); // connect to the db

/* adds db entry representing a player's game summary */
async function addEntry(database, collection, doc) {
  try {
    const result = await collection.insertOne(doc);
  } catch (error) {
    console.log(error);
  }
}

/* handles /stats command and construct leaderboard */
async function calculateStats(database, collection) {
  const playerUsernames = await collection.distinct("player");

  var averagesByPlayer = [];

  // get game summaries & use them to calculate averages
  for (var i = 0; i < playerUsernames.length; i++) {
    var gameSummariesCursor = await collection.find({
      "player": playerUsernames[i],
    });

    var pointsScoredTotal = 0;
    var killsTotal = 0;
    var assistsTotal = 0;
    var ratingTotal = 0;

    var numDocuments = 0;

    await gameSummariesCursor.forEach((doc) => {
      if (
        !isNaN(doc.pointsScored) &&
        !isNaN(doc.kills) &&
        !isNaN(doc.assists) &&
        !isNaN(doc.rating)
      ) {
        pointsScoredTotal += parseInt(doc.pointsScored);
        killsTotal += parseInt(doc.kills);
        assistsTotal += parseInt(doc.assists);
        ratingTotal += parseInt(doc.rating);
        numDocuments += 1;
      } else {
        console.log(
          "Error - one or more of the values entered was not an integer!",
        );
        return;
      }
    });

    if (numDocuments != 0) {
      averagesByPlayer.push({
        player: playerUsernames[i],
        averagePointsScored: Math.ceil(pointsScoredTotal / numDocuments),
        averageKills: Math.ceil(killsTotal / numDocuments),
        averageAssists: Math.ceil(assistsTotal / numDocuments),
        averageRating: Math.ceil(ratingTotal / numDocuments),
      });
    }
  }

  return averagesByPlayer;
}

module.exports = {
  UniteDatabase,
  statsCollection,
  addEntry,
  calculateStats,
};
