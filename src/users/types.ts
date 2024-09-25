import { UserModel } from '../../models/user.model';

export interface TokensData {
  accessToken: string;
  refreshToken: string;
}

export interface SignInUserData extends TokensData {
  user: UserModel;
}

export type UserCredentials = Pick<
  UserModel,
  'username' | 'email' | 'password'
>;
