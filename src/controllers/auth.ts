import { HttpStatusCode } from 'axios';
import { compareSync } from 'bcrypt';
import { RequestHandler } from 'express';
import { readFile } from 'fs/promises';
import { sign, verify } from 'jsonwebtoken';
import { find, omit } from 'lodash';
import { authConfig } from '../auth.conf';
import { ControllerParams } from '../schema/controller';
import { PublicUser, User } from '../schema/user';

export namespace AuthControllerParams {
  export interface Lookup extends ControllerParams {
    ReqParams: {};
    ResBody: { code: string };
    ReqBody: { id: string };
    ReqQuery: {};
  }

  export interface Login extends ControllerParams {
    ReqParams: {};
    ResBody: { access_token: string };
    ReqBody: { password: string };
    ReqQuery: {};
  }
}

export interface AuthController {
  lookup: RequestHandler<
    AuthControllerParams.Lookup['ReqParams'],
    AuthControllerParams.Lookup['ResBody'],
    AuthControllerParams.Lookup['ReqBody'],
    AuthControllerParams.Lookup['ReqQuery']
  >;
  login: RequestHandler<
    AuthControllerParams.Login['ReqParams'],
    AuthControllerParams.Login['ResBody'],
    AuthControllerParams.Login['ReqBody'],
    AuthControllerParams.Login['ReqQuery']
  >;
}

export const AuthController: AuthController = {
  lookup: (req, res) =>
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
              authConfig.jwt.secret,
              { expiresIn: '1m' }
            ),
          });
        }
      }),
  login: (req, res) => {
    const code = req.headers['authorization']?.split(' ')[1];

    if (code == null) {
      res.sendStatus(HttpStatusCode.Unauthorized);
    } else {
      verify(code, authConfig.jwt.secret, (errors, payload: any) => {
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
                    authConfig.jwt.secret,
                    { expiresIn: '1h' }
                  ),
                });
              }
            });
        }
      });
    }
  },
};
