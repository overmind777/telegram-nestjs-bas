import { Action, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { AppService } from './app.service';
import { Order, OrderItem, UserData } from './types';
import {
  choicesQuantity,
  goods,
  productsType,
  translationMap,
} from './helpers/goods';
import { Logger } from '@nestjs/common';
import { DeleteMessageAfter } from './decorators/deleteMessageDecorator';

@Update()
export class AppUpdateV2 extends AppService {
  private readonly logger = new Logger(AppUpdateV2.name);
  private userData: UserData = {
    idTelegram: null,
    phone: '',
    name: '',
    waitingForAddress: true,
    address: '',
    waitingForNotes: false,
    notes: '',
  };

  private currentItem: OrderItem = {
    product: '',
    type: '',
    tara: '',
    volume: '',
    quantity: 0,
  }; // Зберігання тимчасових даних для поточного товару

  private orderItems: Order = {
    currentItem: [],
  };

  private isChangingOrder: boolean = false;

  private currentProduct: string = ''; // Поточний вибраний товар
  private currentType: string = ''; // Поточний вибраний тип товару

  // Метод для додавання товару до замовлення
  private addItemToOrder(volume: string) {
    const existingItemIndex = this.orderItems.currentItem.findIndex(
      (item) =>
        item.product === this.currentItem.product &&
        item.volume === this.currentItem.volume,
    );

    if (this.isChangingOrder) {
      // Якщо це редагування замовлення, оновлюємо кількість або інші поля товару
      if (existingItemIndex === -1) {
        const newArr = this.orderItems.currentItem?.map((item) => {
          if (item.product.includes(this.currentItem.product)) {
            item = {
              product: this.currentItem.product,
              type: this.currentItem.type,
              volume,
              quantity: this.currentItem.quantity,
            };
            return item;
          }
          return item;
        });
        this.orderItems.currentItem = newArr;
      } else {
        console.log('Товар для редагування не знайдено');
      }
      this.isChangingOrder = false; // Скидаємо прапор після редагування
    } else {
      // Якщо це нове замовлення, додаємо новий товар або оновлюємо чинний
      if (existingItemIndex !== -1) {
        this.orderItems.currentItem[existingItemIndex].quantity +=
          this.currentItem.quantity;
      } else {
        this.orderItems.currentItem.push({ ...this.currentItem });
      }
    }

    // Очищення поточного товару після додавання/оновлення
    this.currentItem = { product: '', type: '', volume: '', quantity: 0 };
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      Logger.error('Failed to delete message', error);
    }

    const user = await this.getUserById(ctx.from.id);
    if (user) {
      this.userData = {
        idTelegram: user.idTelegram,
        phone: user.phone,
        name: user.name,
        address: user.address,
        notes: user.notes,
      };
      await ctx.reply(
        `Вітаємо в службі доставки ТМ "Вода Подільська".\nОберіть товар`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('Вода', 'water'),
            Markup.button.callback('Сік', 'juice'),
            Markup.button.callback('Кава', 'coffee'),
          ],

          [Markup.button.callback('Відміна', 'cancel')],
        ]),
      );
    } else {
      await ctx.reply(
        'Вітаємо в службі доставки ТМ "Вода Подільська".\nЗареєструйтесь, будь ласка.\nДля цього поділіться номером телефону',
        Markup.keyboard([
          Markup.button.contactRequest('Надіслати номер телефону'),
        ])
          .resize()
          .oneTime(),
      );
    }
  }

  @Action(['water', 'juice', 'coffee'])
  @DeleteMessageAfter()
  async firstKeyboard(@Ctx() ctx: Context) {
    const action = ctx.callbackQuery['data']; // отримуємо текст дії (назву кнопки)
    this.currentProduct = action;
    this.currentProduct = translationMap[action];

    const choices = goods[this.currentProduct];

    this.currentItem = {
      product: this.currentProduct,
      type: '',
      volume: '',
      quantity: 0,
    };

    await ctx.reply(
      `Оберіть тип для ${action === 'water' ? 'води' : action === 'juice' ? 'соку' : 'кави'}`,
      Markup.inlineKeyboard(
        choices?.map(
          (type) => [Markup.button.callback(type, type)],
          [Markup.button.callback('Відміна', 'cancel')],
        ),
      ),
    );
  }

  // Обробник для вибору типу
  @Action(['не газ', 'газ', 'мелена', 'зерно'])
  @DeleteMessageAfter()
  async selectType(@Ctx() ctx: Context) {
    const action = ctx.callbackQuery['data'];
    this.currentItem.type = action;
    this.currentType = action;
    const volumes = productsType[this.currentType];

    await ctx.reply(
      `Оберіть об’єм для ${this.currentType}`,
      Markup.inlineKeyboard([
        ...volumes?.map((volume) => [Markup.button.callback(volume, volume)]),
        [Markup.button.callback('Відміна', 'cancel')],
      ]),
    );
  }

  // Обробник для вибору об’єму
  @Action([
    '18.9 л',
    '10 л',
    '6 л',
    '5 л',
    '3 л',
    '1.5 л',
    '1 л',
    '0.5 л',
    '1 kг',
    '0.250 kг',
  ])
  @DeleteMessageAfter()
  async selectVolume(@Ctx() ctx: Context) {
    const action = ctx.callbackQuery['data'];
    this.currentItem.volume = action;
    if (action === '18.9 л'){
      await ctx.reply('Тара на обмін?',
          Markup.inlineKeyboard([
              Markup.button.callback('Так', 'так'),
              Markup.button.callback('Ні', 'ні')
          ]))
    } else {
      await ctx.reply(
        'Вкажіть кількість',
        Markup.inlineKeyboard([
          ...choicesQuantity.map((quantity) => [
            Markup.button.callback(quantity, quantity),
          ]),
          [Markup.button.callback('Відміна', 'cancel')],
        ]),
      );
    }
  }

  @Action(['так', 'ні'])
  @DeleteMessageAfter()
  async selectVolumeBigPuck(@Ctx() ctx: Context){
    this.currentItem.tara = ctx.callbackQuery['data'];
    await ctx.reply(
        'Вкажіть кількість',
        Markup.inlineKeyboard([
          ...choicesQuantity.map((quantity) => [
            Markup.button.callback(quantity, quantity),
          ]),
          [Markup.button.callback('Відміна', 'cancel')],
        ]),
    );
  }

  @Action(['1', '2', '3', '4', '5'])
  @DeleteMessageAfter()
  async selectQuantity(@Ctx() ctx: Context) {
    const action = ctx.callbackQuery['data'];
    this.currentItem.quantity = action;
    this.logger.log(`@Action(['1', '2', '3', '4', '5']) --- ${this.orderItems.currentItem}`);
    this.addItemToOrder(action);
    const orderDetails = this.orderItems.currentItem
      .map((item: OrderItem) => {
        return `Товар: ${item.product}, Тип: ${item.type}, Обʼєм: ${item.volume}, Кількість: ${item.quantity}`;
      })
      .join('\n');

    await ctx.reply(
      `Ваше замовлення:\n${orderDetails}\n\nПідтвердити замовлення?`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Підтвердити', 'confirm_order'),
          Markup.button.callback('Додати ще товар', 'add_more'),
          Markup.button.callback('Корегувати замовлення', 'change_order'),
        ],
        [Markup.button.callback('Відміна', 'cancel')],
      ]),
    );
  }

  @Action('cancel')
  @DeleteMessageAfter()
  async cancelOrder(@Ctx() ctx: Context) {
    await ctx.reply('Замовлення скасовано.');
  }

  @Action('confirm_order')
  @DeleteMessageAfter()
  async confirmOrder(@Ctx() ctx: Context) {
    await ctx.reply(
      'Дякуємо! Ваше замовлення прийнято і буде оброблено найближчим часом.',
    );

    await this.createNewOrder(
      this.orderItems.currentItem,
      this.userData.idTelegram,
    );

    // Очищення замовлення після збереження
    this.orderItems.currentItem = [];
  }

  @Action('add_more')
  @DeleteMessageAfter()
  async addMoreItems(@Ctx() ctx: Context) {
    this.isChangingOrder = false;
    await ctx.reply(
      'Оберіть товар, який бажаєте додати до замовлення.',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Вода', 'water'),
          Markup.button.callback('Сік', 'juice'),
          Markup.button.callback('Кава', 'coffee'),
        ],
        [Markup.button.callback('Назад', 'back')],
      ]),
    );
  }

  @Action('change_order')
  @DeleteMessageAfter()
  async changeOrder(@Ctx() ctx: Context) {
    if (this.orderItems.currentItem.length >= 2) {
      await ctx.reply(
        'Зробіть зміни',
        //TODO!  add inline keyboard
      );
      this.isChangingOrder = true;
    } else {
      await ctx.reply(
        'Зробіть зміни',
        //TODO!  add inline keyboard
      );
      this.isChangingOrder = true;
    }
  }

  @Action('back')
  @DeleteMessageAfter()
  async selectBack(@Ctx() ctx: Context) {
    //TODO create logic for back button
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const contact = ctx.message['contact'];

    this.userData = {
      idTelegram: userId,
      phone: contact.phone_number,
      name: `${contact.first_name}`,
      waitingForAddress: true,
      address: '',
      notes: '',
    };

    await ctx.reply('Дякуємо! Тепер, будь ласка, вкажіть адресу доставки.');
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    if (this.userData?.waitingForAddress) {
      // Отримання адреси
      this.userData.address = ctx.text; // Збереження адреси
      this.userData.waitingForAddress = false;
      this.userData.waitingForNotes = true; // Перехід до запиту приміток
      await ctx.reply('Вкажіть додаткові примітки чи інструкції, якщо є.');
    } else if (this.userData?.waitingForNotes) {
      // Отримання приміток
      this.userData.notes = ctx.text;
      this.userData.waitingForNotes = false;
      await this.createNewUser(this.userData);
      await ctx.reply(
          `Вітаємо в службі доставки ТМ "Вода Подільська".\nОберіть товар`,
          Markup.inlineKeyboard([
            [
              Markup.button.callback('Вода', 'water'),
              Markup.button.callback('Сік', 'juice'),
              Markup.button.callback('Кава', 'coffee'),
            ],

            [Markup.button.callback('Відміна', 'cancel')],
          ]),
      );
    }
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      'Це бот для оформлення замовлення. Ви можете обрати товар, обʼєм, кількість та оформити замовлення.',
    );
  }
}
