export interface Producto {
  id: number;
  product: string;
  modificationType: string;
  date: string; // Cambiado de Date a string
  supplier: string;
  amount: number;
  description: string;
  stockAfterModification?: number; // Stock después de la modificación (opcional)
}

export interface ProductoResponse {
  productos: Producto[];
}