import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../models/category';
import { UserService } from '../userServices/user.service';
import { environment } from '../../../common/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http:HttpClient, private userService :UserService) {}

  private url=environment.services.expensesManager

  getCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url+'/categories/all');
  }

  add(expenseCategory: Category): Observable<Category> {
    console.log(expenseCategory);
    const url = `${this.url}/categories/postCategory?description=${expenseCategory.description}&userId=${this.userService.getUserId()}`;
    return this.http.post<Category>(url, expenseCategory);
  }
updateCategory(category: Category): Observable<any> {
  const url = `${this.url}/categories/putById?id=${category.id}&description=${category.description}&enabled=${category.state}&userId=${this.userService.getUserId()}`;
  return this.http.put(url, null);
}

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.url}/categories/getById/${id}`);
  }

}
