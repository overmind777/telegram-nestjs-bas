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
  сік: ['10 л', '5 л', '3 л', '1 л'],
  кава: ['мелена', 'зерно'],
};

// Типи продуктів та їх об’єми
export const productsType: ProductType = {
  'не газ': ['18.9 л', '6 л', '1.5 л', '0.5 л'],
  газ: ['1.5 л', '0.5 л'],
  мелена: ['1 kг', '0.250 kг'],
  зерно: ['1 kг', '0.250 kг'],
};

// Доступні варіанти кількостей
export const choicesQuantity: string[] = ['1', '2', '3', '4', '5'];
