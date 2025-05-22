// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service'; // Path to your UsersService
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Validates username/password. Used by LocalStrategy.
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; // Destructure to exclude password
      return result; // Return user object (without password)
    }
    return null;
  }

  // Generates the JWT upon successful login or registration.
  async login(user: User): Promise<{ accessToken: string }> {
    // Payload for the JWT: typically user ID and username.
    // Ensure 'user.id' exists and is unique for the 'sub' claim.
    const payload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload), // Signs the token with your secret
    };
  }

  // Handles new user registration.
  async register(createUserDto: any): Promise<{ accessToken: string }> {
    // Check if user already exists
    const existingUser = await this.usersService.findOne(
      createUserDto.username,
    );
    if (existingUser) {
      throw new UnauthorizedException('Username already taken.'); // Or BadRequestException
    }
    const newUser = await this.usersService.create(createUserDto);
    return this.login(newUser); // Log in the newly created user immediately
  }
}
