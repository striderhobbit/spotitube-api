import axios from 'axios';
import { randomBytes } from 'crypto';
import { RequestHandler } from 'express';
import { stringify } from 'qs';
import { authConfig } from '../auth.conf';
import { ControllerParams } from '../schema/controller';

export namespace SpotifyControllerParams {
  export interface Auth extends ControllerParams {
    ReqParams: {};
    ResBody: {};
    ReqBody: {};
    ReqQuery: {};
  }

  export interface AuthCallback extends ControllerParams {
    ReqParams: {};
    ResBody: {};
    ReqBody: {};
    ReqQuery: { code: string };
  }
}

export interface SpotifyController {
  auth: RequestHandler<
    SpotifyControllerParams.Auth['ReqParams'],
    SpotifyControllerParams.Auth['ResBody'],
    SpotifyControllerParams.Auth['ReqBody'],
    SpotifyControllerParams.Auth['ReqQuery']
  >;
  authCallback: RequestHandler<
    SpotifyControllerParams.AuthCallback['ReqParams'],
    SpotifyControllerParams.AuthCallback['ResBody'],
    SpotifyControllerParams.AuthCallback['ReqBody'],
    SpotifyControllerParams.AuthCallback['ReqQuery']
  >;
}

export const SpotifyController: SpotifyController = {
  auth: (req, res) =>
    res.redirect(
      `${authConfig.spotify.baseUri}/authorize?` +
        stringify({
          client_id: authConfig.spotify.clientId,
          redirect_uri: (req.session.redirect_uri =
            authConfig.spotify.redirectUri),
          response_type: 'code',
          scope: 'user-read-private user-read-email user-library-read',
          state: (req.session.state = randomBytes(16).toString('hex')),
        })
    ),
  authCallback: (req, res) =>
    axios
      .post(
        `${authConfig.spotify.baseUri}/api/token`,
        {
          code: req.query.code,
          grant_type: 'authorization_code',
          redirect_uri: req.session.redirect_uri,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${authConfig.spotify.clientId}:${authConfig.spotify.clientSecret}`
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
      ),
};
