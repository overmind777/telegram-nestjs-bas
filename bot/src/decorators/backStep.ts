import { Context } from 'telegraf';

// Глобальний об'єкт для зберігання станів користувачів
const userStates: Record<number, string[]> = {};

export function BackStep() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const ctx: Context = args[0];

      // try {
      //     const userId = ctx.from?.id;
      //     if (!userId) return;
      //
      //     // Ініціалізація стану користувача, якщо його ще немає
      //     if (!userStates[userId]) {
      //         userStates[userId] = [];
      //     }
      console.log(ctx);
      // Якщо користувач вибирає "back"
      //   if (ctx.message['text']) {
      //     if (
      //       typeof ctx.message['text'] === 'string' &&
      //       ctx.message['text'] === 'back'
      //     ) {
      //       const previousMenu = userStates[userId].pop();
      //       if (previousMenu) {
      //         await ctx.reply(
      //           `Повертаємося до попереднього меню: ${previousMenu}`,
      //         );
      //       } else {
      //         await ctx.reply('Немає попереднього меню.');
      //       }
      //     }
      //   } else {
      //     // Додати поточне меню до стану (якщо це не "back")
      //     userStates[userId].push(propertyKey);
      //     await originalMethod.apply(this, args);
      //   }
      // } catch (error) {
      //   console.error('Помилка при переході назад:', error);
      // }
    };
  };
}
