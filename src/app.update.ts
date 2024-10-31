import { Action, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { AppService } from './app.service';
import { OrderItem, UserData } from './types';

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
    address: '',
    notes: '',
    orderItems: [], // Масив для зберігання товарів у замовленні
  };
  private currentItem: OrderItem = {
    product: '',
    volume: '',
    quantity: 0,
  }; // Зберігання тимчасових даних для поточного товару

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
        orderItems: [],
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
        const orderSummary = this.userData.orderItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.product} - ${item.volume}, Кількість: ${item.quantity}`,
          )
          .join('\n');
        await ctx.reply(
          `Ваше замовлення:\n${orderSummary}\n\nПідтвердити замовлення?`,
          Markup.inlineKeyboard([
            Markup.button.callback('Підтвердити', 'confirm_order'),
            Markup.button.callback('Додати ще товар', 'add_more'),
          ]),
        );
        break;

      default:
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
          console.log(this.userData);
          this.userData.orderItems.push({ ...this.currentItem }); // Додаємо товар до замовлення
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
    await ctx.reply(
      'Дякуємо! Ваше замовлення прийнято і буде оброблено найближчим часом.',
    );
    //TODO create a new order in db
    // await this.createNewOrder(
    //   this.userData.idTelegram,
    //   this.userData.orderItems,
    // );
    console.log('Final Order:', this.userData); // Логіка збереження до бази чи обробка
    // Очистимо дані після підтвердження замовлення
    this.userData.orderItems = [];
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

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const contact = ctx.message['contact'];

    this.userData.idTelegram = userId;
    this.userData.phone = contact.phone_number;
    this.userData.name = `${contact.first_name}`;

    await ctx.reply('Дякуємо! Тепер, будь ласка, вкажіть адресу доставки.');
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      'Це бот для оформлення замовлення. Ви можете обрати товар, обʼєм, кількість та оформити замовлення.',
    );
  }
}
