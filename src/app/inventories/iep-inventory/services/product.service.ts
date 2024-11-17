import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { CreateProductDtoClass } from '../models/create-product-dto-class';
import { DtoProducto } from '../models/dto-producto';
import { ProductCategory } from '../models/product-category';
import { Producto } from '../models/producto';
import { ProductXDetailDto, ProductXDetailDto2 } from '../models/product-xdetail-dto';
import { createProductDTO } from '../models/create-product-dto';
import { UsersMockIdService } from '../../common-services/users-mock-id.service';
import { UpdateProductDto } from '../models/update-product-dto';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';

  private readonly CATEGORY_URL_GET_ALL: string = `${this.INVENTORY_BASE_URL}category`; // Tomas C

  private readonly PRODUCT_URL: string = `${this.INVENTORY_BASE_URL}product`; // Tomas C
  private readonly PRODUCT_URL_GET: string = `${this.PRODUCT_URL}/get`; // Agus
  private readonly PRODUCT_URL_GET_PDF: string = `${this.PRODUCT_URL}/getPdf`; // Agus
  private readonly PRODUCT_URL_GET_EXCEL: string = `${this.PRODUCT_URL}/getExcel`; // Agus

  private readonly AMOUNT_MODIFICATION_URL: string = `${this.INVENTORY_BASE_URL}amountModification`;
  private readonly AMOUNT_MODIFICATION_URL_GETALL: string = `${this.AMOUNT_MODIFICATION_URL}/getAllModifications`; // Enzo
  private readonly AMOUNT_MODIFICATION_URL_GETALL_PDF: string = `${this.AMOUNT_MODIFICATION_URL}/getAllModificationsPdf`;
  private readonly AMOUNT_MODIFICATION_URL_GETALL_EXCEL: string = `${this.AMOUNT_MODIFICATION_URL}/getAllModificationsExcel`;
  private userIdService: UsersMockIdService;

  constructor(private http: HttpClient,
    userIdService:UsersMockIdService
  ) { 
    this.userIdService = userIdService
  }

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

  getProductById(id: number): Observable<CreateProductDtoClass> {
    return this.http.get<CreateProductDtoClass>(`${this.PRODUCT_URL}/${id}`);
  }

  getAllProducts(): Observable<ProductXDetailDto[]> {
    return this.http.get<any[]>(this.PRODUCT_URL);
  }

  getProducts2(): Observable<ProductXDetailDto2[]> {
    return this.http.get<ProductXDetailDto2[]>(this.PRODUCT_URL);
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


  updateProduct(dto: UpdateProductDto): Observable<any> {
    const url = `${this.PRODUCT_URL}/${dto.id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', this.userIdService.getMockId());
    return this.http.put<any>(url, dto, { headers, params });
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
    return this.http.post<any>(url, json, { headers, params });
  }

  productGet(): Observable<DtoProducto[]> {
    return this.http.get<DtoProducto[]>(this.PRODUCT_URL_GET);
  }

  getPdf(): Observable<ArrayBuffer> {
    return this.http.get(this.AMOUNT_MODIFICATION_URL_GETALL_PDF, {
      responseType: 'arraybuffer',
    });
  }

  giveLogicalLow(id: number): Observable<any> {
    const url = `${this.PRODUCT_URL}/${id}/logicalLow`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', this.userIdService.getMockId()).set('id', id.toString());
    return this.http.put<any>(url, {}, { headers, params });
  }

}