import { Component, EventEmitter ,OnInit, AfterViewInit,ViewEncapsulation , inject  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';  

import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';

import Swal from 'sweetalert2';
import { Movement, UserAllowed } from '../../../services/access_visitors/movement.interface';
import { Router } from '@angular/router';
import { AccessRegisterEmergencyComponent } from "../../access-register-emergency/access-register-emergency.component";
export type VehicleType = 'Car' | 'Motorbike' | 'Truck' | 'Bike' | 'Van' | 'Walk';
@Component({
  selector: 'access-app-daily-fetch',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './access-daily-fetch.component.html',
  styleUrl: './access-daily-fetch.component.css',
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None 
})

export class AccessDailyFetchComponent implements OnInit,AfterViewInit {
  exportButtonsEnabled: boolean = false;
  movements: Movement[] = [];
  table: any ;
  selectedDate: string | null = null;
  todayDate: string = '';
  private http = inject(HttpClient);
  popupAbierto = false;
  searchTerm: string = '';
  private readonly vehicleTranslations: Record<VehicleType, string> = {
    'Car': 'auto',
    'Motorbike': 'moto',
    'Truck': 'camión',
    'Bike': 'bicicleta',
    'Van': 'camioneta',
    'Walk': 'sin vehículo'
  };
  constructor(  private datePipe: DatePipe, private router: Router ) {}
  
  navigateToComponent(event: any) {
    const selectedValue = event.target.value;
    this.router.navigate([selectedValue]);
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {

      $('#fetchTable tbody').on('click', '.view-more-btn', (event: any) => {
        const index = $(event.currentTarget).data('index');
        const selectedMovement = this.movements[index]
        ;
  
        this.viewuser(selectedMovement);
      });
    });
  }
  ngOnInit(): void {
    this.setTodayDate(); 
    this.fetchMovements();
    
  }
  setTodayDate(): void {
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate  , 'yyyy-MM-dd') || '';  
    this.selectedDate = this.todayDate ; 
  } 
  onDateFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;

    if (selectedDate) {
      this.selectedDate = selectedDate;  
      this.fetchMovements(); 
    }
  }
  fetchMovements(): void {
    const fechaParam = this.selectedDate ? this.selectedDate : this.todayDate;  
    this.http.get<any>(`http://localhost:8090/movements_entry/Movements/${fechaParam}`)
      .subscribe({
        next: (response) => {
          this.movements = response;
          console.log('Movimientos obtenidos:', response);
          console.log(this.movements);
          this.updateDataTable();  
          
        },
        error: (error) => {
          Swal.fire({
            icon: 'warning',
            title: 'Error al obtener los ingresos',
            text: 'No hay movimientos para ese dia',

          });
        }
      });
  }
  

  updateDataTable() {
    if ($.fn.dataTable.isDataTable('#fetchTable')) {
      $('#fetchTable').DataTable().destroy();
    }
  
    let table = this.table = ($('#fetchTable') as any).DataTable({
      paging: true,
      ordering: true,
      pageLength: 5,
      lengthChange: true,
      searching: true,
      info: true,
      autoWidth: false,
      order: [1, 'des'],
      lengthMenu: [5, 10, 25, 50],
      responsive: true,
      dom: 'rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"l i> p><"clear">',
      language: {
        lengthMenu: " _MENU_ ",
        zeroRecords: "No se encontraron registros",
        info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "No se encontraron resultados",
        infoFiltered: "(filtrado de *MAX* registros totales)",
        search: "Buscar:",
        emptyTable: "No se encontraron resultados",
      },
      data: this.movements,
      columns: [
        { 
          data: 'movementDatetime',
          className: 'align-middle text-center',
          render: (data: string): string => {
            if (!data) return '';
            const movementDate = new Date(Date.parse(data));
            return movementDate.toLocaleDateString();
          }
        },
        { 
          data: 'movementDatetime',
          className: 'align-middle text-center',
          render: (data: string): string => {
            if (!data) return '';
            const movementDate = new Date(Date.parse(data));
            return movementDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
        },
        { 
          data: 'typeMovement',
          className: 'align-middle text-center',
          render: (data: string | null): string => {
            let color: string, text: string;
            switch (data) {
              case "INGRESO": 
                color = "#28a745"; 
                text = "Ingreso";
                break;
              case "EGRESO": 
                color = "#dc3545"; 
                text = "Egreso";
                break;
              default: 
                color = "#6c757d"; 
                text = data || '';
                break;
            }
            return `
              <div class="d-flex justify-content-center">
                <button type="button" class="btn rounded-pill w-75" 
                  style="background-color: ${color}; color: white; border: none; text-transform: uppercase;">
                  ${text}
                </button>
              </div>`;
          }
        },
        { 
          data: null,
          className: 'align-middle text-center',
          render: (data: Movement): string => 
            `${data.visitorName || ''} ${data.visitorLastName || ''}`
        },
        { 
          data: 'visitorDocument',
          className: 'align-middle text-center'
        },
        { 
          data: 'observations',
          className: 'align-middle text-center'
        },
        { 
          data: null,
          className: 'align-middle text-center',
          render: (data: Movement): string => this.getVehicleTypeTranslation(data)
        },
        {
          data: null,
          className: 'align-middle text-center',
          render: (data: Movement, type: any, row: any, meta: { row: number }): string => 
            `<button class="btn btn-info btn-sm view-more-btn" data-index="${meta.row}">Ver más</button>`
        }
      ],
      drawCallback: function(settings: any): void {
        const table = this;
        setTimeout(function() {
          // Si necesitas algún procesamiento adicional después de que se dibuje la tabla
        }, 0);
      }
    });
  
    if (Array.isArray(this.movements) && this.movements.length > 0) {
      this.exportButtonsEnabled = true;
    } else {
      this.exportButtonsEnabled = false;
    }
    
    table.draw();
  }

  onSearch(event: any) {
    const searchValue = event.target.value;

    //Comprobacion de 3 o mas caracteres (No me gusta pero a Santoro si :c)
    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }

  addViewMoreEventListeners(): void {
    const buttons = document.querySelectorAll('.view-more-btn') as NodeListOf<HTMLButtonElement>;
    
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const index = parseInt(button.getAttribute('data-index') || '0', 10);
        const selectedMovement = this.movements[index];
  
        this.viewuser(selectedMovement);
      });
    });
  }
  printTable(): void {
    const tableElement = document.getElementById('fetchTable') as HTMLTableElement;
    const win = window.open('', '_blank');

    // Comprueba si 'win' es null
    if (win) {
        win.document.write('<html><head><title>Imprimir Tabla</title></head><body>');
        win.document.write(tableElement.outerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    } else {
        
    }
  }
  viewuser(selectedMovement: Movement) {
    
  if (selectedMovement) {
    let vehiculo = '';
    const tipoVehiculo = this.getVehicleTypeTranslation(selectedMovement);
    console.log(selectedMovement.vehiclesDto);
    if (selectedMovement.vehiclesDto != null) {
        vehiculo = `
      <strong>Tipo vehiculo:</strong>${tipoVehiculo}<br> 
      <strong>Patente:</strong> ${selectedMovement.vehiclesDto.plate} <br> 
      <strong>Seguro:</strong> ${selectedMovement.vehiclesDto.insurance}
      `;
    } else {
       vehiculo = 'No posee vehículo';
    }
    
    const userInfo = `
    <strong>Tipo Documento:</strong> ${selectedMovement.visitorDocumentType}<br>
    <strong>Documento:</strong> ${selectedMovement.visitorDocument}<br>
    <strong>Nombre:</strong> ${selectedMovement.visitorName}<br>
    <strong>Apellido:</strong> ${selectedMovement.visitorLastName}<br>

    <strong>Vehículo</strong> <br>${vehiculo}<br>
  `;
    Swal.fire({
        title: 'Información del Usuario',
        html: userInfo,
        icon: 'info',
        confirmButtonText: 'Cerrar'
    });
} else {
    console.error('Usuario seleccionado no encontrado');
}

  }
  closePopup() {
    this.popupAbierto = false;}
    
    
  
    getVehicleTypeTranslation(data: Movement): string {
      if (!data.vehiclesDto || !data.vehiclesDto.vehicleType?.description) {
        return 'sin vehículo';
      }
      
      const vehicleType = data.vehiclesDto.vehicleType.description as VehicleType;
      return this.vehicleTranslations[vehicleType] || vehicleType;
    }
}
