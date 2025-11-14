const express = require("express");
const https = require("https");
const fs = require("fs");
const readline = require("readline");
require('dotenv').config({quiet: true});

const app = express();
const PORT = 6767;
const name = process.env.NAME;
console.log("Hello", name);
const servers = process.env.SERVERS.split(" ");

// TLS/SSL Configuration
const tlsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Client interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${name}: `,
});

// Function to safely print messages without disrupting the prompt
function pr(message) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.log(message);
  rl.prompt(true);
}

// POST endpoint
app.post("/", (req, res) => {
  pr(`${req.body.user}: ${req.body.message}`);

  res.status(200).json({
    success: true,
    message: "Message received!\n",
    receivedData: req.body,
  });
});

// Start HTTPS server
https.createServer(tlsOptions, app).listen(PORT, () => {
  console.log("Secure server running on port", PORT);
  rl.prompt();
});

rl.on("line", async (line) => {
  const input = line.trim();
  if (input) {
    servers.forEach(async (server) => {
      try {
        const response = await fetch(`https://${server}:${PORT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: name,
            message: input,
          }),
        });
        // const data = await response.json();
        // printMessage("Server response: " + data.message);
      } catch (error) {
        // printMessage("Error sending message: " + error.message);
      }
    });
  }
  rl.prompt();
});