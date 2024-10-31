import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CreateCategoryDto } from '../models/create-category-dto';
import { ProductCategory } from '../models/product-category';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';

  private readonly CATEGORY_URL: string = `${this.INVENTORY_BASE_URL}category`;
  

  constructor(private client: HttpClient) { }

  getCategorias():Observable<ProductCategory[]> {
    return this.client.get<ProductCategory[]>
    (`${this.CATEGORY_URL}/getAll`);
  }

  postCategory(createCategoryDto:CreateCategoryDto):Observable<any>{
    return this.client.post(this.CATEGORY_URL,createCategoryDto);
  }
}
