import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthLocalGuard } from './guards/auth-local.guard';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from '../notes/pipes/joi-validations-pipe';
import { signUpSchema } from './schemas/sign-up.schema';
import { UsersService } from '../users/users.service';
import { Response, Request } from 'express';
import { UserCredentials } from '../users/types';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authServise: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthLocalGuard)
  @Post('signin')
  async signIn(@Req() req, @Res() res: Response) {
    const user = await this.authServise.signIn(req.user);

    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.MODE === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 3600,
    });

    const userDto = new UserResponseDto(user);

    return res.status(200).json({ ...userDto });
  }

  @UsePipes(new JoiValidationPipe(signUpSchema))
  @Post('signup')
  async signUp(@Body() userData: UserCredentials, @Res() res: Response) {
    const user = await this.authServise.signUp(userData);

    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.MODE === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 3600,
    });

    const userDto = new UserResponseDto(user);

    return res.status(200).json({ ...userDto });
  }

  @Get('signout')
  async signOut(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('There is no token provides by cookie');
    }

    const user = await this.usersService.signOut(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.MODE === 'production',
      sameSite: 'none',
    });

    res.status(200).json(user);
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refreshToken'];

    const { accessToken, refreshToken } = await this.authServise.refresh(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.MODE === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 3600,
    });

    return res.status(401).json({ accessToken });
  }

  @Get('users')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
