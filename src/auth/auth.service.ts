import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

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
}