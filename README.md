# TPI UTN

## 🚀 Configuración del Proyecto

Este proyecto utiliza GitHub Actions para la integración continua y Docker para la contenerización de la aplicación Angular.

### 📋 Prerrequisitos

- Node.js 20.x
- Docker Desktop
- Git
- Cuenta de GitHub

## 🔧 Estructura del Proyecto

```
tpi-dabd-integration-app/
├── .github/
│   └── workflows/
│       └── docker-build.yml    # Configuración de GitHub Actions
├── Dockerfile                  # Configuración de Docker
├── .dockerignore              # Archivos ignorados por Docker
└── README.md                  # Este archivo
```

## 🐳 Docker

### Dockerfile Explicado

```dockerfile
# Usar una imagen base de Node
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar Angular CLI
RUN npm install -g @angular/cli@18.2.10

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 4200

# Comando para ejecutar la app
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"]
```

### Comandos Docker Locales

1. Construir la imagen:
```bash
docker build -t angular-dev-app .
```

2. Ejecutar el contenedor:
```bash
docker run -d -p 4200:4200 --name mi-angular-dev angular-dev-app
```

## 🔄 GitHub Actions

El workflow de GitHub Actions automatiza el proceso de build y publicación de la imagen Docker.

### Proceso del Workflow

1. Se activa con:
   - Push a `main` o `develop`
   - Pull Requests a `main`
   - Manualmente desde GitHub

2. Pasos del workflow:
   - Checkout del código
   - Configuración de Docker Buildx
   - Login en GitHub Container Registry
   - Build de la imagen Docker
   - Push de la imagen al registro

### Archivo de Configuración
```yaml
name: UTN Angular Docker Build

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ format('tup-frc-utn/{0}', github.event.repository.name) }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      # ... [resto de la configuración]
```

## 🔑 Configuración del Token para Pull Local

Para poder descargar la imagen localmente, necesitas configurar un Personal Access Token (PAT):

1. Crear el Token:
   - Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click en "Generate new token (classic)"
   - Selecciona los siguientes permisos:
     - `read:packages`
     - `write:packages`
     - `delete:packages`
   - Genera y guarda el token

2. Login en GitHub Container Registry:
```bash
docker login ghcr.io -u TU-USUARIO-DE-GITHUB -p TU-TOKEN
```

3. Pull de la imagen:
```bash
docker pull ghcr.io/tup-frc-utn/tpi-dabd-integration-app:latest
```

4. Ejecutar la imagen:
```bash
docker run -d -p 4200:4200 ghcr.io/tup-frc-utn/tpi-dabd-integration-app:latest
```

## 📝 Notas Importantes

- La imagen se publica en: `ghcr.io/tup-frc-utn/tpi-dabd-integration-app`
- Se generan tags basados en:
  - Nombre de la rama (`main`, `develop`)
  - SHA del commit
  - Tag `latest`
- La aplicación estará disponible en `http://localhost:4200`

## 🔍 Verificación del Deployment

1. Verifica el estado del workflow:
   - Ve a la pestaña "Actions" en GitHub
   - Revisa el último workflow ejecutado

2. Verifica la imagen publicada:
   - Ve a la pestaña "Packages"
   - Busca la imagen `tpi-dabd-integration-app`

## 🛠️ Troubleshooting

### Errores Comunes

1. Error "unauthorized" al hacer pull:
   - Verifica que has hecho login correctamente con `docker login ghcr.io`
   - Asegúrate de que el token tiene los permisos correctos

2. Error de permisos en GitHub Actions:
   - Verifica los permisos en Settings → Actions → General
   - Asegúrate de que "Read and write permissions" está habilitado

3. Error de build:
   - Revisa los logs en la pestaña Actions
   - Verifica que el Dockerfile es correcto
   - Asegúrate de que todas las dependencias están correctamente definidas

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs de Actions
2. Verifica la configuración de permisos
3. Crea un issue en el repositorio

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
