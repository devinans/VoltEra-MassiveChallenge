const mysql = require("mysql");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
  host: "localhost",
  username: "root", // Pastikan ini adalah "user" bukan "username"
  password: "",
  database: "voltera_db",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL server.");

  const username = "admnvoltera@gmail.com";
  const password = "dudu123";

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return;
    }

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hash], (err, result) => {
      if (err) {
        console.error("Error inserting user into database:", err);
      } else {
        console.log("User added successfully.");
      }
      db.end();
    });
  });
});
