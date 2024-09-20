import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserModel } from '../../models/user.model';
import { SignInUserData, UserCredentials } from './types';
@Injectable()
export class UsersService {
  private users: UserModel[] = [
    {
      id: 1,
      username: 'Andrei',
      email: 'andrei@gmail.com',
      password: 'root',
      refreshToken: '123',
    },
    {
      id: 2,
      username: 'Julia',
      email: 'julia@gmail.com',
      password: 'root',
      refreshToken: '123',
    },
  ];

  async findOne(email: string): Promise<UserModel | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async createUser({
    username,
    email,
    password,
  }: UserCredentials): Promise<UserDto> {
    const id = Date.now();

    // TODO: bcrypt
    const user: UserModel = {
      id,
      username,
      email,
      password,
    };

    this.users.push(user);
    const userDto = this.getUserData(user);

    return userDto;
  }

  async signIn({ user, accessToken, refreshToken }: SignInUserData) {
    user.refreshToken = refreshToken;

    const userData = this.getUserData({
      ...user,
    });

    return Promise.resolve({
      ...userData,
      accessToken,
      refreshToken,
    });
  }

  async signOut(refreshToken: string) {
    const user = this.users.find((user) => user.refreshToken === refreshToken);

    delete user.refreshToken;

    const userDto = this.getUserData(user);

    return Promise.resolve({ ...userDto });
  }

  getUserData(user: UserModel) {
    const userDto = new UserDto(user);
    return { ...userDto };
  }

  getAllUsers() {
    return this.users;
  }
}
