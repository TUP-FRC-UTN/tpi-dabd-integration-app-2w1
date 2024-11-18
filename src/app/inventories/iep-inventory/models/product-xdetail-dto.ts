import { Details } from "./details";

export interface ProductXDetailDto {
    id: number;
    name: string;
    reusable: boolean;
    categoryId: number;
    minQuantityWarning: number;
    stock:number
    discontinued: boolean;
}

export interface ProductXDetailDto2 {
    id:                 number;
    name:               string;
    reusable:           boolean;
    category:           Category;
    minQuantityWarning: number;
    discontinued:       boolean;
    stock:              number;
    description:        string;
    detailProducts:     null;
}

export interface Category {
    categoryId:   number;
    categoryName: string;
}