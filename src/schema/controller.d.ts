import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { PublicUser } from './user';

export interface ControllerParams {
  ReqParams: ParamsDictionary;
  ResBody: any;
  ReqBody: any;
  ReqQuery: ParsedQs;
}

export namespace Controller {
  interface GetUser extends ControllerParams {
    ReqParams: {};
    ResBody: PublicUser;
    ReqBody: {};
    ReqQuery: {};
  }

  interface AuthLookup extends ControllerParams {
    ReqParams: {};
    ResBody: { code: string };
    ReqBody: { id: string };
    ReqQuery: {};
  }

  interface AuthLogin extends ControllerParams {
    ReqParams: {};
    ResBody: { access_token: string };
    ReqBody: { password: string };
    ReqQuery: {};
  }
}
