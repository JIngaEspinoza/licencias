import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Función auxiliar para convertir string a boolean de forma segura
const parseBoolean = (val: string | undefined): boolean => {
  if (val === undefined) return false;
  return val.toLowerCase() === 'true';
};

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => {
        const port = parseInt(configService.get<string>('MAIL_PORT') || '587', 10);
        const isSecure = parseBoolean(configService.get<string>('MAIL_SECURE'));
        const requireTls = parseBoolean(configService.get<string>('MAIL_REQUIRE_TLS'));

        const transportConfig = {
          host: configService.get<string>('MAIL_HOST'),
          port: port,
          secure: isSecure,
          auth: {
            user: configService.get<string>('MAIL_USER'), 
            pass: configService.get<string>('MAIL_PASS'), 
          },
          requireTLS: requireTls,
          timeout: 30000,
          family: 4
        };

        /*
        // LOG DE DIAGNÓSTICO
        console.log('--- Configuración SMTP Cargada ---');
        // LÍNEA AÑADIDA PARA VERIFICAR EL ENTORNO
        console.log('ENTORNO ACTUAL (NODE_ENV):', configService.get<string>('NODE_ENV')); 
        console.log('Host:', transportConfig.host);
        console.log('Port:', transportConfig.port);
        console.log('Secure (Implicit TLS/SSL):', transportConfig.secure);
        console.log('RequireTLS (STARTTLS):', transportConfig.requireTLS);
        console.log('User:', transportConfig.auth.user ? 'Cargado' : 'FALLO');
        console.log('----------------------------------');
        */
        return {
          transport: transportConfig,
          defaults: {
            from: configService.get<string>('MAIL_FROM'),
          },
          template: {
            dir: path.join(process.cwd(), 'dist', 'mail' ,'templates'), 
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
