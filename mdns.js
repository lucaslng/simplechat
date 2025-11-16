// mdns.js

import { SERVICE_NAME } from "./const.js";
import getLocalIP from "./getip.js";

import mDNS from "multicast-dns";

const mdns = mDNS();

mdns.on("response", function (response) {
  response.answers
    .filter((answer) => answer.name === SERVICE_NAME)
    .forEach((answer) =>
      console.log("Found server:", answer.data.toString())
    );
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
