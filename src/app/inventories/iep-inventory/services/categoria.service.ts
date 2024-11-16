import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CreateCategoryDto } from '../models/create-category-dto';
import { ProductCategory } from '../models/product-category';
import { PutCategoryDTO } from '../models/putCategoryDTO';
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';

  private readonly CATEGORY_URL: string = `${this.INVENTORY_BASE_URL}category`;
  

  constructor(private client: HttpClient) { }

  getCategorias():Observable<ProductCategory[]> {
    return this.client.get<ProductCategory[]>
    (`${this.CATEGORY_URL}`);
  }

  postCategory(dto:string,idUser: number):Observable<any>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('lastUpdatedUser', idUser.toString())
    .set('category', dto);
    const json = JSON.stringify(dto);
    console.log(json);
    return this.client.post<any>(this.CATEGORY_URL, json, { headers, params }); 
  }

  deleteCategory(id:number,idUser:number):Observable<any>{
    const dto: PutCategoryDTO = {id:id,category:''};
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('lastUpdatedUser', idUser.toString());
    const json = JSON.stringify(dto);
    return this.client.put<any>(this.CATEGORY_URL, json, { headers, params });  
  }

  putCategory(dto:PutCategoryDTO,idUser: number):Observable<any>{  
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('lastUpdatedUser', idUser.toString());
    const json = JSON.stringify(dto);
    return this.client.put<any>(this.CATEGORY_URL, json, { headers, params });  
  }
}
