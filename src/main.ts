import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: ['http://172.50.1.68:5173','http://localhost:5173'], // o ['*'] si quieres abrir a todo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // si luego usas cookies o auth con credenciales
  });

  await app.listen(3000); //process.env.PORT ?? 3000
}
bootstrap();
