const express = require("express");
const readline = require("readline");

const app = express();
const PORT = 3000;
const servers = ["localhost"];
const user = "lucaslng";

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Client interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Message: ",
});

// Function to safely print messages without disrupting the prompt
function printMessage(message) {
  // Clear the current line
  readline.clearLine(process.stdout, 0);
  // Move cursor to beginning of line
  readline.cursorTo(process.stdout, 0);
  // Print the message
  console.log(message);
  // Redisplay the prompt
  rl.prompt(true);
}

// POST endpoint
app.post("/", (req, res) => {
  printMessage(JSON.stringify(req.body, null, 2));
  printMessage("---");

  res.status(200).json({
    success: true,
    message: "Message received!\n",
    receivedData: req.body,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Send POST requests to http://localhost:${PORT}`);
  rl.prompt();
});

rl.on("line", async (line) => {
  const input = line.trim();
  if (input) {
    servers.forEach(async (server) => {
      try {
        const response = await fetch(`http://${server}:${PORT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user,
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