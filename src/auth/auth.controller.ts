import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'; // Use Post for signin
import { LoginDto } from './dto/Login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} // Inject AuthService

  @Post('signin') // Use @Post for signin as it typically sends sensitive data
  @HttpCode(HttpStatus.OK) // Set the response status to 200 OK on success
  async signin(@Body() loginDto: LoginDto) {
    // Mark as async because authService.signin is async
    console.log('Controller received login data:', loginDto);

    // Call the service to process the data
    const result = await this.authService.signin(
      // Correctly call the instance method with await
      loginDto.email,
      loginDto.password,
    );

    // Return the result from the service.
    // This will be sent back as the JSON response to the client.
    return result;
  }
}
