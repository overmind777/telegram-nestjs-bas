import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as dotenv from 'dotenv';
import { DbModule } from './db/db.module';
import { session } from 'telegraf';
import { AppUpdate } from './app.update';
import { SelectUserWizard } from './wizards/select_user_wizard';
import { SelectProductsWizard } from './wizards/select_products_wizard';

dotenv.config({ path: '../.env' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      launchOptions: {
        webhook: { domain: process.env.DOMAIN, path: '/telegram/webhook' },
      },
      middlewares: [session()],
    }),
    DbModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SelectUserWizard,
    SelectProductsWizard,
    AppUpdate,
    // AppUpdateV2,
  ],
})
export class AppModule {}
