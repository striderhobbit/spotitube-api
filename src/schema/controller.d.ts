import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface ControllerParams {
  ReqParams: ParamsDictionary;
  ResBody: any;
  ReqBody: any;
  ReqQuery: ParsedQs;
}
