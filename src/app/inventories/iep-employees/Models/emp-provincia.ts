export interface Ciudad {
    id: string;
    nombre: string;
  }
  
  export interface Provincia {
    id: number;
    nombre: string;
    ciudades: Ciudad[];
  }
  