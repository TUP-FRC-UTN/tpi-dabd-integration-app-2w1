import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { CreateProductDtoClass } from '../models/create-product-dto-class';
import { DtoProducto } from '../models/dto-producto';
import { ProductCategory } from '../models/product-category';
import { Producto } from '../models/producto';
import { ProductXDetailDto } from '../models/product-xdetail-dto';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';

  private readonly CATEGORY_URL_GET_ALL: string = `${this.INVENTORY_BASE_URL}category/getAll`; // Tomas C

  private readonly PRODUCT_URL: string = `${this.INVENTORY_BASE_URL}product`; // Tomas C
  private readonly PRODUCT_URL_GET: string = `${this.PRODUCT_URL}/get`; // Agus
  private readonly PRODUCT_URL_GET_PDF: string = `${this.PRODUCT_URL}/getPdf`; // Agus
  private readonly PRODUCT_URL_GET_EXCEL: string = `${this.PRODUCT_URL}/getExcel`; // Agus

  private readonly AMOUNT_MODIFICATION_URL: string = `${this.INVENTORY_BASE_URL}amountModification`;
  private readonly AMOUNT_MODIFICATION_URL_GETALL: string = `${this.AMOUNT_MODIFICATION_URL}/getAllModifications`; // Enzo
  private readonly AMOUNT_MODIFICATION_URL_GETALL_PDF: string = `${this.AMOUNT_MODIFICATION_URL}/getAllModificationsPdf`;
  private readonly AMOUNT_MODIFICATION_URL_GETALL_EXCEL: string = `${this.AMOUNT_MODIFICATION_URL}/getAllModificationsExcel`;

  constructor(private http: HttpClient) { }

  // TOMAS C
  getAllCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.CATEGORY_URL_GET_ALL);
  }

  // AGUS
  getDtoProducts(
    category?: number,
    reusable?: boolean,
    minAmount?: number,
    maxAmount?: number,
    name?: string
  ): Observable<DtoProducto[]> {
    let params = new HttpParams();

    if (category !== undefined && category !== 0) {
      params = params.set('category', category);
    }
    if (reusable !== undefined) {
      params = params.set('reusable', reusable);
    }
    if (minAmount !== undefined && minAmount !== 0 && minAmount !== null) {
      params = params.set('minAmount', minAmount.toString());
    }
    if (maxAmount !== undefined && maxAmount !== 0 && maxAmount !== null) {
      params = params.set('maxAmount', maxAmount.toString());
    }
    if (name !== undefined && name !== '') {
      params = params.set('name', name);
    }

    return this.http
      .get<DtoProducto[]>(this.PRODUCT_URL_GET, { params })
      .pipe(delay(1));
  }

  getProductosPdf(): Observable<ArrayBuffer> {
    return this.http.get(this.PRODUCT_URL_GET_PDF, {
      responseType: 'arraybuffer',
    });
  }

  getAllProducts(): Observable<ProductXDetailDto[]> {
    return this.http.get<any[]>(this.PRODUCT_URL + '/getAll');
  }

  // ENZO
  getProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.AMOUNT_MODIFICATION_URL_GETALL).pipe(
      map((data) =>
        data.map((item) => ({
          ...item,
          date: this.convertirFecha(item.date), // Convertir a Date usando una función personalizada
        }))
      )
    );
  }

  // ENZO
  private convertirFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number); // Divide la fecha y convierte a número
    return new Date(anio, mes - 1, dia); // Mes es 0-indexed en JavaScript
  }

  // TOMAS C
  createProduct(dto: CreateProductDtoClass, idUser: number): Observable<any> {
    const url = `${this.PRODUCT_URL}/product`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', idUser.toString());
    const json = JSON.stringify(dto);

    console.log(json);

    return this.http.post<any>(url, json, { headers, params });
  }

  productGet(): Observable<DtoProducto[]> {
    console.log('aa');
    return this.http.get<DtoProducto[]>(this.PRODUCT_URL_GET);
  }

  getPdf(): Observable<ArrayBuffer> {
    return this.http.get(this.AMOUNT_MODIFICATION_URL_GETALL_PDF, {
      responseType: 'arraybuffer',
    });
  }
}
