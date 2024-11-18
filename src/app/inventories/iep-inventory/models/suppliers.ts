export interface Supplier {
    id: number;
    name: string;
    cuit?:string;
    address: string;
    supplierType: string;
    description: string | null;
    email: string;
    phoneNumber: string;
    discontinued:boolean;
  }
  