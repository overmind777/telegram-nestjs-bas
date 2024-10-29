import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import 'dotenv/config';
import { AppUpdate } from './app.update';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      launchOptions: {
        webhook: { domain: process.env.DOMAIN, path: '/telegram/webhook' },
      },
    }),
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
