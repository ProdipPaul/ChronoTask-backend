import { Controller, Get, Body } from '@nestjs/common';
import { LoginDto } from './dto/Login.dto';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  @Get('signin')
  signin(@Body() loginDto: LoginDto) {
    console.log('Controller received login data:', loginDto);

    // Call the service to process the data (which will just console.log it for now)
    const result = AuthService.loginAttempt(loginDto);
    // Return the result from the service.
    // This will be sent back as the JSON response to the client.
  }
}
