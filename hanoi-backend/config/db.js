const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hanoi_game",
  waitForConnections: true,
  connectionLimit: 100, // Important for your 180 player goal
  queueLimit: 0
});

module.exports = pool.promise(); 