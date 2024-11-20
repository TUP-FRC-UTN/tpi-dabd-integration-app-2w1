
export interface EmpPutEmployeesResponse {
    id: number;
    name: string;
    surname: string;
    documentValue: string;
    documentType: string;
    cuil: string;
    charge: ChargeResponse;
    contractStartTime: number[];
    salary: number;
    active: null | boolean;
    license: boolean;
    mondayWorkday: boolean;
    tuesdayWorkday: boolean;
    wednesdayWorkday: boolean;
    thursdayWorkday: boolean;
    fridayWorkday: boolean;
    saturdayWorkday: boolean;
    sundayWorkday: boolean;
    startTime: number[];  // [hour, minute]
    endTime: number[];   // formato: "HH:mm:ss"
    supplierId: null | number; 
  }
  interface ChargeResponse {
    id: number;
    charge: string;
    description: string;
  }
  
  