// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../user/user.service'; // Corrected path
import { User } from '../../db/core/schema'; // Standardized User type from Drizzle schema
import { LoginDto } from './dto/Login.dto';
import { RegisterDto } from './dto/Register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials. Please check your email and password.',
      );
    }
    // The 'user' from validateUser is Omit<User, 'password'>.
    // It should have 'id' and 'email' for the JWT payload.
    return this.generateAccessToken(
      user as Pick<User, 'id' | 'email' | 'name'>,
    ); // Cast to ensure properties for payload
  }

  // Renamed 'login' to 'generateAccessToken' for clarity, as it's about token generation.
  async generateAccessToken(
    userPayload: Pick<User, 'id' | 'email' | 'name'>,
  ): Promise<{ accessToken: string }> {
    const payload = {
      email: userPayload.email,
      sub: userPayload.id,
      name: userPayload.name,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const existingUser = await this.usersService.findOne(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }
    const newUser = await this.usersService.create(registerDto);
    // newUser from usersService.create is the full User entity.
    // We need to pass the correct payload structure to generateAccessToken.
    const { password, ...userPayload } = newUser; // Exclude password for payload generation
    return this.generateAccessToken(userPayload);
  }
}
