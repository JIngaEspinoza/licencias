import { Body, Controller, Post, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK) // Aunque no devuelve contenido, 200 indica éxito en la solicitud
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    
    // Devolvemos un mensaje genérico de éxito, incluso si el email no existía, 
    // para evitar la enumeración de usuarios.
    return {
      message: 'Si el correo existe en nuestro sistema, se te enviará un enlace de restablecimiento de contraseña.',
    };
  }

}