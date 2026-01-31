// server.js

import { NAME, PORT } from "./const.js";
import { servers } from "./mdns.js";
import { rl, pr } from "./inout.js";
import sendMsg from "./sendMsg.js";

import express, { json, urlencoded } from "express";

const app = express();
console.log("Hello", NAME);

const announcedServers = new Set();

app.use(json());
app.use(urlencoded({ extended: true }));

app.post("/", (req, res) => {
	pr(`${req.body.name} (${req.ip.split(':').at(-1)}): ${req.body.message}`);
	res.status(200).send();
});

app.listen(PORT, () => {
	console.log("Server running on port", PORT);
	rl.prompt();
});

setTimeout(() => {
	setInterval(async () => {
		for (const server of servers) {
			try {
				const response = await fetch(`http://${server}:${PORT}/ping`, {
					method: "GET",
					signal: AbortSignal.timeout(3000)
				});
				if (!response.ok) {
					if (announcedServers.has(server)) {
						pr(`Server ${server} left`);
						announcedServers.delete(server);
					}
					servers.delete(server);
				} else {
					announcedServers.add(server);
				}
			} catch (error) {
				if (announcedServers.has(server)) {
					pr(`Server ${server} left`);
					announcedServers.delete(server);
				}
				servers.delete(server);
			}
		}
	}, 10000);
}, 15000);

rl.on("line", async (line) => {
	const input = line.trim();

	if (input === "!!exit") {
		process.exit(0);
	}
	
	if (input) {
		servers.forEach(async (server) => {
			try {
				const response = await sendMsg(server, input);
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
