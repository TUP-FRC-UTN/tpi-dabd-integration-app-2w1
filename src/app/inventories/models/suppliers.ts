export interface Supplier {
    id: number;
    name: string;
    healthInsurance: string;
    authorized: boolean;
    address: string;
    supplierType: string;
    description: string | null;
    email: string;
    phoneNumber: string;
    discontinued:boolean;
  }
  