import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { PublicUser } from './user';

interface RequestHandlerParams {
  ReqParams: ParamsDictionary;
  ResBody: any;
  ReqBody: any;
  ReqQuery: ParsedQs;
}

export namespace Request {
  interface GetUser extends RequestHandlerParams {
    ReqParams: {};
    ResBody: PublicUser;
    ReqBody: {};
    ReqQuery: {};
  }

  interface PostAuth0 extends RequestHandlerParams {
    ReqParams: {};
    ResBody: {
      code: string;
    };
    ReqBody: {
      id: string;
    };
    ReqQuery: {};
  }

  interface PostAuth1 extends RequestHandlerParams {
    ReqParams: {};
    ResBody: {
      access_token: string;
    };
    ReqBody: {
      password: string;
    };
    ReqQuery: {};
  }
}
