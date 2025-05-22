import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/Login.dto';
import { RegisterDto } from './dto/Register.dto'; // Import RegisterDto
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} // Inject AuthService

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() loginDto: LoginDto) {
    // console.log('Controller received login data:', loginDto); // Keep for debugging if needed
    return this.authService.signIn(loginDto); // Call the new signIn method
  }

  @Post('signup') // New endpoint for registration
  @HttpCode(HttpStatus.CREATED) // Typically 201 for resource creation
  async signup(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
