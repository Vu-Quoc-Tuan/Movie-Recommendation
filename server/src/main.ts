import { NestFactory } from '@nestjs/core';
import {AppModule} from "./app.module.js";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  });

  await app.listen(process.env.PORT || 8000);
}
bootstrap();