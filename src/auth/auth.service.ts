import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../../models/user.model';
import { UserCredentials } from '../users/types';
import { UserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { PostgresService } from '../postgress/postgres.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServise: UsersService,
    private readonly postgresService: PostgresService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(userData: UserModel) {
    // Корректность пользовательских данных была проверена AuthLocalGuard (passport-local)
    const user = await this.usersServise.findUserByEmail(userData.email);

    const tokens = this.generateTokens(userData);

    return await this.usersServise.signIn({
      user,
      ...tokens,
    });
  }

  async validateUser({
    email,
    password,
  }: UserModel): Promise<UserModel | null> {
    const user = await this.usersServise.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException(`There is no user with email ${email}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (user && isPasswordValid) {
      return user;
    }

    return null;
  }

  async signUp(credentials: UserCredentials) {
    const { email } = credentials;
    const isUserAlreadyExists = await this.usersServise.findUserByEmail(email);

    if (isUserAlreadyExists) {
      throw new ConflictException(`User with email ${email} is already exists`);
    }

    const user = await this.usersServise.createUser(credentials);

    const userData = await this.signIn(user);

    await this.postgresService.saveUserRefreshToken({
      id: userData.id,
      refreshToken: userData.refreshToken,
    });

    return userData;
  }

  async refresh(refreshToken: string) {
    const user = await this.usersServise.findByRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException();
    }

    const userData = new UserDto(user);

    const tokens = this.generateTokens({
      ...userData,
    });

    const { refreshToken: updatedRefreshToken } =
      await this.postgresService.updateUserRefreshToken({
        id: user.id,
        refreshToken,
      });

    return { ...tokens, refreshToken: updatedRefreshToken };
  }

  generateTokens(user: UserModel) {
    return {
      accessToken: this.jwtService.sign(user, { expiresIn: '1d' }),
      refreshToken: this.jwtService.sign(user, { expiresIn: '10d' }),
    };
  }
}
