import { Action, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { AppService } from './app.service';
import { Order, OrderItem, UserData } from './types';

const quantityChoices: string[] = ['0', '1', '2', '3', '5'];
const productChoices: { [key: string]: string[] } = {
  вода: ['18.9 l', '6 l', '1.5 l', '0.5 l'],
  сік: ['10 l', '5 l', '3 l', '1 l'],
  кава: ['1 kg', '0.250 kg'],
};

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

  private isChangingOrder: boolean = false;
  private msg;

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
        const newArr = this.orderItems.currentItem.map((item) => {
          if (item.product.includes(this.currentItem.product)) {
            item = {
              product: this.currentItem.product,
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
    this.currentItem = { product: '', volume: '', quantity: 0 };
  }

  // Новий метод для вибору об'єму
  async selectVolume(ctx: Context, product: string) {
    const choices = productChoices[product];
    if (choices) {
      await ctx.reply(
        `Оберіть об'єм для ${product}`,
        Markup.keyboard([choices, ['Назад']])
          .resize()
          .oneTime(),
      );
    } else {
      await ctx.reply('Вибраний товар не підтримує вибір об’єму.');
    }
  }

  // Новий метод для вибору кількості
  async selectQuantity(ctx: Context) {
    await ctx.reply(
      'Вкажіть кількість',
      Markup.keyboard([quantityChoices, ['Назад']])
        .resize()
        .oneTime(),
    );
  }

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
    const message: string = ctx.message['text'].toLowerCase().includes(' ')
      ? ctx.message['text']
          .toLowerCase()
          .trim()
          .substring(0, ctx.message['text'].toLowerCase().indexOf(' '))
      : ctx.message['text'].toLowerCase();

    const goodsKeyboard =
      productChoices[message.trim().substring(0, message.indexOf(' '))];

    switch (message) {
      case 'вода':
      case 'сік':
      case 'кава':
        this.currentItem = { product: message, volume: '', quantity: 0 };
        await this.selectVolume(ctx, message); // Виклик нового методу для об'єму
        break;

      case 'товар':
        // Отримуємо масив рядків з товаром та об'ємом
        const goodsChangeKeyboard = this.orderItems.currentItem.map((item) => {
          return `${item.product} ${item.volume}`;
        });

        await ctx.reply(
          'Виберіть товар для замовлення:',
          Markup.keyboard([...[goodsChangeKeyboard], ['Назад']]) // Розкриваємо масив
            .resize()
            .oneTime(),
        );
        break;

      case 'обʼєм':
        if (this.currentItem.product) {
          await this.selectVolume(ctx, this.currentItem.product); // Виклик нового методу для об'єму
        } else {
          await ctx.reply(
            'Будь ласка, спочатку оберіть товар.',
            Markup.keyboard([goodsKeyboard, ['Назад']])
              .resize()
              .oneTime(),
          );
        }
        break;

      case 'кількість':
        await this.selectQuantity(ctx); // Виклик нового методу для кількості
        break;

      case 'назад':
        await this.start(ctx);
        break;

      case 'переглянути':
        const orderDetails = this.orderItems.currentItem
          .map((item: OrderItem) => {
            return `Товар: ${item.product}, Обʼєм: ${item.volume}, Кількість: ${item.quantity}`;
          })
          .join('\n'); // Об'єднуємо рядки в один

        this.msg = await ctx.reply(
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
          await this.selectQuantity(ctx); // Переходимо до вибору кількості
        }
        // Якщо обрано кількість
        else if (this.currentItem.volume) {
          this.currentItem.quantity = +message;
          this.addItemToOrder(this.currentItem.volume);
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
    setTimeout(async () => {
      await ctx.deleteMessage(this.msg.message_id);
    }, 1000);

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
  async addMoreItems(@Ctx() ctx: Context) {
    this.isChangingOrder = false;
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
    if (this.orderItems.currentItem.length >= 2) {
      await ctx.reply(
        'Зробіть зміни',
        Markup.keyboard([['Товар'], ['Переглянути замовлення', 'Назад']])
          .resize()
          .oneTime(),
      );
      this.isChangingOrder = true;
    } else {
      await ctx.reply(
        'Зробіть зміни',
        Markup.keyboard([
          ['Обʼєм', 'Кількість'],
          ['Переглянути замовлення', 'Назад'],
        ])
          .resize()
          .oneTime(),
      );
      this.isChangingOrder = true;
    }
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
