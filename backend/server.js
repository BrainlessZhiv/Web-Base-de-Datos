// Import Express, dotenv, and serve-index
const express = require("express");
require("dotenv").config();

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the MySQL server.");
});

// Initialize Express
const app = express();

// Define the port
const PORT = process.env.DB_PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json

// Serve static files and enable directory listing
const directoryPath = "./src"; // Path to the directory you want to serve
app.use(express.static(directoryPath));

// Define a root route
app.get("/", (req, res) => {
  res.send("Express server is running!");
});

app.get("/get-entries", async (req, res) => {
  const query = "SELECT * FROM " + process.env.DB_TABLE;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching entries:", error);
      return res
        .status(500)
        .json({ message: "Error fetching entries", error: error });
    }
    res.json(results);
  });
});

// Add the /add-entry endpoint
app.post("/add-entry", async (req, res) => {
  const { name, amount, info, date } = req.body;

  // Basic validation
  if (!name || !amount || !date) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  const query =
    "INSERT INTO " + process.env.DB_TABLE + "(name, amount, info, date) VALUES (?, ?, ?, ?)";

  connection.query(
    query,
    [name, amount, info, date],
    (error, results, fields) => {
      if (error) {
        console.error("Error adding entry:", error);
        return res
          .status(500)
          .json({ message: "Error adding entry", error: error });
      }
      console.log("Entry added:", results);
      res.status(201).json({
        message: "Entry added successfully",
        entryId: results.insertId,
      });
    }
  );
});

// Add the /delete-entry endpoint
app.post("/delete-entry", async (req, res) => {
  const { id } = req.body;  

  const query = "DELETE FROM " + process.env.DB_TABLE + " WHERE id = ?";

  connection.query(query, [id], (error, results, fields) => {
    if (error) {
      console.error("Error deleting entry:", error);
      return res
        .status(500)
        .json({ message: "Error deleting entry", error: error });
    }
    console.log("Entry deleted:", results);
    res.status(200).json({ message: "Entry deleted successfully" });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
