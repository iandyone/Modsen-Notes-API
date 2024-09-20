import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../../models/user.model';
import { UserCredentials } from '../users/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServise: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(userData: UserModel) {
    // Корректность пользовательских данных была проверена AuthLocalGuard (passport-local)
    const user = await this.usersServise.findOne(userData.email);
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
    const user = await this.usersServise.findOne(email);

    if (!user) {
      throw new UnauthorizedException(`There is no user with email ${email}`);
    }

    // TODO: bcrypt
    if (user && user.password === password) {
      return user;
    }

    return null;
  }

  async signUp(credentials: UserCredentials) {
    const { email } = credentials;
    const isUserAlreadyExists = await this.usersServise.findOne(email);

    if (isUserAlreadyExists) {
      throw new ConflictException(`User with email ${email} is already exists`);
    }

    const user = await this.usersServise.createUser(credentials);

    const tokens = await this.signIn(user);

    return {
      ...user,
      ...tokens,
    };
  }

  generateTokens(user: UserModel) {
    return {
      accessToken: this.jwtService.sign(user, { expiresIn: '1d' }),
      refreshToken: this.jwtService.sign(user, { expiresIn: '14d' }),
    };
  }
}
