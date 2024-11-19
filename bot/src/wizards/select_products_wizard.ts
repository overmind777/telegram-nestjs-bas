import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import {
  choicesQuantity,
  downKeyboard,
  goods,
  goodsKeyboard,
  juiceType,
  productsType,
  translationMap,
} from '../helpers/goods';
import { DeleteMessageAfter } from '../decorators/deleteMessageDecorator';
import { AppService } from '../app.service';
import { DbService } from '../db/db.service';

@Wizard('SELECT_PRODUCTS_WIZARD')
export class SelectProductsWizard extends AppService {
  private downsKeyboard = [];
  private goodsChoise = [];

  constructor(dbService: DbService) {
    super(dbService);
    this.downsKeyboard = downKeyboard.map((item) =>
      Markup.button.callback(translationMap[item], item),
    );
    this.goodsChoise = [];
  }

  // Генератор клавіатури
  private generateKeyboard(items: string[], chunkSize = 3): any[] {
    console.log(items);
    return items
      .map((item) =>
        Markup.button.callback(
          translationMap[item] ? translationMap[item] : item,
          item,
        ),
      )
      .reduce((rows, button, index) => {
        if (index % chunkSize === 0) {
          rows.push([]); // Створюємо новий рядок
        }
        rows[rows.length - 1].push(button); // Додаємо кнопку до останнього рядка
        return rows;
      }, []); // Початкове значення — порожній масив рядків
  }

  // Генерація загальної клавіатури з додаванням "Назад" та інших опцій
  private generateMenu(items: string[], chunkSize = 3): any {
    const buttons = this.generateKeyboard(items, chunkSize);
    return Markup.inlineKeyboard([...buttons, this.downsKeyboard]);
  }

  private async confirm(@Ctx() ctx) {
    const userId = ctx.update.callback_query.from.id;
    await this.createNewOrder(this.goodsChoise, userId);
  }

  private addNew(@Ctx() ctx) {
    ctx.wizard.selectStep(0); // Повернення на перший крок
    ctx.wizard.steps[ctx.wizard.cursor](ctx); // Виклик першого кроку
  }

  private change(@Ctx() ctx) {
    console.log('change');
  }

  // Вибір товару
  @WizardStep(1)
  async onStep1(@Ctx() ctx) {
    await ctx.reply(
      `Вітаємо в службі доставки ТМ "Вода Подільська".\nОберіть товар`,
      this.generateMenu(
        goodsKeyboard.map((item) => {
          console.log(item);
          return item;
        }),
        2,
      ),
    );
    console.log('first state', ctx.wizard.state);
    ctx.wizard.next();
  }

  // Вибір типу товару
  @WizardStep(2)
  @DeleteMessageAfter()
  async onStep2(@Ctx() ctx) {
    const action = ctx.update?.callback_query?.data;
    const choice = goods[action];

    if (action === 'back') {
      ctx.wizard.selectStep(0);
      return ctx.wizard.steps[ctx.wizard.cursor](ctx); // Викликаємо попередній крок
    }

    if (action === 'cancel') {
      return ctx.scene.leave();
    }

    if (!choice) {
      await ctx.reply('Невідома команда. Спробуйте ще раз.');
      return;
    }

    (ctx.wizard.state.goodsName = ctx.update.callback_query.data),
      console.log(ctx.wizard.state);

    await ctx.reply(
      'Оберіть тип: ',
      this.generateMenu(choice, action === 'juice' ? 3 : 2),
    );
    ctx.wizard.next();
  }

  // Вибір обʼєму товару
  @WizardStep(3)
  @DeleteMessageAfter()
  async onStep3(@Ctx() ctx) {
    try {
      const action = ctx.update?.callback_query?.data;

      if (action === 'back') {
        ctx.wizard.selectStep(1);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx); // Викликаємо попередній крок
      }

      const volumes = productsType[action] || juiceType;
      console.log('Volumes :', volumes);
      if (!volumes) {
        await ctx.reply('Невідома команда. Спробуйте ще раз.');
        return;
      }

      ctx.wizard.state.goodsType = ctx.update.callback_query.data;
      console.log(ctx.wizard.state);
      await ctx.reply('Оберіть тару: ', this.generateMenu(volumes, 2));
      ctx.wizard.next();
    } catch (e) {
      console.log(e);
    }
  }

  // Вибір кількості
  @WizardStep(4)
  @DeleteMessageAfter()
  async onStep4(@Ctx() ctx) {
    ctx.wizard.state.goodsVolume = ctx.update.callback_query.data;
    console.log(ctx.wizard.state);
    try {
      await ctx.reply(
        'Оберіть кількість: ',
        this.generateMenu(choicesQuantity, 2),
      );
    } catch (e) {
      console.log(e);
    }
    ctx.wizard.next();
  }

  @WizardStep(5)
  @DeleteMessageAfter()
  async onStep(@Ctx() ctx) {
    ctx.wizard.state.goodsQuantity = ctx.update.callback_query.data;
    console.log(ctx.wizard.state);
    this.goodsChoise.push({ ...ctx.wizard.state });

    // this.goodsChoise = [...this.goodsChoise, ctx.wizard.state];
    console.log(this.goodsChoise);

    await ctx.reply(
      `${this.goodsChoise
        .map(
          (item) =>
            `Товар: ${item.goodsName}, Тип: ${item.goodsType}, Обʼєм: ${item.goodsVolume}, Кількість: ${item.goodsQuantity}`,
        )
        .join('\n')}
\nПідтвердіть замовлення:`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Підтвердити', 'confirm'),
          Markup.button.callback('Додати товар', 'addNew'),
          Markup.button.callback('Корегувати', 'change'),
        ],
        [Markup.button.callback('Cancel', 'cancel')],
      ]),
    );

    ctx.wizard.next();
  }

  @WizardStep(6)
  @DeleteMessageAfter()
  async onChoice(@Ctx() ctx) {
    const choice = ctx.update.callback_query.data;
    switch (choice) {
      case 'confirm':
        this.confirm(ctx);
        await ctx.reply(
          'Ваше замовлення буде оброблене як найшвидше. Дакуємо.',
        );
        ctx.scene.leave();
        break;
      case 'addNew':
        this.addNew(ctx);
        break;
      case 'change':
        this.change(ctx);
        break;
      case 'back':
        ctx.wizard.selectStep(4); // Повертаємось на вибір кількості
        ctx.wizard.steps[ctx.wizard.cursor](ctx);
        break;
      case 'cancel':
        await ctx.reply('Замовлення скасоване.');
        ctx.scene.leave();
        break;
      default:
        await ctx.reply('Невідома команда.');
    }
  }
}
