// Опис інтерфейсу для категорії товару

interface Goods {
  [key: string]: string[];
}

// Опис інтерфейсу для типу продукту
interface ProductType {
  [key: string]: string[];
}

export const translationMap = {
  water: 'вода',
  juice: 'сік',
  coffee: 'кава',
  back: 'назад',
  cancel: 'відміна',
  no_gas: 'не газ',
  gas: 'газ',
  ground: 'мелена',
  bean: 'зерно',
  apple: 'яблуко',
  apple_carrot: 'яблуко-морква',
  apple_pumpkin: 'яблуко-гарбуз',
  apple_aronia: 'яблуко-аронія',
  apple_strawberry: 'яблуко-полуниця',
  apple_raspberry: 'яблуко-малина',
  apple_cherry: 'яблуко-вишня',
  apple_pear: 'яблуко-груша',
  tomato: 'томатний',
};

// Товари та їх види
export const goods: Goods = {
  water: ['no_gas', 'gas'],
  juice: [
    'apple',
    'apple_carrot',
    'apple_pumpkin',
    'apple_aronia',
    'apple_strawberry',
    'apple_raspberry',
    'apple_cherry',
    'apple_pear',
    'tomato',
  ],
  coffee: ['ground', 'bean'],
};

// Типи продуктів та їх об’єми
export const productsType: ProductType = {
  no_gas: ['18.9 л', '6 л', '1.5 л', '0.5 л'],
  gas: ['1.5 л', '0.5 л'],
  ground: ['1 kг', '0.250 kг'],
  bean: ['1 kг', '0.250 kг'],
};

// Доступні варіанти кількостей
export const choicesQuantity: string[] = ['1', '2', '3', '4', '5'];

export const downKeyboard: string[] = ['cancel', 'back'];
export const goodsKeyboard: string[] = ['water', 'juice', 'coffee'];
export const typesKeyboard: string[] = ['no_gas', 'gas', 'ground', 'bean'];
export const juiceType: string[] = [
  'apple',
  'apple_carrot',
  'apple_pumpkin',
  'apple_aronia',
  'apple_strawberry',
  'apple_raspberry',
  'apple_cherry',
  'apple_pear',
  'tomato',
];

export const juiceKeyboard: string[] = ['10 л', '5 л', '3 л', '1 л'];
