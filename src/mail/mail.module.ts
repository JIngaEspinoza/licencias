import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import * as path from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      // ⚠️ Reemplaza con tus credenciales de envío (ej: Mailtrap, SendGrid, Gmail, etc.)
      transport: {
        host: 'smtp.ejemplo.com', // Servidor SMTP
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.MAIL_USER, // Variable de entorno para el usuario
          pass: process.env.MAIL_PASS, // Variable de entorno para la contraseña
        },
      },
      defaults: {
        from: '"No Reply" <noreply@tudominio.com>',
      },
      template: {
        dir: path.join(__dirname, 'templates'), // Carpeta donde irán tus plantillas .hbs
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
