import { configDotenv } from 'dotenv';
import { readFile } from 'fs/promises';

configDotenv();

export const authConfig = {
  jwt: {
    secret: process.env['JWT_SECRET']!,
  },
  spotify: {
    baseUri: process.env['SPOTIFY_BASE_URI'],
    clientId: process.env['SPOTIFY_CLIENT_ID'],
    clientSecret: process.env['SPOTIFY_CLIENT_SECRET'],
    redirectUri: process.env['SPOTIFY_REDIRECT_URI'],
  },
  ssl: {
    cert: readFile('server.crt', 'utf-8'),
    key: readFile('server.key', 'utf-8'),
  },
};
