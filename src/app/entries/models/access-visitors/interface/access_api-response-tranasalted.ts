export const translations: { [key: string]: string } = {
    "The vehicle exist": "El vehículo ya existe.",
    "User not found": "Usuario no encontrado.",
    "API error": "Hubo un error en la API.",
    "Vehicle added successfully": "Vehículo añadido con éxito.",
    "Vehicle not found": "Vehículo no encontrado.",
    "Invalid document": "Documento inválido.",
  };
  export function translateMessage(message: string): string {
    return translations[message] || message; // Si no se encuentra, devuelve el mensaje original
  }