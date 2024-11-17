
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GetWarehouseMovementRequest } from '../../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../../models/getWarehouseMovementResponse';
import { ProductService } from '../../services/product.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DtoProducto } from '../../models/dto-producto';
import { WarehouseTypePipe } from '../../pipes/warehouse-type.pipe';
import { fromEvent, distinctUntilChanged, debounceTime } from 'rxjs';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { WarehouseMovementByProduct } from '../../models/WarehouseMovementByProduct';
import { NgSelectModule } from '@ng-select/ng-select';

// Definir un tipo para las columnas de filtro
type FilterColumn = 'general' | 'applicant' | 'detailProducts' | 'movement_type';
@Component({
  selector: 'app-iep-warehouse-movement-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './iep-warehouse-movement-search.component.html',
  styleUrls: ['./iep-warehouse-movement-search.component.css']
})
export class IepWarehouseMovementSearchComponent implements AfterViewInit, AfterViewChecked {
  fechaMaxima: string;
  movements: WarehouseMovementByProduct[] = [];
  filteredMovements: WarehouseMovementByProduct[] = [];
  products: DtoProducto[] = [];

  movementTypes = [
    { label: 'Devolución', value: 'RETURN' },
    { label: 'Préstamo', value: 'LOAN' },
    { label: 'Uso', value: 'TO_MAINTENANCE' }
  ];

applyFilter($event: Event) {
}
cleanColumnFilters(): void {
  this.tempFilters.movement_type = [];
  this.tempFilters.general = '';
  this.tempFilters.startDate = null;
  this.tempFilters.endDate = null;
  this.tempFilters.applicant = '';
  this.tempFilters.detailProducts = '';
  this.applyFilters();
}
applyFilters(): void {
  this.filteredMovements = this.movements.filter(movement => {
    // Filtro de texto general
    const generalMatch = !this.tempFilters.general || 
                         Object.values(movement).some(value => {
                           // Convertir el tipo de movimiento a español
                           if (typeof value === 'string' && value === movement.movement_type) {
                             value = this.translateMovementType(value); // Traducir el tipo de movimiento
                           }
                           return value.toString().toLowerCase().includes(this.tempFilters.general.toLowerCase());
                         });
    // Función auxiliar para convertir la fecha de formato dd/MM/yyyy HH:mm a un objeto Date
    const parseDate = (dateString: string): Date => {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    };
    // Filtro por fecha inicio
    const startDateMatch = !this.tempFilters.startDate || 
                           parseDate(movement.dateTime) >= this.tempFilters.startDate;
    // Filtro por fecha fin
    const endDateMatch = !this.tempFilters.endDate || 
                         parseDate(movement.dateTime) <= this.tempFilters.endDate;
    // Filtro por solicitante
    const applicantMatch = !this.tempFilters.applicant || 
                           movement.applicant.toLowerCase().includes(this.tempFilters.applicant.toLowerCase());
    // Filtro por producto
    const detailProductsMatch = !this.tempFilters.detailProducts || 
                                movement.product_name.toLowerCase().includes(this.tempFilters.detailProducts.toLowerCase());
    // Filtro por tipo de movimiento
    const movementTypeMatch = !this.tempFilters.movement_type.length || 
                              this.tempFilters.movement_type.includes(movement.movement_type);
    // Devuelve true solo si todos los filtros coinciden
    return generalMatch && startDateMatch && endDateMatch && applicantMatch && detailProductsMatch && movementTypeMatch;
  });
  this.updateDataTable(this.filteredMovements);
}


applyColumnFilter(value: string): void {
 
  if (!this.tempFilters.movement_type.includes(value)) {
    this.tempFilters.movement_type.push(value); 
  } else {
    const index = this.tempFilters.movement_type.indexOf(value);
    if (index !== -1) {
      this.tempFilters.movement_type.splice(index, 1); 
    }
  }
  this.applyFilters();  
}

onStartDateChange(value: string): void {
  this.tempFilters.startDate = value ? new Date(value) : null;
  this.applyFilters();  
}
onEndDateChange(value: string): void {
  this.tempFilters.endDate = value ? new Date(value) : null;
  this.applyFilters();  
}
  // Objeto para almacenar los filtros temporales
  tempFilters: {
    general: string;
    startDate: Date | null;
    endDate: Date | null;
    applicant: string;
    detailProducts: string;
    movement_type: string[];
  } = {
      general: '',
      startDate: null,
      endDate: null,
      applicant: '',
      detailProducts: '',
      movement_type: []
    };

  ngOnInit() {
    // Cargar los datos con los filtros ya configurados
    this.warehouseMovementService.getWarehouseMovements().subscribe((movements) => {
      console.log(movements);
      this.movements = movements;
      this.filteredMovements = this.movements;
      this.initializeDataTable()
      });
    
  }
 
 
 
 
  @ViewChild('startDateInput') startDateInput!: ElementRef;
  @ViewChild('endDateInput') endDateInput!: ElementRef;
  filtersVisible = false;

