import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { AppService } from '../app.service';
import { Markup } from 'telegraf';
import { DeleteMessageAfter } from '../decorators/deleteMessageDecorator';

@Wizard('SELECT_USER_WIZARD')
export class SelectUserWizard extends AppService {
  @WizardStep(1)
  // @DeleteMessageAfter()
  async onContact(@Ctx() ctx) {
    ctx.wizard.state = {
      phone: '',
      name: '',
      address: '',
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
    const phone_number = ctx.update.message.contact.phone_number;
    const name = ctx.update.message.contact.first_name;
    ctx.wizard.state.phone = phone_number;
    ctx.wizard.state.name = name;
    await ctx.reply('Дякуємо! Тепер, будь ласка, вкажіть адресу доставки.');
    ctx.wizard.next();
  }

  @WizardStep(3)
  @DeleteMessageAfter()
  async onNotes(@Ctx() ctx) {
    const address = ctx.update.message.text;
    ctx.wizard.state.address = address;
    await ctx.reply('Вкажіть додаткові примітки чи інструкції, якщо є.');
    console.log('46', ctx.wizard.state);
    ctx.wizard.next();
  }

  @WizardStep(4)
  @DeleteMessageAfter()
  async onFinish(@Ctx() ctx) {
    const notes = ctx.update.message.text;
    ctx.wizard.state.notes = notes;
    console.log(ctx.wizard.state);
    ctx.scene.leave();
  }
}
