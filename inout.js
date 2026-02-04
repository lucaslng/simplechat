// inout.js

import { createInterface, clearLine, cursorTo } from "readline";
import { NAME } from "./const.js";

export const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: `${NAME}: `,
});

// Function to safely print messages without disrupting the prompt
export function pr(message, ...optionalParams) {
	clearLine(process.stdout, 0);
	cursorTo(process.stdout, 0);
	console.log(message, ...optionalParams);
	rl.prompt(true);
}