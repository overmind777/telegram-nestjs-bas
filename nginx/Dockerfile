# Dockerfile для Nginx
FROM nginx:alpine

# Копіюємо конфігурацію Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копіюємо згенеровані файли фронтенду до веб-директориї Nginx
COPY --from=webappfulltelegramdocker-frontend /app/dist /usr/share/nginx/html

EXPOSE 80 