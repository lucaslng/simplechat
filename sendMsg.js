// sendMsg.js

import { NAME, PORT } from "./const.js";

/** @param {string} server IP address */
export default async function sendMsg(server) {
  return await fetch(`http://${server}:${PORT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: NAME,
      message: input,
    }),
  });
}
