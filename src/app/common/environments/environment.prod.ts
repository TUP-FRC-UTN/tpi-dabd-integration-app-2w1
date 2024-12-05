const BASE_URL = 'http://localhost:8080';
//  const BASE_URL = 'http://2w1-villadelcondor.dynns.com:8080';


export const environment = {
  production: true,
  services: {
    accesses: `http://localhost:8090`,
    addresses: `${BASE_URL}/addresses`,
    complaints: `${BASE_URL}/complaints`,
    contacts: `${BASE_URL}/contacts`,
    employees: `${BASE_URL}/employees`,
    expenseGeneration: `${BASE_URL}/expense-generation`,
    expensesManager: `${BASE_URL}/expenses-manager`,
    fileManager: `${BASE_URL}/file-manager`,
    inventory: `${BASE_URL}/inventory`,
    mercadoPago: `${BASE_URL}/mercado-pago-service`,
    notifications: `${BASE_URL}/notifications`,
    ownersAndPlots: `${BASE_URL}/owners-and-plots`,
    sanctions: `${BASE_URL}/sanctions`,
    stripeService: `${BASE_URL}/stripe-service`,
    usersAndAddresses: `${BASE_URL}/users-and-addresses`,
  }
};