var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = {
  con
};