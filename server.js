// server.js

import { NAME, PORT } from "./const.js";
import { servers } from "./mdns.js";
import { rl, pr } from "./inout.js";
import sendMsg from "./sendMsg.js";
import { getPublicKey, decrypt, getKeyFingerprint } from "./crypto.js";

import express, { json, urlencoded } from "express";

const app = express();
console.log("Hello", NAME);

const announcedServers = new Set();
const serverNames = new Map();
const serverPublicKeys = new Map();

function removeServer(server) {
	if (announcedServers.has(server)) {
		const name = serverNames.get(server) || server;
		pr(`${name} (${server})`, "left.");
		announcedServers.delete(server);
	}

	serverNames.delete(server);
	serverPublicKeys.delete(server);
	servers.delete(server);
}

app.use(json());
app.use(urlencoded({ extended: true }));

app.post("/", (req, res) => {
	const senderIP = req.ip.split(':').at(-1);
	const senderName = req.body.name;
	
	serverNames.set(senderIP, senderName);
	
	let message;
	try {
		message = decrypt(req.body.message);
	} catch (error) {
		pr(`Failed to decrypt message from ${senderName} (${senderIP})`);
		res.status(400).send("Decryption failed");
		return;
	}
	
	pr(`${senderName} (${senderIP}): ${message}`);
	res.status(200).send();
});

app.get("/ping", (req, res) => {
	res.status(200).json({ 
		name: NAME,
		publicKey: getPublicKey()
	});
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

					if (data.publicKey) {
						serverPublicKeys.set(server, data.publicKey);
					}
					
					if (data.name) {
						serverNames.set(server, data.name);
					}

					if (!announcedServers.has(server)) {
						const fingerprint = serverPublicKeys.has(server) 
							? getKeyFingerprint(serverPublicKeys.get(server))
							: "no-key";
						const name = data.name || server;
						pr(`${name} (${server}) joined. [${fingerprint}]`);
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
		for (const server of servers) {
			const publicKey = serverPublicKeys.get(server);
			if (!publicKey) {
				const name = serverNames.get(server) || server;
				pr(`No public key for ${name} (${server}), message not sent`);
				continue;
			}
			
			try {
				const response = await sendMsg(server, input, publicKey);
				if (!response.ok) {
					pr(`Failed to send to ${server}: HTTP ${response.status}`);
				}
			} catch (error) {
				pr(`Error sending to ${server}: ${error.message}`);
			}
		}
	}
	rl.prompt();
});