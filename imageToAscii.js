// imageToAscii.js

import fs from "fs";
import { createCanvas, loadImage } from "canvas";

const UPPER_HALF_BLOCK = '▀';

/**
 * @param {string} imagePath
 * @param {number} width
 * @param {boolean} useColor
 * @returns {Promise<string>}
 */
export async function imageToAscii(imagePath, width = 80, useColor = true) {
	try {
		const image = await loadImage(imagePath);
		
		const aspectRatio = image.height / image.width;
		const height = Math.floor(width * aspectRatio);

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(image, 0, 0, width, height);
		
		const imageData = ctx.getImageData(0, 0, width, height);
		const pixels = imageData.data;
		
		let ascii = "";
		
		// two rows at a time (top and bottom half of each character)
		for (let y = 0; y < height; y += 2) {
			for (let x = 0; x < width; x++) {
				// Top pixel (upper half of the block)
				const topOffset = (y * width + x) * 4;
				const topR = pixels[topOffset];
				const topG = pixels[topOffset + 1];
				const topB = pixels[topOffset + 2];
				
				// Bottom pixel (lower half of the block)
				let bottomR = 0, bottomG = 0, bottomB = 0;
				if (y + 1 < height) {
					const bottomOffset = ((y + 1) * width + x) * 4;
					bottomR = pixels[bottomOffset];
					bottomG = pixels[bottomOffset + 1];
					bottomB = pixels[bottomOffset + 2];
				}
				
				if (useColor) {
					// Use ANSI escape codes for 24-bit true color
					// Foreground (38;2;R;G;B) = top half color
					// Background (48;2;R;G;B) = bottom half color
					ascii += `\x1b[38;2;${topR};${topG};${topB}m\x1b[48;2;${bottomR};${bottomG};${bottomB}m${UPPER_HALF_BLOCK}\x1b[0m`;
				} else {
					// Fallback to grayscale using brightness
					const topBrightness = (topR + topG + topB) / 3;
					const bottomBrightness = (bottomR + bottomG + bottomB) / 3;
					
					// If top is brighter, use upper half block, otherwise use space or full block
					if (topBrightness > 200 && bottomBrightness > 200) {
						ascii += '█'; // Both bright
					} else if (topBrightness > 128 && bottomBrightness < 128) {
						ascii += '▀'; // Top bright, bottom dark
					} else if (topBrightness < 128 && bottomBrightness > 128) {
						ascii += '▄'; // Top dark, bottom bright
					} else if (topBrightness < 50 && bottomBrightness < 50) {
						ascii += ' '; // Both dark
					} else {
						ascii += '▓'; // Medium
					}
				}
			}
			ascii += "\n";
		}
		
		return ascii;
	} catch (error) {
		throw new Error(`Failed to convert image: ${error.message}`);
	}
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isImageFile(path) {
	const validExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
	const ext = path.toLowerCase().substring(path.lastIndexOf("."));
	
	try {
		return fs.existsSync(path) && validExtensions.includes(ext);
	} catch {
		return false;
	}
}