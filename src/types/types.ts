import { Context } from 'telegraf';

export interface MyContext extends Context {
  myProp?: string;
  myOtherProp?: number;
}

export interface UserData {
  idTelegram: number;
  phone: string;
  name: string;
  address: string;
  notes: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  product: string;
  volume: string;
  quantity: number;
}
