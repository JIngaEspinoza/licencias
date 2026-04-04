import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/users/dto/user-dto';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService
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
      return; 
    }

    // 2. GENERAR TOKEN DE RESTABLECIMIENTO
    // Utilizamos el JwtService (el mismo que usas para el login)
    // pero con un payload específico y un tiempo de expiración corto (ej. 15 minutos).
    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user.id, purpose: 'password_reset' },
      { expiresIn: '2m' } 
    );

    // 3. GUARDAR TOKEN EN LA BDD
    // El UserService debe tener el método para persistir este token en el modelo del usuario.
    try {
      await this.userService.updatePasswordResetToken(user.id, resetToken);
    } catch (error) {
      console.error('Error al guardar el token:', error);
      throw new InternalServerErrorException('Error interno al procesar la solicitud.');
    }

    // 4. ENVIAR CORREO ELECTRÓNICO
    try {
      // Construye el enlace que el frontend utilizará (ej. /reset-password?token=...)
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Asume que tu mailService tiene un método para enviar el correo
      await this.mailService.sendPasswordReset(
        user.email, 
        user.id, // Podrías pasar el ID o el nombre para personalizar el correo
        resetLink
      );
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
      throw new InternalServerErrorException('Se generó el token, pero falló el envío del correo.');
    }
  }

  /**
   * Restablece la contraseña del usuario.
   * @param token El token JWT de restablecimiento de contraseña.
   * @param newPassword La nueva contraseña para el usuario.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: any;

    // 1. VERIFICAR LA VALIDEZ Y EXPIRACIÓN DEL TOKEN (JWT)
    try {
      // Verifica firma y obtiene el payload. Esto fallará si el JWT expiró (a nivel de firma).
      payload = this.jwtService.verify(token);
    } catch (e) {
      // JwtService lanza un error si el token es inválido o expiró
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.');
      }
      throw new BadRequestException('Token de restablecimiento inválido o malformado.');
    }

    // 2. VALIDAR EL PROPÓSITO DEL TOKEN
    const userId = payload.sub;
    if (payload.purpose !== 'password_reset' || isNaN(userId)) {
      throw new BadRequestException('El token no es válido para restablecer la contraseña.');
    }

    // CORRECCIÓN CLAVE: Hashear el token recibido para compararlo con el hash de la base de datos
    const tokenHashToSearch = this.userService.hashPassword(token);

    // 3. BUSCAR REGISTRO DE TOKEN EN LA TABLA PasswordResetToken
    // Ahora, compara HASH con HASH
    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: userId,
        tokenHash: tokenHashToSearch, // Se usa el hash del token recibido
        usedAt: null, // Debe ser un token que no se haya usado
        expiresAt: { gt: new Date() }, // Debe ser un token no expirado (doble chequeo con el JWT verify)
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('El token es inválido, ha expirado o ya fue utilizado.');
    }

    // 4. HASHEAR LA NUEVA CONTRASEÑA
    // Se mantiene la llamada a UserService si maneja el hashing (ej: con bcrypt)
    const hashedPassword = await this.userService.hashPassword(newPassword);

    // 5. ACTUALIZAR LA CONTRASEÑA Y LIMPIAR EL TOKEN DE LA BDD
    try {
      // Usamos una transacción para asegurar que ambos pasos se completen o fallen juntos
      await this.prisma.$transaction([
        // A. Actualizar la contraseña del usuario en la tabla 'User'
        this.prisma.user.update({
          where: { id: userId },
          data: {
            passwordHash: hashedPassword, // Asume que el campo de la contraseña es 'password'
          },
        }),
        
        // B. Marcar el token como usado en la tabla 'PasswordResetToken'
        this.prisma.passwordResetToken.update({
          where: { id: tokenRecord.id },
          data: { usedAt: new Date() }, // Establecer la fecha de uso
        }),
      ]);

    } catch (error) {
      console.error('Error al actualizar la contraseña o limpiar el token:', error);
      throw new InternalServerErrorException('Error interno al completar el cambio de contraseña.');
    }
  } 
  
  async findAllWithoutPagination(){
    return this.prisma.passwordResetToken.findMany({ orderBy: { id: 'asc' } });
  }

  async remove(id: number) {
    return await this.prisma.passwordResetToken.delete({ where: { id } });
  }

}