import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); //NestFactory.create(AppModule);

  // Habilitar los pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true
    }),
  );

  // prefijo global opcional
  app.setGlobalPrefix('api');

  // habilitar CORS para tu frontend (localhost:5173)
  app.enableCors({
    origin: '*', //['http://172.50.1.68:5173','http://localhost:5173'], // o ['*'] si quieres abrir a todo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // si luego usas cookies o auth con credenciales
  });

  const uploadDir = join(process.cwd(), 'uploads', 'expedientes');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Configuración robusta para desarrollo y producción
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/archivos-servidor/', // Los archivos se verán en http://localhost:3000/public/...
  });

  await app.listen(3000); //process.env.PORT ?? 3000
}
bootstrap();
