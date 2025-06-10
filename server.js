// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs"); // Import the file system module

const app = express();
const port = 3005;

// Define the database path
const dbDir = "./data";
const dbPath = path.join(dbDir, "votes.db");

// Ensure the data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
    console.log(`Created database directory: ${dbDir}`);
}

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  // Use dbPath here
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create the votes table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            option_name TEXT UNIQUE,
            count INTEGER DEFAULT 0
        )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Votes table checked/created.");
          // Initialize options if they don't exist
          initializeOptions();
        }
      }
    );
  }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static files from the React build directory
app.use(express.static(path.join(__dirname, "client", "dist")));

// Helper function to initialize options in the database
function initializeOptions() {
  const options = ["Elon", "Donald"]; // Your two voting options

  options.forEach((option) => {
    db.run(
      `INSERT OR IGNORE INTO votes (option_name, count) VALUES (?, 0)`,
      [option],
      function (err) {
        if (err) {
          console.error(`Error initializing option ${option}:`, err.message);
        } else if (this.changes > 0) {
          console.log(`Initialized option: ${option}`);
        }
      }
    );
  });
}

// API Endpoint to get current vote results (READ operation)
app.get("/api/votes", (req, res) => {
  db.all("SELECT option_name, count FROM votes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API Endpoint to record a vote (UPDATE operation)
app.post("/api/vote", (req, res) => {
  const { option } = req.body;

  if (!option) {
    return res.status(400).json({ error: "Option is required." });
  }

  db.run(
    `UPDATE votes SET count = count + 1 WHERE option_name = ?`,
    [option],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Option not found." });
      }
      res.json({ message: `Voted for ${option} successfully!` });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  // The frontend will now be served from the root URL because of client/dist/index.html
  console.log(`Frontend available at http://localhost:${port}/`);
});
