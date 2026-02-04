// sendMsg.js

import { NAME, PORT } from "./const.js";
import { encrypt } from "./crypto.js";

/** 
 * @param {string} server IP address
 * @param {string} input message string
 * @param {string} publicKey recipient's public key
 *  @param {boolean} isImage
*/
export default async function sendMsg(server, input, publicKey, isImage = false) {
	const encryptedMessage = encrypt(input, publicKey);

	return await fetch(`http://${server}:${PORT}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},

		body: JSON.stringify({
			name: NAME,
			message: encryptedMessage,
			isImage: isImage,
		}),
	});
}
