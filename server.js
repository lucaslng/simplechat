// server.js

import { NAME, PORT } from "./const.js";
import { servers } from "./mdns.js";
import { rl, pr } from "./inout.js";
import sendMsg from "./sendMsg.js";

import express, { json, urlencoded } from "express";

const app = express();
console.log("Hello", NAME);

const announcedServers = new Set();
const serverNames = new Map();

function removeServer(server, reason = "left") {
	if (announcedServers.has(server)) {
		const name = serverNames.get(server) || server;
		pr(`${name} (${server}) ${reason}`);
		announcedServers.delete(server);
	}
	serverNames.delete(server);
	servers.delete(server);
}

app.use(json());
app.use(urlencoded({ extended: true }));

app.post("/", (req, res) => {
	const senderIP = req.ip.split(':').at(-1);
	const senderName = req.body.name;

	serverNames.set(senderIP, senderName);
	
	pr(`${senderName} (${senderIP}): ${req.body.message}`);
	res.status(200).send();
});

app.get("/ping", (req, res) => {
	res.status(200).json({ name: NAME });
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
					removeServer(server);
				} else {
					const data = await response.json();
					if (data.name) {
						serverNames.set(server, data.name);
						
						if (!announcedServers.has(server)) {
							pr(`${data.name} (${server}) joined`);
						}
					}
					announcedServers.add(server);
				}
			} catch (error) {
				removeServer(server);
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
					removeServer(server, "is unreachable");
				}
			} catch (error) {
				removeServer(server, "is unreachable");
			}
		});
	}
	rl.prompt();
});