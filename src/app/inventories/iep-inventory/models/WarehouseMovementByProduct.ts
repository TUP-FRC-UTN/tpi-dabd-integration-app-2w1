export interface WarehouseMovementByProduct{
    id: number;
    dateTime: string;
    applicant: string;
    responsible: string;
    movement_type: string;
    employee_id: number;
    product_name: string;
  }