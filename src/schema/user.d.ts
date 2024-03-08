export interface PublicUser {
  id: string;
}

export interface User extends PublicUser {
  private: {
    password: string;
  };
}
