import 'express-session';

declare module 'express-session' {
  interface SessionData {
    redirect_uri: string;
    state: string;
  }
}
