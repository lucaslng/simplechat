// mdns.js

import { SERVICE_NAME } from "./const.js";
import getLocalIP from "./getip.js";
import { pr } from "./inout.js";

import mDNS from "multicast-dns";
import net from "net";

const mdns = mDNS({ loopback: false });

/** @type {Set<string>}} */
export const servers = new Set();

mdns.on("response", function (response) {
	response.answers
		.filter((answer) => answer.name === SERVICE_NAME && answer.type === "A")
		.forEach((answer) => {
		const ip = answer.data;
		if (net.isIPv4(ip) && ip !== getLocalIP()) {
			if (!servers.has(ip)) {
				pr("Found server:", ip);
				servers.add(ip);
			}
		}
	});
});

mdns.on("query", function (query) {
	if (query.questions.some((q) => q.name === SERVICE_NAME)) {
		mdns.respond([
			{
				name: SERVICE_NAME,
				type: "A",
				ttl: 300,
				data: getLocalIP(),
			},
		]);
	}
});


mdns.query({
	questions: [
		{
		name: SERVICE_NAME,
		type: "A",
		},
	],
});

setInterval(() => {
	mdns.query({
		questions: [
			{
				name: SERVICE_NAME,
				type: "A",
			},
		],
	});
}, 30000);
