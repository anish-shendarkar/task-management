import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('signup')
  async signUp(@Request() req) {
    console.log('appcontroller signup', req.body);
    const user = await this.userService.signUp(
      req.body.name,
      req.body.email,
      req.body.password,
    );
    return user;
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req) {
    console.log('appcontroller login', req.user);
    const user = req.user;
    
    delete user.password; // Remove password before returning user data
    
    return await this.authService.generateToken(user);
  }
}
