import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'json-bigint-patch';

import './dotenv';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // const port = process.env.PORT ?? 3000;
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}/graphql`);
}
// process.exit(1);
bootstrap();
