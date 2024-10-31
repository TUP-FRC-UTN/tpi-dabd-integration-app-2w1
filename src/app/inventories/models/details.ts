export interface Details {
    id: number;
    productId: number;
    supplierName: string;
    state: string;
    description: string;
    price: number;
}

export interface PostDecrement {
    justify: string;
    ids: number[];
}