import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockAumento } from '../models/stock-aumento';
import { Supplier } from '../models/suppliers';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockAumentoService {
  private readonly INVENTORY_BASE_URL: string = 'http://localhost:8081/';

  private readonly AMOUNT_MODIFICATION_URL: string = `${this.INVENTORY_BASE_URL}amountModification`;
  private readonly AMOUNT_MODIFICATION_URL_MODIFY_STOCK: string = `${this.AMOUNT_MODIFICATION_URL}/modify-stock`; // TOMAS

  private readonly SUPPLIERS_URL: string = `${this.INVENTORY_BASE_URL}suppliers`; // Ruta para obtener proveedores // TOMAS

  private readonly PRODUCT_URL: string = `${this.INVENTORY_BASE_URL}product`;
  private readonly PRODUCT_URL_GET_ALL: string = `${this.PRODUCT_URL}/getAll`; // URL de los productos // SANTI

  idProduct: number = 0;
  constructor(private http: HttpClient) { }

  // Método para modificar stock  // TOMAS
  modifyStock(stockData: StockAumento): Observable<string> {
    return this.http.post(
      this.AMOUNT_MODIFICATION_URL_MODIFY_STOCK,
      stockData,
      { responseType: 'text' }
    );
  }

  private productNameSource = new BehaviorSubject<string>(''); // Nombre inicial vacío
  productName$ = this.productNameSource.asObservable();

  setProductName(name: string) {
    this.productNameSource.next(name); // Actualiza el nombre del producto
  }

  getModifications(){
    return this.http.get<any[]>(this.AMOUNT_MODIFICATION_URL+"/getAllModifications");
  }

  // Método para obtener proveedores // TOMAS
  getSuppliers(): Observable<Supplier[]> {
    // Nuevo método para obtener proveedores
    return this.http.get<Supplier[]>(this.SUPPLIERS_URL);
  }

  // Método para obtener todos los productos // SANTI
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.PRODUCT_URL_GET_ALL);
  }

  // Método para obtener un producto específico por su ID // SANTI
  getProductById(): Observable<any> {
    return this.http.get<any>(
      `${this.PRODUCT_URL_GET_ALL}?id=${this.idProduct}`
    );
  }

  setId(id: number) {
    this.idProduct = id;
  }

  getId() {
    return this.idProduct;
  }
}
