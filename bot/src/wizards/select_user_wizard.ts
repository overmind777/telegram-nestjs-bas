import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { AppService } from '../app.service';
import { Markup } from 'telegraf';
import { DeleteMessageAfter } from '../decorators/deleteMessageDecorator';
import * as levenshtein from 'fast-levenshtein';

@Wizard('SELECT_USER_WIZARD')
export class SelectUserWizard extends AppService {

  private streetList: string[] = [
    'Шевченка', 'Грушевського', 'Лесі Українки', 'Тараса Шевченка', 'Молодіжна', 'Центральна', 'Київська', 'Соборна', 'Залізнична'
    // додайте ваші вулиці
  ];

  // Функція для пошуку схожих вулиць за допомогою Левенштейна
  private getSimilarStreets(input: string): string[] {
    // Порівнюємо кожну вулицю з введеним текстом і фільтруємо на основі Левенштейна
    const threshold = 3; // Поріг схожості (менша відстань - більша схожість)
    return this.streetList.filter(street => {
      const distance = levenshtein.get(input.toLowerCase(), street.toLowerCase());
      return distance <= threshold; // Повертаємо вулиці, де відстань Левенштейна менше або рівна порогу
    });
  }

  @WizardStep(1)
  async onContact(@Ctx() ctx) {
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
    const idTelegram = ctx.update.message.from.id;
    const phone_number = ctx.update.message.contact.phone_number;
    const name = ctx.update.message.contact.first_name;
    ctx.wizard.state.idTelegram = idTelegram;
    ctx.wizard.state.phone = phone_number;
    ctx.wizard.state.name = name;
    await ctx.reply('Дякуємо! Тепер, будь ласка, вкажіть адресу доставки.');
    ctx.wizard.next();
  }

  @WizardStep(3)
  @DeleteMessageAfter()
  async onNotes(@Ctx() ctx) {
    const address = ctx.update.message.text;
    console.log(address)

    if (!address || ctx.wizard.state.waitingForAddress) {
      await ctx.reply('Вкажіть реальну адресу доставки (вулиця, номер будинку, місто):');
    } else {
      // Шукаємо схожі вулиці за допомогою Левенштейна
      const similarStreets = this.getSimilarStreets(address);

      if (similarStreets.length > 0) {
        // Створюємо інлайн-кнопки для вибору вулиці
        const buttons = similarStreets.map(street =>
            Markup.button.callback(street, `street_${street}`)
        );
        await ctx.reply(
            'Виберіть правильну вулицю з списку:',
            Markup.inlineKeyboard(buttons, { columns: 2 })
        );
      } else {
        await ctx.reply('Не знайдено схожих вулиць, будь ласка, введіть точну адресу.');
      }
    }
  }

  @WizardStep(4)
  @DeleteMessageAfter()
  async onFinish(@Ctx() ctx) {
    const notes = ctx.update.message.text;
    ctx.wizard.state.notes = notes;
    ctx.wizard.state.waitingForNotes = false;
    // console.log(ctx.wizard.state);
    await this.createNewUser(ctx.wizard.state);
    // ctx.scene.leave();
    ctx.scene.enter('SELECT_PRODUCTS_WIZARD');
  }
}
