export interface createProductDTO {
    name: string;
    reusable: boolean;
    min_amount_warning: number;
    amount: number;
    supplier_id: number;
    description: string;
    unitPrice: number;
    category_id: number;
}