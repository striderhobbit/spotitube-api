import { HttpStatusCode } from 'axios';
import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { authConfig } from '../auth.conf';
import { ControllerParams } from '../schema/controller';
import { PublicUser } from '../schema/user';

export namespace UserControllerParams {
  export interface Get extends ControllerParams {
    ReqParams: {};
    ResBody: PublicUser;
    ReqBody: {};
    ReqQuery: {};
  }
}

export interface UserController {
  get: RequestHandler<
    UserControllerParams.Get['ReqParams'],
    UserControllerParams.Get['ResBody'],
    UserControllerParams.Get['ReqBody'],
    UserControllerParams.Get['ReqQuery']
  >;
}

export const UserController: UserController = {
  get: (req, res) => {
    const access_token = req.headers['authorization']?.split(' ')[1];

    if (access_token == null) {
      res.sendStatus(HttpStatusCode.Unauthorized);
    } else {
      verify(access_token, authConfig.jwt.secret, (errors, payload: any) => {
        if (errors != null) {
          res.sendStatus(HttpStatusCode.Unauthorized);
        } else {
          res.send(payload.publicUser as PublicUser);
        }
      });
    }
  },
};
