import { configDotenv } from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';

configDotenv();

const spotify = new SpotifyWebApi({
  clientId: process.env['SPOTIFY_CLIENT_ID'],
  clientSecret: process.env['SPOTIFY_CLIENT_SECRET'],
  redirectUri: process.env['SPOTIFY_REDIRECT_URI'],
});

spotify.setAccessToken(
  'BQDkfguesl9sd3It6rERqf8Pb0ulceA4y5jgTfYt7kr7hPztKErjfwfQ7FdRUhKLmj3o_CB_hUeEj2nUpmleAQTF-XGxmvl9XNVsoOej7LxaQ_38XqOsTvuk2gNpFIDy9gVUNdFoY5kCT__63nJuYzOL7o3xCh267KgYbBzPZwsBPWHJCis51-qYiMuMoKAVwN1YrNM9XJfWOJwWvQj6terdUWOSxWSK'
);

console.log(spotify.getRefreshToken());

spotify.getMySavedTracks().then(console.log);
