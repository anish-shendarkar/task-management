import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { use } from 'passport';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);

    if (user) {
      console.log('authservice validate user', user);
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        console.log('authservice password match', passwordMatch);
        return user;
      }
    }
    return null;
  }

  generateToken(user) {
    console.log('authservice generate token', user);
    const payload = { id: user._id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { token, role: user.role };
  }
}
