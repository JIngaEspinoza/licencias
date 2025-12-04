import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envía un correo electrónico con el enlace de restablecimiento de contraseña.
   * @param email Correo del destinatario.
   * @param userId ID del usuario (usado aquí como 'name' de forma simple).
   * @param url El enlace completo de restablecimiento (ej: http://frontend/reset?token=XXX).
   */
  async sendPasswordReset(email: string, userId: number, url: string): Promise<void> {
    
    // Aquí podrías buscar el nombre del usuario si solo pasaste el ID
    const userName = `Usuario ${userId}`; 
    const currentYear = new Date().getFullYear();

    await this.mailerService.sendMail({
      to: email,
      subject: 'Restablecimiento de Contraseña',
      template: 'password-reset', // Nombre del archivo .hbs de la plantilla
      context: {
        // Variables que pasarán a la plantilla
        name: userName,
        resetLink: url,
        year: currentYear,
      },
    });
  }
}
