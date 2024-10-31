import { AddressDto } from "./emp-post-employee-dto";

export class EmpPutEmployees {
  id: number | undefined; // Este campo es necesario para identificar al empleado a modificar
  name: string | undefined;
  surname: string | undefined;
  documenValue: string | undefined; // Cambié a string para que coincida con tu entity
  cuil: string | undefined;
  charge: number | undefined;
  contractStartTime?: Date | undefined;
  salary: number | undefined;
  //active: boolean | undefined; // Agregado para reflejar si el empleado está activo
  license: boolean | undefined;
  mondayWorkday: boolean | undefined;
  tuesdayWorkday: boolean | undefined;
  wednesdayWorkday: boolean | undefined;
  thursdayWorkday: boolean | undefined;
  fridayWorkday: boolean | undefined;
  saturdayWorkday: boolean | undefined;
  sundayWorkday: boolean | undefined;
  startTime: string | undefined; 
  endTime: string | undefined;   
  supplierId?: number | undefined;
  emailValue: string | undefined;
  telephoneValue: number | undefined;
  adressDto: AddressDto | undefined; // Incluye el dto de dirección
  //contactId: number | undefined; // Agregado para el ID de contacto
}
