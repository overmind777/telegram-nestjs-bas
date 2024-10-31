import { Injectable } from '@nestjs/common';
import { DbService } from './db/db.service';

@Injectable()
export class AppService extends DbService {
  constructor(private readonly dbService: DbService) {
    super();
  }

  async getUserById(id: number) {
    return await this.dbService.user.findUnique({
      where: {
        idTelegram: id,
      },
    });
  }

  async createNewUser(dataUser: {
    idTelegram: number;
    name: string;
    phone: string;
    address: string;
    notes: string;
  }) {
    console.log(dataUser);
    return await this.dbService.user.create({
      data: {
        idTelegram: dataUser.idTelegram,
        name: dataUser.name,
        phone: dataUser.phone,
        address: dataUser.address,
        notes: dataUser.notes,
      },
    });
  }

  // async createNewOrder(
  //   userId: number,
  //   dataOrder: [
  //     {
  //       product: string;
  //       volume: string;
  //       quantity: number;
  //     },
  //   ],
  // ) {
  //   return await this.dbService.order.create({
  //     owner: userId,
  //     data: {
  //       goods: dataOrder[0].product,
  //       volume: dataOrder[0].volume,
  //       quantity: dataOrder[0].quantity,
  //     },
  //   });
  // }
}
