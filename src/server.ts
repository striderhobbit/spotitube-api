import cors from 'cors';
import express, { json } from 'express';
import { createServer } from 'https';
import { clone } from 'lodash';
import morgan from 'morgan';
import { forkJoin, tap } from 'rxjs';
import { authConfig } from './auth.conf';
import { authRouter } from './routes/auth';
import { spotifyRouter } from './routes/spotify';
import { userRouter } from './routes/user';

interface ServerConfig {
  onstart?: () => void;
  port: number;
}

export class Server {
  app = express();
  config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = clone(config);

    this.app.use(json());
    this.app.use(cors());
    this.app.use(morgan('dev'));
    this.app.use(spotifyRouter);
    this.app.use(authRouter);
    this.app.use(userRouter);

    console.clear();

    forkJoin(authConfig.ssl)
      .pipe(
        tap((options) =>
          createServer(options, this.app).listen(this.config.port, () => {
            console.info(`Server listening on port ${this.config.port}.`);

            this.config.onstart?.call(null);
          })
        )
      )
      .subscribe();
  }
}
