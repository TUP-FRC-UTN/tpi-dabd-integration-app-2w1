export interface EmpListadoEmpleados {
  id: number; // ID del empleado
  fullName: string; // Nombre completo del empleado
  document: string; // Documento de identidad (DNI o PASSPORT)
  position: string; // Cargo del empleado
  salary: number; // Salario del empleado (en formato de texto)
}

export interface Charge {
  id: number;
  charge: string;
  description: string;
  createdDate: [number, number, number]; // [Año, Mes, Día]
  createdUser: number;
  lastUpdateDate: [number, number, number]; // [Año, Mes, Día]
  lastUpdateUser: number;
}

export interface Employee {
  id: number;
  name: string;
  surname: string;
  documentValue: string;
  documentType: string;
  cuil: string;
  address_id: number;
  contact_id: number;
  charge: Charge;
  contractStartTime: [number, number, number]; // [Año, Mes, Día]
  salary: number;
  healthInsurance: boolean;
  active: boolean;
  license: boolean;
  mondayWorkday: boolean;
  tuesdayWorkday: boolean;
  wednesdayWorkday: boolean;
  thursdayWorkday: boolean;
  fridayWorkday: boolean;
  saturdayWorkday: boolean;
  sundayWorkday: boolean;
  startTime: [number, number]; // [Hora, Minuto]
  endTime: [number, number];   // [Hora, Minuto]
  supplierId: number | null;
}
