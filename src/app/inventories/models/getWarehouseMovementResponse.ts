export interface WarehouseMovementDetailProduct {
    id: number;
    productId: number;
    supplierName: string;
    state: string;
    description: string;
    price: number;
  }
  
  export interface WarehouseMovement {
    id: number;
    date: Date; 
    applicant: string;
    responsible: string;
    detailProducts: WarehouseMovementDetailProduct[];
    movement_type: string;
    employee_id: number;
    reinstatement_datetime: Date; 
  }
  