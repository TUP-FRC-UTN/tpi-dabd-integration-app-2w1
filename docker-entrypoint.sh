#!/bin/sh

# Configuración: Definir la URL base predeterminada
if [ -z "$API_URL" ]; then
  API_URL="http://localhost:8080"
fi

# Generar environment.prod.ts dinámicamente en la ruta correcta
echo "Generando environment.prod.ts con BASE_URL=$API_URL"
cat <<EOF > /app/src/app/common/environments/environment.prod.ts
export const environment = {
  production: true,
  services: {
    accesses: "${API_URL}/accesses",
    addresses: "${API_URL}/addresses",
    complaints: "${API_URL}/complaints",
    contacts: "${API_URL}/contacts",
    employees: "${API_URL}/employees",
    expenseGeneration: "${API_URL}/expense-generation",
    expensesManager: "${API_URL}/expenses-manager",
    fileManager: "${API_URL}/file-manager",
    inventory: "${API_URL}/inventory",
    mercadoPago: "${API_URL}/mercado-pago-service",
    notifications: "${API_URL}/notifications",
    ownersAndPlots: "${API_URL}/owners-and-plots",
    sanctions: "${API_URL}/sanctions",
    stripeService: "${API_URL}/stripe-service",
    usersAndAddresses: "${API_URL}/users-and-addresses",
  }
};
EOF

# Imprimir contenido generado para verificar
echo "Archivo environment.prod.ts generado:"
cat /app/src/app/common/environments/environment.prod.ts

# Iniciar la aplicación según el entorno
if [ "$ENVIRONMENT" = "development" ]; then
  echo "Starting in DEVELOPMENT mode"
  ng serve --configuration=development --host 0.0.0.0 --poll=2000
elif [ "$ENVIRONMENT" = "local" ]; then
  echo "Starting in LOCAL mode"
  ng serve --configuration=local --host 0.0.0.0 --poll=2000
else
  echo "Starting in PRODUCTION mode"
  ng serve --configuration=production --host 0.0.0.0 --poll=2000
fi