import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from "telegraf";
import { MyContext } from "../types";
import 'dotenv/config'

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf<MyContext>

  constructor() {
    this.bot = new Telegraf<MyContext>( process.env.TOKEN )
  }

  async onModuleInit() {
    console.log( 'Bot started.....' )
  }

  async processUpdate( update: any ) {
    console.log( 'webhook--\n', update )

    await this.bot.handleUpdate( update )
  }
}