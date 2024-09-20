import { UserModel } from '../../../models/user.model';

export class UserDto {
  id: string | number;
  username: string;
  email: string;

  constructor({ id, username, email }: UserModel) {
    this.id = id;
    this.email = email;
    this.username = username;
  }
}
