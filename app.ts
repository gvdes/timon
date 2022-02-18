import dotenv from 'dotenv';
dotenv.config();

import Server from './models/server'

console.log("Starting server...");

const server = new Server();

server.run();