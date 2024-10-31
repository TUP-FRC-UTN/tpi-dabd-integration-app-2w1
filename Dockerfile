FROM node:20-alpine

WORKDIR /app

# Copiar los archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar el CLI de Angular globalmente
RUN npm install -g @angular/cli@18.2.10

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"]