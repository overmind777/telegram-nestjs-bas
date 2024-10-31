import { Action, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { AppService } from './app.service';
import { Order, OrderItem, UserData } from './types';

const waterChoices: string[] = ['18.9 l', '6 l', '1.5 l', '0.5 l'];
const juiceChoices: string[] = ['10 l', '5 l', '3 l', '1 l'];
const coffeeChoices: string[] = ['1 kg', '0.250 kg'];
const quantityChoices: string[] = ['1', '2', '3', '5'];

@Update()
export class AppUpdate extends AppService {
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
    volume: '',
    quantity: 0,
  }; // Зберігання тимчасових даних для поточного товару

  private orderItems: Order = {
    currentItem: [],
  };

  private msgId: number;

  @Start()
  async start(@Ctx() ctx: Context) {
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
        Markup.keyboard([
          ['Вода', 'Сік', 'Кава'],
          ['Переглянути замовлення', 'Назад'],
        ])
          .resize()
          .oneTime(),
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

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const message: string = ctx.message['text'].toLowerCase();

    switch (message) {
      case 'вода':
      case 'сік':
      case 'кава':
        this.currentItem = { product: message, volume: '', quantity: 0 };
        const choices =
          message === 'вода'
            ? waterChoices
            : message === 'сік'
              ? juiceChoices
              : coffeeChoices;
        await ctx.reply(
          `Оберіть об'єм для ${message}`,
          Markup.keyboard([choices, ['Назад']])
            .resize()
            .oneTime(),
        );
        break;

      case 'назад':
        await this.start(ctx);
        break;

      case 'переглянути замовлення':
        const orderDetails = this.orderItems.currentItem
          .map((item: OrderItem) => {
            return `Товар: ${item.product}, Обʼєм: ${item.volume}, Кількість: ${item.quantity}`;
          })
          .join('\n'); // Об'єднуємо рядки в один

        console.log(this.userData);
        await ctx.reply(
          `Ваше замовлення:\n${orderDetails}\n\nПідтвердити замовлення?`,
          Markup.inlineKeyboard([
            Markup.button.callback('Підтвердити', 'confirm_order'),
            Markup.button.callback('Додати ще товар', 'add_more'),
            Markup.button.callback('Корегувати замовлення', 'change_order'),
          ]),
        );
        break;

      default:
        if (this.userData?.waitingForAddress) {
          // Отримання адреси
          this.userData.address = message; // Збереження адреси
          this.userData.waitingForAddress = false;
          this.userData.waitingForNotes = true; // Перехід до запиту приміток
          await ctx.reply('Вкажіть додаткові примітки чи інструкції, якщо є.');
        } else if (this.userData?.waitingForNotes) {
          // Отримання приміток
          this.userData.notes = message;
          this.userData.waitingForNotes = false;
          await this.createNewUser(this.userData);
          await ctx.reply(
            'Дякуємо! Оберіть Ваше перше замовлення',
            Markup.keyboard([
              ['Вода', 'Сік', 'Кава'],
              ['Переглянути замовлення', 'Назад'],
            ])
              .resize()
              .oneTime(),
          );
        }
        // Якщо обрано обʼєм
        if (this.currentItem.product && !this.currentItem.volume) {
          this.currentItem.volume = message;
          await ctx.reply(
            'Вкажіть кількість',
            Markup.keyboard([quantityChoices, ['Назад']])
              .resize()
              .oneTime(),
          );
        }
        // Якщо обрано кількість
        else if (this.currentItem.volume && !this.currentItem.quantity) {
          this.currentItem.quantity = +message;
          this.orderItems.currentItem.push({ ...this.currentItem }); // Додаємо товар до замовлення
          this.currentItem = {
            product: '',
            volume: '',
            quantity: 0,
          }; // Очищаємо поточний товар
          await ctx.reply(
            'Товар додано до замовлення. Оберіть інший товар або перегляньте замовлення.',
            Markup.keyboard([
              ['Вода', 'Сік', 'Кава'],
              ['Переглянути замовлення', 'Назад'],
            ])
              .resize()
              .oneTime(),
          );
        }
    }
  }

  @Action('confirm_order')
  async confirmOrder(@Ctx() ctx: Context) {
    console.log(this.orderItems.currentItem, this.userData.idTelegram);
    await ctx.update['callback_query'];
    await ctx.reply(
      'Дякуємо! Ваше замовлення прийнято і буде оброблено найближчим часом.',
    );

    await this.createNewOrder(
      this.orderItems.currentItem,
      this.userData.idTelegram,
    );

    // await ctx.deleteMessage(this.msgId);

    // Очищення замовлення після збереження
    this.orderItems.currentItem = [];
    this.msgId = null;
  }

  @Action('add_more')
  async addMoreItems(@Ctx() ctx: Context) {
    await ctx.reply(
      'Оберіть товар, який бажаєте додати до замовлення.',
      Markup.keyboard([
        ['Вода', 'Сік', 'Кава'],
        ['Переглянути замовлення', 'Назад'],
      ])
        .resize()
        .oneTime(),
    );
  }

  @Action('change_order')
  async changeOrder(@Ctx() ctx: Context) {
    await ctx.reply(
      'Зробіть зміни',
      Markup.keyboard([
        ['Товар', 'Обʼєм', 'Кількість'],
        ['Переглянути замовлення', 'Назад'],
      ])
        .resize()
        .oneTime(),
    );
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

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      'Це бот для оформлення замовлення. Ви можете обрати товар, обʼєм, кількість та оформити замовлення.',
    );
  }
}
