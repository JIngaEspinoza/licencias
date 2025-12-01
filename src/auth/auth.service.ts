import { ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/users/dto/user-dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (!user.activo) throw new ForbiddenException('Usuario inactivo');

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const isValid = user.passwordHash === hash;

    if (!isValid) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.nombre),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: payload.roles,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      delete payload.iat;
      delete payload.exp;
      return {
        accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Genera un token de restablecimiento y envía el correo al usuario.
   * @param email El correo electrónico del usuario que solicita el restablecimiento.
   */
  async forgotPassword(email: string): Promise<void> {
    // 1. BUSCAR AL USUARIO
    // Usamos el servicio de usuario para encontrar el modelo por email.
    // Usamos UserModel | null como tipo de retorno.
    const user: UserDto | null = await this.userService.findOneByEmail(email);

    if (!user) {
      // Por seguridad, si el usuario no existe, terminamos silenciosamente 
      // para evitar la enumeración de usuarios. El Controller ya se encarga 
      // de devolver el mensaje genérico de éxito.
      return; 
    }

    // 2. GENERAR TOKEN DE RESTABLECIMIENTO
    // Utilizamos el JwtService (el mismo que usas para el login)
    // pero con un payload específico y un tiempo de expiración corto (ej. 15 minutos).
    const resetToken = this.jwtService.sign(
        { email: user.email, sub: user.id, purpose: 'password_reset' },
        { expiresIn: '15m' } 
    );

    // 3. GUARDAR TOKEN EN LA BDD
    // El UserService debe tener el método para persistir este token en el modelo del usuario.
    try {
        await this.userService.updatePasswordResetToken(user.id, resetToken);
    } catch (error) {
        // Manejo de errores de la base de datos
        console.error('Error al guardar el token:', error);
        throw new InternalServerErrorException('Error interno al procesar la solicitud.');
    }

    // 4. ENVIAR CORREO ELECTRÓNICO
    try {
        // Construye el enlace que el frontend utilizará (ej. /reset-password?token=...)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Asume que tu mailService tiene un método para enviar el correo
        await this.mailService.sendPasswordReset(
          user.email, 
          user.id, // Podrías pasar el ID o el nombre para personalizar el correo
          resetLink
        );
    } catch (error) {
        // Es importante registrar si el correo falló
        console.error('Error al enviar el correo de restablecimiento:', error);
        // Lanzar una excepción o manejar según la política de tu app
        throw new InternalServerErrorException('Se generó el token, pero falló el envío del correo.');
    }
  }

  
}