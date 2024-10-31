import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component,OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StockAumentoService } from '../../services/stock-aumento.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Supplier } from '../../models/suppliers';

@Component({
  selector: 'app-iep-stock-increase',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './iep-stock-increase.component.html',
  styleUrls: ['./iep-stock-increase.component.css']
})
export class IepStockIncreaseComponent implements OnInit {
  stockForm!: FormGroup;
  suppliers: Supplier[] = [];
  productName: string = ''; // Para almacenar y mostrar el nombre del producto
  message: string = '';
  error: boolean = false;
  productId: number = 0; // ID del producto que definirás directamente en el código

  constructor(
    private formBuilder: FormBuilder,
    private stockService: StockAumentoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productId = this.stockService.getId();
    this.initializeForm();
    this.loadSuppliers();  // Cargar proveedores al iniciar
    this.loadProductById(this.productId); // Cargar el producto por su ID que defines en el código
  }
  

  initializeForm() {
    this.stockForm = this.formBuilder.group({
      productId: [this.productId, Validators.required],
      supplierId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      justification: ['', Validators.required],
      unitPrice: ['', [Validators.required, Validators.min(1)]] 
    });
  }

  // Método para cargar proveedores
  loadSuppliers() {
    this.stockService.getSuppliers().subscribe(
      (data: Supplier[]) => {
        this.suppliers = data;
      },
      error => {
        console.error('Error al cargar proveedores', error);
      }
    );
  }

  // Método para cargar el producto por su ID
  loadProductById(productId: number) {
    this.stockService.getProducts().subscribe(
      (products: any[]) => {
        const selectedProduct = products.find(p => p.id === productId); // Buscar el producto por ID
        if (selectedProduct) {
          this.productName = selectedProduct.name;  // Asignar el nombre del producto correctamente
        } else {
          console.error('Producto no encontrado');
        }
      },
      error => {
        console.error('Error al cargar productos', error);
      }
    );
  }
  
  onSubmit() {
    if (this.stockForm.valid) {
      this.stockService.modifyStock(this.stockForm.value).subscribe(
        response => {
          this.message = response;
          this.error = false;
          this.stockForm.reset();
          this.initializeForm();

          setTimeout(() => {
            this.message = '';
          }, 5000);
        },
        error => {
          this.message = `Error al modificar el stock: ${error.status} - ${error.message}`;
          this.error = true;

          setTimeout(() => {
            this.message = '';
          }, 5000);
        }
      );
    }
  }

  goBack() {
    window.history.back();
  }  
}