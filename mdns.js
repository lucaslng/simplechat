// mdns.js

import { SERVICE_NAME } from "./const.js";
import getLocalIP from "./getip.js";
import { pr } from "./inout.js";

import mDNS from "multicast-dns";
import net from "net";

const mdns = mDNS();

export const servers = new Set();

mdns.on("response", function (response) {
  response.answers
    .filter((answer) => answer.name === SERVICE_NAME && net.isIPv4(answer.data.toString()) && answer.data.toString() !== getLocalIP())
    .forEach((answer) => {
      pr("Found server:", answer.data.toString());
      servers.add(answer.data.toString());
    });
});

mdns.on("query", function (query) {
  if (query.questions[0] && query.questions[0].name === SERVICE_NAME) {
    mdns.respond([
      {
        name: SERVICE_NAME,
        type: "TXT",
        data: getLocalIP(),
      },
    ]);
  }
});

mdns.query({
  questions: [
    {
      name: SERVICE_NAME,
      type: "TXT",
    },
  ],
});
