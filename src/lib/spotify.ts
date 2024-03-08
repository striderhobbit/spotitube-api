import SpotifyWebApi from 'spotify-web-api-node';
import { authConfig } from '../auth.conf';

const spotify = new SpotifyWebApi({
  clientId: authConfig.spotify.clientId,
  clientSecret: authConfig.spotify.clientSecret,
  redirectUri: authConfig.spotify.redirectUri,
});

spotify.setAccessToken(
  'BQDkfguesl9sd3It6rERqf8Pb0ulceA4y5jgTfYt7kr7hPztKErjfwfQ7FdRUhKLmj3o_CB_hUeEj2nUpmleAQTF-XGxmvl9XNVsoOej7LxaQ_38XqOsTvuk2gNpFIDy9gVUNdFoY5kCT__63nJuYzOL7o3xCh267KgYbBzPZwsBPWHJCis51-qYiMuMoKAVwN1YrNM9XJfWOJwWvQj6terdUWOSxWSK'
);

console.log(spotify.getRefreshToken());

spotify.getMySavedTracks().then(console.log);
