import { UserModel } from '../../../models/user.model';

export class UserResponseDto {
  id: string | number;
  username: string;
  email: string;
  password: string;
  accessToken: string;

  constructor({ id, username, email, password, accessToken }: UserModel) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.accessToken = accessToken;
  }
}
