import { Router } from 'express';
import { SpotifyController } from '../controllers/spotify';

const spotifyRouter = Router();

spotifyRouter.get('/api/spotify/auth', SpotifyController.auth);
spotifyRouter.get<any, any, any, any, { code: string }>(
  '/api/spotify/auth/callback',
  SpotifyController.authCallback
);

export { spotifyRouter };
