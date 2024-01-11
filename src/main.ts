import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //swagger
  const config = new DocumentBuilder()
    .setTitle('Kidnest Server')
    .setDescription('Nestjs Server for kidnest')
    .setVersion('1.0')
    .addTag('server api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  //swagger

  await app.listen(process.env.SERVER_PORT || 3000);
}
bootstrap();
