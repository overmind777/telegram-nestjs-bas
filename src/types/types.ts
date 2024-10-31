import { Context } from 'telegraf';

export interface MyContext extends Context {
  myProp?: string;
  myOtherProp?: number;
}

export interface UserData {
  idTelegram: number;
  phone: string;
  name: string;
  waitingForAddress?: boolean;
  address: string;
  waitingForNotes?: boolean;
  notes: string;
}

export interface OrderItem {
  product: string;
  volume: string;
  quantity: number;
}

export interface Order {
  currentItem: OrderItem[];
}
