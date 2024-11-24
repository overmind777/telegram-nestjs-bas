import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { AppService } from '../app.service';
import { Markup } from 'telegraf';
import { DeleteMessageAfter } from '../decorators/deleteMessageDecorator';
import * as levenshtein from 'fast-levenshtein';

import { address } from '../helpers/test_street';

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

@Wizard('SELECT_USER_WIZARD')
export class SelectUserWizard extends AppService {
  private readonly logger = new Logger()
  private streetList: string[] = [];
  private address: string = '';

  // Функція для пошуку схожих вулиць за допомогою Левенштейна
  private getSimilarStreets(input: string): string[] {
    // Порівнюємо кожну вулицю з введеним текстом і фільтруємо на основі Левенштейна
    const threshold = 2; // Поріг схожості (менша відстань - більша схожість)
    return this.streetList.filter((street) => {
      const distance = levenshtein.get(
        input.toLowerCase(),
        street.toLowerCase(),
      );
      return distance <= threshold; // Повертаємо вулиці, де відстань Левенштейна менше або рівна порогу
    });
  }

  @WizardStep(1)
  async onContact(@Ctx() ctx) {
    // const jsonFilePath = path.resolve(__dirname, '..', 'helpers', 'test_street.ts');
    // this.streetList = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    this.streetList = address.flatMap((item) => [item['Назва']]);

    ctx.wizard.state = {
      idTelegram: null,
      phone: '',
      name: '',
      waitingForAddress: true,
      address: '',
      waitingForNotes: false,
      notes: '',
    };
    await ctx.reply(
      'Вітаємо в службі доставки ТМ "Вода Подільська".\nЗареєструйтесь, будь ласка.\nДля цього поділіться номером телефону',
      Markup.keyboard([
        Markup.button.contactRequest('Надіслати номер телефону'),
      ])
        .oneTime()
        .resize(),
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  @DeleteMessageAfter()
  async onAddress(@Ctx() ctx) {
    try{
      const idTelegram = ctx.update.message.from.id;
      const phone_number = ctx.update.message.contact.phone_number;
      const name = ctx.update.message.contact.first_name;
      ctx.wizard.state.idTelegram = idTelegram;
      ctx.wizard.state.phone = phone_number;
      ctx.wizard.state.name = name;
      await ctx.reply('Дякуємо! Тепер, будь ласка, вкажіть адресу доставки.');
      ctx.wizard.next();
    } catch (e){
      this.logger.warn(e)
    }
  }

  @WizardStep(3)
  @DeleteMessageAfter()
  async onNotes(@Ctx() ctx) {
    try{
      this.address = ctx.update?.message?.text;

    if (ctx.update?.callback_query?.data) {
      this.address = ctx.update?.callback_query?.data;
      ctx.wizard.state.waitingForAddress = false;
      ctx.wizard.state.waitingForNotes = true;
      ctx.wizard.state.address = this.address;
      ctx.wizard.next();
    }

    if (this.streetList.includes(this.address)) {
      ctx.wizard.state.waitingForAddress = false;
      ctx.wizard.state.waitingForNotes = true;
      ctx.wizard.state.address = this.address;
      await ctx.reply(
        'Додайте примітки: ',
        Markup.inlineKeyboard([
          Markup.button.callback('без приміток', 'not_notes'),
        ]),
      );
      ctx.wizard.next();
    } else {
      // Шукаємо схожі вулиці за допомогою Левенштейна
      const similarStreets = this.getSimilarStreets(this.address);

      if (similarStreets.length > 0) {
        // Створюємо інлайн-кнопки для вибору вулиці
        const buttons = similarStreets.map((street) =>
          Markup.button.callback(street, street),
        );
        await ctx.reply(
          'Виберіть правильну вулицю з списку:',
          Markup.inlineKeyboard(buttons, { columns: 2 }),
        );
      } else {
        await ctx.reply(
          'Не знайдено схожих вулиць, будь ласка, введіть точну адресу.',
        );
      }
    }
    } catch (e){
      this.logger.warn(e)
    }
  }

  @WizardStep(4)
  @DeleteMessageAfter()
  async onFinish(@Ctx() ctx) {
      try
    {
      const notes = ctx.update.message?.text;
      if (ctx.update?.callback_query?.data === 'not_notes') {
        ctx.wizard.state.notes = '';
      } else {
        ctx.wizard.state.notes = notes;
      }
      ctx.wizard.state.waitingForNotes = false;
      await this.createNewUser(ctx.wizard.state);
      ctx.scene.leave();
      ctx.scene.enter('SELECT_PRODUCTS_WIZARD');
    } catch (e){
        this.logger.warn(e)
      }
  }
}
