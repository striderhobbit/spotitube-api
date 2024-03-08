import { configDotenv } from 'dotenv';

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
};
