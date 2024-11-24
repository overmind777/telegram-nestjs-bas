import { Ctx, Start, Update } from 'nestjs-telegraf';
import { DeleteMessageAfter } from './decorators/deleteMessageDecorator';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';

@Update()
export class AppUpdate extends AppService {
  private readonly logger = new Logger()

  @Start()
  @DeleteMessageAfter()
  async onStart(@Ctx() ctx) {
    try {
      const user = await this.getUserById(ctx.update.message.from.id);
      if (!user) {
        await ctx.scene.enter('SELECT_USER_WIZARD');
      } else {
        await ctx.scene.enter('SELECT_PRODUCTS_WIZARD');
      }
    } catch (e) {
      this.logger.warn(e)
    }
  }
}