  constructor(
    private warehouseMovementService: WarehouseMovementService,
    private productService: ProductService
  ) { 
    const hoy = new Date();
    this.fechaMaxima = hoy.toISOString().split('T')[0];
  }
  ngAfterViewInit() {
    
  }

  selectedMovement: WarehouseMovementByProduct | undefined;
  dataTableInstance: any;
  tableInitialized = false;




  translateMovementType(type: string): string {
    switch (type) {
      case 'RETURN':
        return 'Devolución';
      case 'LOAN':
        return 'Préstamo';
      case 'TO_MAINTENANCE':
        return 'Uso';
      default:
        return type;
    }
  }

  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  private getProductNameById(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : 'Desconocido';
  }
  

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Movimientos', 10, 10);
  
    // Ajustar los datos exportados para que coincidan con la tabla
    const dataToExport = this.movements.map((movement) => [
      new Date(movement.dateTime).toLocaleDateString('es-ES'),  // Fecha
      new Date(movement.dateTime).toLocaleTimeString('es-ES'),  // Hora
      movement.applicant,
      movement.product_name,
      this.translateMovementType(movement.movement_type),
    ]);
  
    // Configuración de la tabla en el PDF
    (doc as any).autoTable({
      head: [['Fecha', 'Hora', 'Solicitante', 'Producto', 'Tipo']],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });
  
    const formattedDate = this.getFormattedDate();
    doc.save(`${formattedDate}_Lista_Movimientos.pdf`);
  }
  

  exportToExcel(): void {

    // Encabezado de la tabla
    const encabezado = [
      ['Listado de Movimientos'], // Título principal
      [], // Espacio en blanco
      ['Fecha', 'Hora', 'Solicitante', 'Producto', 'Tipo', 'Responsable'] // Encabezado de las columnas
    ];
  
    // Mapeo de los datos
    const dataToExport = this.movements.map((movement) => ([
      new Date(movement.dateTime).toLocaleDateString('es-ES'), // Solo la fecha
      new Date(movement.dateTime).toLocaleTimeString('es-ES'), // Solo la hora
      movement.applicant,
      movement.product_name,
      this.translateMovementType(movement.movement_type),
      movement.responsible
    ]));
  
    // Crear la hoja de trabajo con encabezado y los datos
    const worksheet = XLSX.utils.aoa_to_sheet([...encabezado, ...dataToExport]);
    
    // Crear el libro de trabajo y añadir la hoja de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Movimientos');
  
    // Obtener la fecha actual formateada
    const formattedDate = this.getFormattedDate();
    
    // Generar el archivo Excel
    XLSX.writeFile(workbook, `${formattedDate}_Lista_Movimientos.xlsx`);
  }
  
  
  


  ngAfterViewChecked(): void {
    if (this.movements.length > 0 && !this.tableInitialized) {
      this.initializeDataTable();
    }
  }
  initializeDataTable(): void {
    $(document).ready(() => {
      this.dataTableInstance = $('#movementsTable').DataTable({
        data: this.filteredMovements,
        dom:
          '<"mb-3"t>' +                           
          '<"d-flex justify-content-between"lp>', 
        columns: [
          {
            data: 'dateTime',
            title: 'Fecha',
            render: (data: string) => data ? data.substring(0, 10) : ''
          },
          {
            data: 'dateTime',
            title: 'Hora',
            render: (data: string) => data ? data.substring(11) : ''
          },
          {
            data: 'movement_type',
            title: 'Tipo',
            render: (data: string) => {
              let colorClass;
              switch (data) {
                case 'RETURN':
                  return `<span class="badge" style="background-color: #dc3545;">Devolución</span>`;
                case 'LOAN':
                  
                  return `<span class="badge" style="background-color: #ffc107;">Préstamo</span>`;
                case 'TO_MAINTENANCE':
                  
                  return `<span class="badge" style="background-color: #0d6efd;">Uso</span>`;
                default:
                  return data;
              }
            },
          },
          { data: 'applicant', title: 'Solicitante' },
          {
            data: 'product_name',
            title: 'Producto',
            
          },
         // { data: 'responsible', title: 'Responsable' }
        ],
        order: [[0, 'desc']],
        pageLength: 5,
        lengthChange: true,
        searching: false,
        destroy: true,
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ movimientos",
          lengthMenu:
            `<select class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
          emptyTable: "No hay datos disponibles en la tabla",
        }
      });
      this.tableInitialized = true;
    });
  }

  
  updateDataTable(newMovements: WarehouseMovementByProduct[]): void {
    if (this.dataTableInstance) {
      this.dataTableInstance.clear();
      this.dataTableInstance.rows.add(newMovements);
      this.dataTableInstance.draw();
    } else {
      this.initializeDataTable();
    }
  }
 
  
}
