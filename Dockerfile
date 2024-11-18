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

ARG ENVIRONMENT=production
ENV ENVIRONMENT=$ENVIRONMENT

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
