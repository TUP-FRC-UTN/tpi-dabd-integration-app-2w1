import { Details } from "./details";

export interface ProductXDetailDto {
    id: number;
    name: string;
    reusable: boolean;
    category_id: number;
    minQuantityWarning: number;
    detail: Details[];
}
