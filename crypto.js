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
	const encrypted = crypto.publicEncrypt(
		{
			key: publicKeyPem,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		buffer
	);
	return encrypted.toString("base64");
}

/**
 * @param {string} encryptedMessage - Base64 encoded encrypted message
 * @returns {string} - Decrypted message
 */
export function decrypt(encryptedMessage) {
	const buffer = Buffer.from(encryptedMessage, "base64");
	const decrypted = crypto.privateDecrypt(
		{
			key: privateKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		buffer
	);
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