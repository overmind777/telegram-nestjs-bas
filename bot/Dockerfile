# Етап 1: Збірка
FROM node:18-alpine AS builder

# Встановлюємо залежності для збірки
RUN apk add --no-cache python3 make g++ openssl git bash && npm install -g prisma && apk del python3 make g++ openssl git bash


# Встановлюємо Prisma CLI
RUN npm install -g prisma

# Встановлюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json
COPY ./bot/package*.json ./
COPY ./bot/tsconfig.json ./

# Копіюємо папку prisma разом з schema.prisma
COPY bot/prisma ./prisma

# Встановлюємо залежності
RUN npm install

# Копіюємо весь проект (не включаючи файли, зазначені в .dockerignore)
COPY . .

# Генеруємо Prisma клієнт
RUN npx prisma generate --schema=./bot/prisma/schema.prisma

# Компілюємо TypeScript у JavaScript
RUN npm run build

# Етап 2: Продакшн-образ
FROM node:18-alpine

# Встановлюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо лише згенерований код і залежності з етапу збірки
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Копіюємо Prisma схему (для можливості міграцій у продакшн)
COPY --from=builder /usr/src/app/package*.json ./

# Встановлюємо NODE_ENV
ENV NODE_ENV=production

# Експонуємо порт
EXPOSE 3000

# Запускаємо застосунок
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
