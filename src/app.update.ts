import { Update, Start, Ctx, Command, On, Help, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class AppUpdate {

    @Start()
    async start(@Ctx() ctx: Context) {
        console.log('Start')
        await ctx.reply('Вітаємо у нашому Telegram-боті!');
    }

    @Help()
    async help(@Ctx() ctx: Context) {
        console.log('Help')
        await ctx.reply('Вкажіть, будь ласка, кількість води та адресу доставки.');
        // Тут можеш додати логіку для збору даних
    }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        console.log('@OnText: ---', ctx.text)
        const message = ctx.message
        // Обробляй текст або відповідай відповідно до введеної інформації
        await ctx.reply(`Ви ввели: ${message}`);
    }

    @Hears('hi')
    async hears(@Ctx() ctx: Context) {
        await ctx.reply('Hey there');
    }
}
