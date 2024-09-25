import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserModel } from '../../models/user.model';
import { SignInUserData, UserCredentials } from './types';
import * as bcrypt from 'bcrypt';
import { PostgresService } from '../postgress/postgres.service';
@Injectable()
export class UsersService {
  constructor(private readonly postgresServise: PostgresService) {}

  private users: UserModel[] = [
    {
      id: 1,
      username: 'Andrei',
      email: 'andrei@gmail.com',
      password: '$2b$04$B7UAnFCcTcJbnBBangysTuiLK4/fZDm353dMvI7ftR0stBfInFy1O',
      refreshToken: '123',
    },
    {
      id: 2,
      username: 'Julia',
      email: 'julia@gmail.com',
      password: '$2b$04$B7UAnFCcTcJbnBBangysTuiLK4/fZDm353dMvI7ftR0stBfInFy1O',
      refreshToken: '123',
    },
  ];

  async findUserByEmail(email: string): Promise<UserModel | undefined> {
    const user = await this.postgresServise.findUserByEmail(email);

    return user;
  }

  async createUser({
    username,
    email,
    password,
  }: UserCredentials): Promise<UserDto> {
    const passwordHash = await bcrypt.hash(password, 3);

    const user = await this.postgresServise.createUser({
      username,
      email,
      password: passwordHash,
    });

    const userDto = this.getUserData(user);

    return userDto;
  }

  async signIn({ user, accessToken, refreshToken }: SignInUserData) {
    const isTokenExists = await this.postgresServise.findRefreshTokenByUserId(
      user.id,
    );

    if (!isTokenExists) {
      await this.postgresServise.saveUserRefreshToken({
        id: user.id,
        refreshToken,
      });
    } else {
      await this.postgresServise.updateUserRefreshToken({
        id: user.id,
        refreshToken,
      });
    }

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
    const data = this.postgresServise.removeRefreshToken(refreshToken);

    return data;
  }

  async findByRefreshToken(refreshToken: string) {
    const user =
      await this.postgresServise.findUserByRefreshToken(refreshToken);

    return user;
  }

  getUserData(user: UserModel) {
    const userDto = new UserDto(user);
    return { ...userDto };
  }

  getAllUsers() {
    return this.users;
  }
}
