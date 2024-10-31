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

@Component({
  selector: 'access-app-daily-fetch',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, AccessRegisterEmergencyComponent],
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
  constructor(  private datePipe: DatePipe, private router: Router ) {}
  
  navigateToComponent(event: any) {
    const selectedValue = event.target.value;
    this.router.navigate([selectedValue]);
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {

      $('#tablaconsulta tbody').on('click', '.view-more-btn', (event: any) => {
        const index = $(event.currentTarget).data('index');
        const selectedMovement = this.movements[index]
        ;
  
        this.viewuser(selectedMovement);
      });
    });
  }
  ngOnInit(): void {
    this.setTodayDate(); 
    
     // Llamada a tu servicio que obtiene los movimientos
  }
  setTodayDate(): void {
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate  , 'yyyy-MM-dd') || '';  // Formato compatible con el input de tipo date
    this.selectedDate = this.todayDate ; 
  } 
  onDateFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;

    if (selectedDate) {
      this.selectedDate = selectedDate;  // Almacenar la fecha seleccionada
      this.fetchMovements();  // Volver a obtener los movimientos con la nueva fecha
    }
  }
  fetchMovements(): void {
    const fechaParam = this.selectedDate ? this.selectedDate : '2024-04-03';  // Default en caso de que no haya selección
    this.http.get<any>(`http://localhost:8090/movements_entry/Movements/${fechaParam}`)
      .subscribe({
        next: (response) => {
          this.movements = response;
          console.log('Movimientos obtenidos:', response);
          console.log(this.movements);
          this.updateDataTable();  // Cargar los datos en la tabla
          
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
  initializeDataTable(): void {
    this.table = ($('#tablaconsulta') as any).DataTable({
        paging: true,
        ordering: true,
        pageLength: 10,
        lengthChange: true,
        searching: true,
        info: true,
        autoWidth: false,
        language: {
            lengthMenu: "Mostrar _MENU_ registros",
            zeroRecords: "No se encontraron resultados",
            search: "Buscar:",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros en total)",
            paginate: {
                first: "Primero",
                last: "Último",
                next: ">",
                previous: "<"
            }
        },
        responsive: true,
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
            '<"row"<"col-sm-12"tr>>' +
            '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        columnDefs: [
            { targets: '_all', className: 'text-center' } // Alinear todo al centro
        ],
        createdRow: (row: Node, data: any, dataIndex: number) => {
            // Aquí puedes aplicar estilos a las filas
            if (data.typeMovement === 'INGRESO') {
                $(row).addClass('table-success'); // Resaltar filas de ingreso
            } else if (data.typeMovement === 'EGRESO') {
                $(row).addClass('table-danger'); // Resaltar filas de egreso
            }
        }
    });
}

  updateDataTable() {
    if ($.fn.dataTable.isDataTable('#tablaconsulta')) {
      $('#tablaconsulta').DataTable().destroy();
    }
  
    let table = this.table = $('#tablaconsulta').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [6, 'asc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      columnDefs: [
        { targets: '_all', className: 'text-center' }
      ],
      data: this.movements,
      columns: [
        { 
          data: 'typeMovement',
          className: 'align-middle text-center',
          render: (data: any) => {
            let color;
            switch (data) {
              case "INGRESO": color = "#28a745"; break;
              case "EGRESO": color = "#dc3545"; break;
              default: color = "#6c757d"; break;
            }
            return `<button class="btn border rounded-pill w-75" 
              style="background-color: ${color}; color: white;">
              ${data || 'Ingreso'}</button>`;
          }
        },
        { 
          data: null,
          className: 'align-middle text-center',
          render: (data) => `${data.visitorName || ''} ${data.visitorLastName || ''}`
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
          render: (data) => data.vehiclesDto ? data.vehiclesDto.vehicleType?.description : 'ingreso sin vehiculo'
        },
        { 
          data: 'movementDatetime',
          className: 'align-middle text-center',
          render: (data) => {
            if (!data) return '';
            const movementDate = new Date(Date.parse(data));
            return movementDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          }
        },
        { 
          data: 'movementDatetime',
          className: 'align-middle text-center',
          render: (data) => {
            if (!data) return '';
            const movementDate = new Date(Date.parse(data));
            return movementDate.toLocaleDateString();
          }
        },
        {
          data: null,
          className: 'align-middle text-center',
          render: (data, type, row, meta) => 
            `<button class="btn btn-info btn-sm view-more-btn" data-index="${meta.row}">Ver más</button>`
        }
      ],
      language: {
        lengthMenu: "Mostrar _MENU_ registros",
        search: "Buscar:",
        zeroRecords: "No se encontraron resultados",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 a 0 de 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros en total)",
        paginate: {
          first: "Primero",
          last: "Último",
          next: ">",
          previous: "<"
        }
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
    const tableElement = document.getElementById('tablaconsulta') as HTMLTableElement;
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
    console.log(selectedMovement.vehiclesDto);
    if (selectedMovement.vehiclesDto != null) {
        vehiculo = `
      <strong>Tipo vehiculo:</strong>${selectedMovement.vehiclesDto.vehicleType?.description}<br> 
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
    
  
}
