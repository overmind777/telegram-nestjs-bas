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
};

// Товари та їх види
export const goods: Goods = {
  вода: ['не газ', 'газ'],
  сік: ['10 l', '5 l', '3 l', '1 l'],
  кава: ['мелена', 'зерно'],
};

// Типи продуктів та їх об’єми
export const productsType: ProductType = {
  'не газ': ['18.9 l', '6 l', '1.5 l', '0.5 l'],
  газ: ['1.5 l', '0.5 l'],
  мелена: ['1 kg', '0.250 kg'],
  зерно: ['1 kg', '0.250 kg'],
};

// Доступні варіанти кількостей
export const choicesQuantity: string[] = ['0', '1', '2', '3', '5'];
