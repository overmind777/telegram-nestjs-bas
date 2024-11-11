import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { DbModule } from './db/db.module';
import { AppUpdateV2 } from './app.updateV2';


@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      launchOptions: {
        webhook: { domain: process.env.DOMAIN, path: '/telegram/webhook' },
      },
    }),
    DbModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    // AppUpdate,
    AppUpdateV2],
})
export class AppModule { }
