// const.js

import dotenv from 'dotenv';
dotenv.config({quiet: true});

const NAME = process.env.NAME;

const SERVICE_NAME = "_76fe73552fcf";
const PORT = "55567";

export { NAME, SERVICE_NAME, PORT };