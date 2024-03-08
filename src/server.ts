import axios, { HttpStatusCode } from 'axios';
import { compareSync } from 'bcrypt';
import cors from 'cors';
import { randomBytes } from 'crypto';
import { configDotenv } from 'dotenv';
import express, { json } from 'express';
import session from 'express-session';
import { readFile } from 'fs/promises';
import { createServer } from 'https';
import { sign, verify } from 'jsonwebtoken';
import { clone, find, omit } from 'lodash';
import morgan from 'morgan';
import { stringify } from 'qs';
import { forkJoin, tap } from 'rxjs';
import { Request } from './schema/request';
import { PublicUser, User } from './schema/user';

configDotenv();

interface ServerConfig {
  onstart?: () => void;
  port: number;
}

export class Server {
  readonly #app = express();
  readonly #config: ServerConfig;

  constructor(config: ServerConfig) {
    const {
      JWT_SECRET,
      SPOTIFY_BASE_URI,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI,
    } = process.env;

    this.#config = clone(config);

    this.#app.use(json());
    this.#app.use(cors());
    this.#app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: 'Keep it secret, keep it safe!',
      })
    );
    this.#app.use(morgan('dev'));
    this.#app.use(
      express
        .Router()
        .get('/api/spotify/auth', (req, res) =>
          res.redirect(
            `${SPOTIFY_BASE_URI}/authorize?` +
              stringify({
                client_id: SPOTIFY_CLIENT_ID,
                redirect_uri: (req.session.redirect_uri = SPOTIFY_REDIRECT_URI),
                response_type: 'code',
                scope: 'user-read-private user-read-email user-library-read',
                state: (req.session.state = randomBytes(16).toString('hex')),
              })
          )
        )
        .get<any, any, any, any, { code: string }>(
          '/api/spotify/auth/callback',
          (req, res) =>
            axios
              .post(
                `${SPOTIFY_BASE_URI}/api/token`,
                {
                  code: req.query.code,
                  grant_type: 'authorization_code',
                  redirect_uri: req.session.redirect_uri,
                },
                {
                  headers: {
                    Authorization: `Basic ${Buffer.from(
                      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                    'content-type': 'application/x-www-form-urlencoded',
                  },
                }
              )
              .then(({ data }) =>
                res.send(
                  `<html><body><pre>${JSON.stringify(
                    {
                      access_token: data.access_token,
                      redirect_uri: req.session.redirect_uri,
                      refresh_token: data.refresh_token,
                      state: req.session.state,
                    },
                    null,
                    '\t'
                  )}</pre></body></html>`
                )
              )
        )
        .post<
          Request.PostAuth0['ReqParams'],
          Request.PostAuth0['ResBody'],
          Request.PostAuth0['ReqBody'],
          Request.PostAuth0['ReqQuery']
        >('/api/auth/0', (req, res) =>
          readFile('resource/users.json', 'utf-8')
            .then<User[]>(JSON.parse)
            .then((users) => {
              const user = find(users, { id: req.body.id });

              if (user == null) {
                res.sendStatus(HttpStatusCode.NotFound);
              } else {
                res.send({
                  code: sign(
                    { publicUser: omit(user, 'private') },
                    JWT_SECRET!,
                    { expiresIn: '1m' }
                  ),
                });
              }
            })
        )
        .post<
          Request.PostAuth1['ReqParams'],
          Request.PostAuth1['ResBody'],
          Request.PostAuth1['ReqBody'],
          Request.PostAuth1['ReqQuery']
        >('/api/auth/1', (req, res) => {
          const code = req.headers['authorization']?.split(' ')[1];

          if (code == null) {
            res.sendStatus(HttpStatusCode.Unauthorized);
          } else {
            verify(code, JWT_SECRET!, (errors, payload: any) => {
              if (errors != null) {
                res.sendStatus(HttpStatusCode.Unauthorized);
              } else {
                readFile('resource/users.json', 'utf-8')
                  .then<User[]>(JSON.parse)
                  .then((users) => {
                    const user = find(users, {
                      id: (payload.publicUser as PublicUser).id,
                    });

                    if (user == null) {
                      res.sendStatus(HttpStatusCode.NotFound);
                    } else if (
                      !compareSync(req.body.password, user.private.password)
                    ) {
                      res.sendStatus(HttpStatusCode.Forbidden);
                    } else {
                      res.send({
                        access_token: sign(
                          { publicUser: omit(user, 'private') },
                          JWT_SECRET!,
                          { expiresIn: '1h' }
                        ),
                      });
                    }
                  });
              }
            });
          }
        })
        .get<
          Request.GetUser['ReqParams'],
          Request.GetUser['ResBody'],
          Request.GetUser['ReqBody'],
          Request.GetUser['ReqQuery']
        >('/api/user', (req, res) => {
          const access_token = req.headers['authorization']?.split(' ')[1];

          if (access_token == null) {
            res.sendStatus(HttpStatusCode.Unauthorized);
          } else {
            verify(access_token, JWT_SECRET!, (errors, payload: any) => {
              if (errors != null) {
                res.sendStatus(HttpStatusCode.Unauthorized);
              } else {
                res.send(payload.publicUser as PublicUser);
              }
            });
          }
        })
    );

    console.clear();

    forkJoin({
      cert: readFile('server.crt', 'utf-8'),
      key: readFile('server.key', 'utf-8'),
    })
      .pipe(
        tap((options) =>
          createServer(options, this.#app).listen(this.#config.port, () => {
            console.info(`Server listening on port ${this.#config.port}.`);

            this.#config.onstart?.call(null);
          })
        )
      )
      .subscribe();
  }
}
