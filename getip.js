// getip.js

import os from "os";

export default function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
	throw new Error("No ip found");
}