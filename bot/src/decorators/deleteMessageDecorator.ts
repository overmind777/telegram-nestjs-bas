// delete-message-after.decorator.ts
import { Context } from 'telegraf';

export function DeleteMessageAfter() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const ctx: Context = args[0];

      try {
        // Виконати основний метод
        await originalMethod.apply(this, args);
      } finally {
        // Видалення повідомлення після виконання основної дії
        if (ctx && ctx.msg && 'message_id' in ctx.msg) {
          await ctx.deleteMessage(ctx.msg.message_id);
        }
      }
    };
  };
}
