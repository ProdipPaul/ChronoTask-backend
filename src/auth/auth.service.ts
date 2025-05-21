import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/Login.dto';
@Injectable()
export class AuthService {
  loginAttempt(loginDto: LoginDto): Promise<any> {
    console.log('Received login attempt:');
    console.log('Email:', loginDto.email);
    console.log('Password:', loginDto.password);
  }
}
