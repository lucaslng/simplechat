// server.js

import { NAME, PORT } from "./const.js";
import { servers } from "./mdns.js";
import { rl, pr } from "./inout.js";

import express, { json, urlencoded } from "express";

const app = express();
console.log("Hello", NAME);


app.use(json());
app.use(urlencoded({ extended: true }));

app.post("/", (req, res) => {
  pr(`${req.body.name} on ${req.ip.split(':').at(-1)}: ${req.body.message}`);
  res.status(200);
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  rl.prompt();
});

rl.on("line", async (line) => {
  const input = line.trim();
  if (input) {
    servers.forEach(async (server) => {
      try {
        const response = sendMsg(server, input);
        if (!response.ok) {
          pr("Response", response.status, "for", server);
          servers.delete(server);
        }
      } catch (error) {
        pr("Error sending message to", server);
        servers.delete(server);
      }
    });
  }
  rl.prompt();
});