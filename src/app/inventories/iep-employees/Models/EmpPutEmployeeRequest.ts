
export interface EmpPutEmployeeRequest {
    id: number;
    name: string;
    surname: string;
    documentValue: string;
    cuil: string;
    charge: number;
    contractStartTime: string;
    salary: number;
    license: boolean;
    mondayWorkday: boolean;
    tuesdayWorkday: boolean;
    wednesdayWorkday: boolean;
    thursdayWorkday: boolean;
    fridayWorkday: boolean;
    saturdayWorkday: boolean;
    sundayWorkday: boolean;
    startTime: string;
    endTime: string;
    supplierId?: number;
    addressDto: AddressDto; 
    telephoneValue: string;
    emailValue: string;
    userId: number; 
  }
  interface AddressDto {
    street: string;
    numberStreet: number;
    apartment?: string;
    floor?: number;
    postalCode: string;
    city: string;
    locality: string;
  }
