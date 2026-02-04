// crypto.js

import crypto from "crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
	modulusLength: 2048,
	publicKeyEncoding: {
		type: "spki",
		format: "pem",
	},
	privateKeyEncoding: {
		type: "pkcs8",
		format: "pem",
	},
});

/**
 * @param {string} message
 * @param {string} publicKeyPem - recipient's public key in PEM format
 * @returns {string} - Base64 encoded encrypted message
 */
export function encrypt(message, publicKeyPem) {
	const buffer = Buffer.from(message, "utf8");

	const aesKey = crypto.randomBytes(32); // 256-bit key
	const iv = crypto.randomBytes(16); // 128-bit IV
	
	// encrypt with AES first
	const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
	let encryptedMessage = cipher.update(buffer);
	encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
	
	// AES key encrypted with RSA
	const encryptedKey = crypto.publicEncrypt(
		{
			key: publicKeyPem,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		aesKey
	);
	
	const result = Buffer.concat([
		Buffer.from([encryptedKey.length >> 8, encryptedKey.length & 0xff]),
		encryptedKey,
		iv,
		encryptedMessage
	]);

	return result.toString("base64");
}

/**
 * @param {string} encryptedMessage - Base64 encoded encrypted message with prefix
 * @returns {string} - Decrypted message
 */
export function decrypt(encryptedMessage) {
	const buffer = Buffer.from(encryptedMessage, "base64");
	const keyLength = (buffer[0] << 8) | buffer[1];
	

	const encryptedKey = buffer.slice(2, 2 + keyLength);
	const iv = buffer.slice(2 + keyLength, 2 + keyLength + 16);
	const encryptedData = buffer.slice(2 + keyLength + 16);
	
	const aesKey = crypto.privateDecrypt(
		{
			key: privateKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		encryptedKey
	);
	
	const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
	let decrypted = decipher.update(encryptedData);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	
	return decrypted.toString("utf8");
}

export function getPublicKey() {
	return publicKey;	// in PEM format
}

/**
 * Get a fingerprint of a public key for verification
 * @param {string} publicKeyPem - public key in PEM format
 * @returns {string} - SHA256 hash of the public key (first 16 chars)
 */
export function getKeyFingerprint(publicKeyPem) {
	const hash = crypto.createHash("sha256").update(publicKeyPem).digest("hex");
	return hash.substring(0, 16);
}