import { Injectable } from '@nestjs/common';
import { DbService } from './db/db.service';
import { OrderItem } from './types';

@Injectable()
export class AppService extends DbService {
  constructor(private readonly dbService: DbService) {
    super();
  }

  async getUserById(id: number) {
    return this.dbService.user.findUnique({
      where: {
        idTelegram: id,
      },
    });
  }

  async createNewUser(dataUser) {
    return this.dbService.user.create({
      data: dataUser,
    });
  }

  async createNewOrder(orderItems: OrderItem[], userId: number) {
    const user = await this.dbService.user.findUnique({
      where: { idTelegram: userId },
      include: { orders: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    return await this.dbService.order.create({
      data: {
        items: JSON.stringify(orderItems), // Зберігаємо масив товарів
        userId: +user.idTelegram,
      },
    });
  }
}
