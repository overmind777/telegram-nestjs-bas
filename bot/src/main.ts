import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log']
  });
  const bot = app.get(getBotToken());
  await app.use(bot.webhookCallback('/telegram/webhook'));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
