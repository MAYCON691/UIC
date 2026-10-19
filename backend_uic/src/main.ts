import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

/** TRUST_PROXY: "1" (un proxy delante, ej. nginx), "true"/"false" o una lista de IPs. Vacío = sin proxy. */
function parseTrustProxy(value: string | undefined): boolean | number | string | undefined {
  if (!value) return undefined;
  if (value === 'true') return 1;
  if (value === 'false') return false;
  return Number.isInteger(Number(value)) ? Number(value) : value;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  // Detrás de nginx/Traefik hay que decirle a Express para que el límite de intentos use la IP real.
  const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
  if (trustProxy !== undefined) app.set('trust proxy', trustProxy);

  app.setGlobalPrefix('api');

  // Cabeceras de seguridad (nosniff, HSTS, sin X-Powered-By, etc.)
  app.use(
    helmet({
      // El frontend (otro origen) carga <img>, <video>, <audio> e <iframe> desde esta API.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // X-Frame-Options no permite indicar un origen: se reemplaza por frame-ancestors (abajo).
      frameguard: false,
      contentSecurityPolicy: false,
    }),
  );
  // Solo el frontend puede incrustar archivos de esta API (vista previa de PDF); nadie más.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${frontendUrl}`);
    next();
  });

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 4000);
  console.log(`API UIC lista en http://localhost:${process.env.PORT ?? 4000}/api`);
}
bootstrap();
