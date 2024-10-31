import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import 'dotenv/config';
import { AppUpdate } from './app.update';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      launchOptions: {
        webhook: { domain: process.env.DOMAIN, path: '/telegram/webhook' },
      },
    }),
    DbModule,
    // BotModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
