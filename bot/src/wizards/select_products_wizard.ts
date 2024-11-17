import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import {
  downKeyboard,
  goods,
  goodsKeyboard,
  juiceKeyboard,
  juiceType,
  translationMap,
} from '../helpers/goods';
import { DeleteMessageAfter } from '../decorators/deleteMessageDecorator';

@Wizard('SELECT_PRODUCTS_WIZARD')
export class SelectProductsWizard {
  @WizardStep(1)
  async onStep1(@Ctx() ctx) {
    await ctx.reply(
      `Вітаємо в службі доставки ТМ "Вода Подільська".\nОберіть товар`,
      Markup.inlineKeyboard([
        [
          ...goodsKeyboard.map((item) => {
            return Markup.button.callback(translationMap[item], item);
          }),
        ],
        [Markup.button.callback('Відміна', 'cancel')],
      ]),
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  @DeleteMessageAfter()
  async onStep2(@Ctx() ctx) {
    const action = ctx.update?.callback_query?.data;
    const choice = goods[action];

    if (action === 'back') {
      ctx.wizard.selectStep(0);
      ctx.wizard.step(ctx);
    }

    if (action === 'cancel') {
      return ctx.scene.leave();
    }

    if (action !== 'juice') {
      await ctx.reply(
        'Type: ',
        Markup.inlineKeyboard([
          [
            ...choice.map((item) => {
              return Markup.button.callback(translationMap[item], item);
            }),
          ],
          [
            ...downKeyboard.map((item) => {
              return Markup.button.callback(translationMap[item], item);
            }),
          ],
        ]),
      );
    } else if (action === 'juice') {
      await ctx.reply(
        'Type',
        Markup.inlineKeyboard([
          ...choice
            .map((item) => Markup.button.callback(translationMap[item], item))
            .reduce((rows, button, index) => {
              const chunkSize = 3; // Кількість кнопок у рядку
              if (index % chunkSize === 0) {
                rows.push([]); // Створюємо новий рядок
              }
              rows[rows.length - 1].push(button); // Додаємо кнопку до останнього рядка
              return rows;
            }, []), // Початкове значення — порожній масив рядків
          downKeyboard.map((item) => {
            return Markup.button.callback(translationMap[item], item);
          }),
        ]),
      );
    }
    ctx.wizard.next();
  }

  @WizardStep(3)
  @DeleteMessageAfter()
  async onStep3(@Ctx() ctx) {
    console.log('step 3');
    const action = ctx.update?.callback_query?.data;
    console.log(action);
    if (action === 'back') {
      ctx.wizard.selectStep(0);
      ctx.wizard.step(ctx);
    }

    if (juiceType.includes(action)) {
      await ctx.reply(
        'Оберіть тару: ',
        Markup.inlineKeyboard([
          [
            ...juiceKeyboard.map((item) => {
              console.log(item);
              return Markup.button.callback(item, item);
            }),
          ],
          downKeyboard.map((item) => {
            return Markup.button.callback(translationMap[item], item);
          }),
        ]),
      );
    }
  }
}
