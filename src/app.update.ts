import { Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

const waterChoices: string[] = ['18.9 l', '6 l', '1.5 l', '0.5 l'];
const juiceChoices: string[] = ['10 l', '5 l', '3 l', '1 l'];
const coffeeChoices: string[] = ['1 kg', '0.250 kg'];
let choice: string[];

@Update()
export class AppUpdate {
  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.replyWithMarkdownV2('Welcome to my bot', {
      reply_markup: {
        keyboard: [['Water', 'Juice', 'Coffee'], ['<- Back']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    console.log('Help');
    await ctx.reply('Help with commands');
    // Тут можеш додати логіку для збору даних
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    // console.log('@OnText: ---', ctx.text);
    const message: string = ctx.text;
    const goods: string[] = ['water', 'juice', 'coffee', '<- back'];
    if (!goods.includes(message.toLowerCase())) {
      await ctx.reply('You can buy only Water, Juice or Coffee');
      return false;
    }
    switch (message.toLowerCase()) {
      case 'water':
        choice = waterChoices;
        break;
      case 'juice':
        choice = juiceChoices;
        break;
      case 'coffee':
        choice = coffeeChoices;
        break;
      case '<- back':
        choice = ['water', 'juice', 'coffee', '<- back'];
    }
    await ctx.reply(`Your choice: ${message}`, {
      reply_markup: {
        keyboard: [choice, ['<- Back']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
}
