# Etapa 1: construir la app
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Etapa 2: servirla con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
