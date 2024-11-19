import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { AppService } from '../app.service';
import { Markup } from 'telegraf';
import { DeleteMessageAfter } from '../decorators/deleteMessageDecorator';

@Wizard('SELECT_USER_WIZARD')
export class SelectUserWizard extends AppService {
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
        .resize()
        .oneTime(),
    );
    console.log('25', ctx.wizard.state);
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
    if (!address || ctx.wizard.state.waitingForAddress) {
      await ctx.reply('Вкажіть реальну адресу: ');
    } else {
      ctx.wizard.state.address = address;
      ctx.wizard.state.waitingForAddress = false;
      ctx.wizard.state.waitingForNotes = true;
      await ctx.reply('Вкажіть додаткові примітки чи інструкції, якщо є.');
      console.log('54', ctx.wizard.state);
      ctx.wizard.next();
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
