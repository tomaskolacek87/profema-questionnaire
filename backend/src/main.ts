import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:5002');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra fields in nested objects
    }),
  );

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.get('PORT', 7301);
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥  PROFEMA QUESTIONNAIRE BACKEND                       ║
║                                                           ║
║   Server:     http://localhost:${port}                      ║
║   API Docs:   http://localhost:${port}/api                  ║
║                                                           ║
║   ✅ Profema DB:  TimescaleDB @ port 5433                 ║
║   ✅ Astraia DB:  TimescaleDB @ port 5433                 ║
║   ✅ Dual Write:  ENABLED                                 ║
║                                                           ║
║   Environment: ${configService.get('NODE_ENV')}                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
