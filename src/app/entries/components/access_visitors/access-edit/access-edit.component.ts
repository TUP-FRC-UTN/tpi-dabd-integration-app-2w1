import { Component, EventEmitter, OnInit, AfterViewInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';  
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import Swal from 'sweetalert2';
//import { Modal } from 'bootstrap';
import { Router } from '@angular/router';
import { AccessNewUserAllowedDto, AccessNewVehicleDto, AccessUserAllowedInfoDto2,AccessDayOfWeek, AccessFormattedHours } from '../../../models/access-visitors/access-VisitorsModels';

@Component({
  selector: 'access-app-edit',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './access-edit.component.html',
  styleUrl: './access-edit.component.css',
  providers: [DatePipe]  // Add DatePipe to providers
})
export class AccessEditComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  visitors: AccessUserAllowedInfoDto2[] = [];
  additionalVisitors: AccessUserAllowedInfoDto2[] = [];
  availableVisitors: AccessUserAllowedInfoDto2[] = [];
  neighbor_id: Number | null = null;
  table: any = null;
  todayDate: string = '';
  //editModal: Modal | null = null;
  searchTerm: string = '';
  constructor(private datePipe: DatePipe, private router: Router) {}

  // Selected visitor for editing
  selectedVisitor: AccessUserAllowedInfoDto2 = {
    document: '',
    name: '',
    last_name: '',
    email: '',
    authId: '',
    authRange: {
      init_date: new Date(),
      end_date: new Date(),
      allowedDays: [{
        day: '',
        init_hour: [0,0],
        end_hour: [0,0]
      }]
    }
  };
  newVisitorTemplate: Partial<AccessUserAllowedInfoDto2> = {
    document: '',
    name: '',
    last_name: '',
    email: ''
  };
  ngAfterViewInit(): void {
   // this.editModal = new Modal(document.getElementById('editVisitorModal')!);

    $('#tablaEdit tbody').on('click', '.view-more-btn', (event: any) => {
      const index = $(event.currentTarget).data('index');
      const visitor = this.visitors[index];

      this.editVisitor(visitor);
    });
  }

  ngOnInit(): void {

    this.setTodayDate(); 
  }
setTodayDate(): void {
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate  , 'yyyy-MM-dd') || '';  // Formato compatible con el input de tipo date
; 
  } 


  onIDFilterChange($event: FocusEvent) {
    const input = $event.target as HTMLInputElement;
    console.log('el valor cambio:',input.valueAsNumber);
    this.neighbor_id = input.valueAsNumber;
    this.fetchvisitors(); // Fetch new data when ID changes
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
  loadDataIntoTable(): void {
    if ($.fn.dataTable.isDataTable('#tablaEdit')) {
      $('#tablaEdit').DataTable().clear().destroy();
    }
  
    this.table = $('#tablaEdit').DataTable({
      // Configuración básica de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'asc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.visitors, // Fuente de datos
  
      // Definición de columnas
      columns: [
        {
          data: null,
          className: 'align-middle',
          render: (data) => `<div>${data.name} ${data.last_name}</div>`
        },
        {
          data: 'document',
          className: 'align-middle',
          render: (data) => `<div>${data || ''}</div>`
        },
        {
          data: 'email',
          className: 'align-middle',
          render: (data) => `<div>${data || ''}</div>`
        },
        {
          data: 'authRange',
          className: 'align-middle',
          render: (data) => {
            const initDate = data ? 
              this.datePipe.transform(data.init_date, 'dd/MM/yyyy') : '';
            return `<div>${initDate}</div>`;
          }
        },
        {
          data: 'authRange',
          className: 'align-middle',
          render: (data) => {
            const endDate = data ? 
              this.datePipe.transform(data.end_date, 'dd/MM/yyyy') : '';
            return `<div>${endDate}</div>`;
          }
        },
        {
          data: null,
          className: 'align-middle text-center',
          searchable: false,
          render: (data, type, row, meta) => `
            <button class="btn btn-info btn-sm view-more-btn" data-index="${meta.row}">Editar</button>`
        }
      ],
  
      // Personalización del DOM y mensajes
      dom: '<"mb-3"t><"d-flex justify-content-between"lp>',
      language: {
        lengthMenu: `
          <select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron visitantes",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
      }
    });
      this.table.draw();
    
  }

  fetchvisitors(): void {
    const neighbor = this.neighbor_id ? this.neighbor_id : '11';
    this.http.get<any>(`http://localhost:8090/user_Allowed/visitoris/${neighbor}`)
      .subscribe({
        next: (response) => {
          this.visitors = response;
          setTimeout(() => {
            this.loadDataIntoTable();
          }, 0);
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


  
  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
  }
  readonly DAYS_OF_WEEK: AccessDayOfWeek[] = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  ];

  getDayTranslation(day: AccessDayOfWeek): string {
    const translations: Record<AccessDayOfWeek, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return translations[day];
  }
  addNewVisitor(): void {
    const newVisitor: AccessUserAllowedInfoDto2 = {
      ...this.newVisitorTemplate,
      authRange: JSON.parse(JSON.stringify(this.selectedVisitor.authRange))
    } as AccessUserAllowedInfoDto2;
    
    this.additionalVisitors.push(newVisitor);
  }

  removeVisitor(index: number): void {
    this.additionalVisitors.splice(index, 1);
  }

/*   saveAllVisitors(): void {
    
    const allVisitors = [
      this.selectedVisitor,
      ...this.additionalVisitors
    ];

    // Create an array of promises for all the HTTP requests
    const updatePromises = allVisitors.map(visitor => {
      console.log("visitor:",visitor);
      const updatedData: User_AllowedInfoDto2 = {
        document: visitor.document,
        name: visitor.name,
        last_name: visitor.last_name,
        email: visitor.email,
        authId: visitor.authId,
        authRange: visitor.authRange
      };
      
      console.log(updatedData);
      return this.http.put(`http://localhost:8090/user_Allowed/visitor/update`, updatedData).toPromise();
    });

    // Execute all requests and handle results
    Promise.all(updatePromises)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Todos los visitantes han sido actualizados correctamente'
        });
        this.editModal?.hide();
        this.additionalVisitors = [];
        this.fetchvisitors();
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al actualizar algunos visitantes'
        });
      });
  } */

  // Override the existing editVisitor method
  editVisitor(visitor: AccessUserAllowedInfoDto2): void {
    this.selectedVisitor = JSON.parse(JSON.stringify(visitor));
    this.additionalVisitors = []; // Clear any previous additional visitors
    console.log("selectedVisitor:",this.selectedVisitor);

    if (!this.selectedVisitor.authRange ) {
      this.selectedVisitor.authRange = {
        init_date: new Date(),
        end_date: new Date(),
        allowedDays: []
      };
    }

    //this.editModal?.show();
  }
  isDayAllowed(day: AccessDayOfWeek): boolean {
    return this.selectedVisitor.authRange.allowedDays
      .some(allowedDay => allowedDay.day === day.toUpperCase());
  }
  getAllowedDayHours(day: AccessDayOfWeek): AccessFormattedHours {
    const allowedDay = this.selectedVisitor.authRange.allowedDays
      .find(d => d.day === day.toUpperCase());
      
    if (!allowedDay) {
      return { init_hour: '', end_hour: '' };
    }
  
    return {
      init_hour: this.formatTimeArrayToString(allowedDay.init_hour),
      end_hour: this.formatTimeArrayToString(allowedDay.end_hour)
    };
  }
  private formatTimeArrayToString(timeArray: number[]): string {
    if (!timeArray || timeArray.length !== 2) {
      return '';
    }
    
    const hours = timeArray[0].toString().padStart(2, '0');
    const minutes = timeArray[1].toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  // Update all visitors when changing dates or allowed days
  updateAllVisitorsAuthRanges(): void {
    const authRangesCopy = JSON.parse(JSON.stringify(this.selectedVisitor.authRange));
    this.additionalVisitors.forEach(visitor => {
      visitor.authRange = authRangesCopy;
    });
  }

  // Override date change handlers
  onInitDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.selectedVisitor.authRange.init_date = new Date(target.value);
      this.updateAllVisitorsAuthRanges();
    }
  }

  onEndDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.selectedVisitor.authRange.end_date = new Date(target.value + 'T00:00:00');
      this.updateAllVisitorsAuthRanges();
    }
  }
  selectExistingVisitor(visitorDocument: string, index: number): void {
    const selectedVisitor = this.visitors.find(v => v.document === visitorDocument);
    if (selectedVisitor) {
      this.additionalVisitors[index] = {
        ...selectedVisitor,
        authRange: JSON.parse(JSON.stringify(this.selectedVisitor.authRange))
      };
    }
  }

  // Override toggleDay to update all visitors
  toggleDay(day: AccessDayOfWeek): void {
    const allowedDays = this.selectedVisitor.authRange.allowedDays;
    const index = allowedDays.findIndex(d => d.day === day.toUpperCase());
    
    if (index === -1) {
      allowedDays.push({
        day: day.toUpperCase(),
        init_hour: [9, 0],
        end_hour: [17, 0]
      });
    } else {
      allowedDays.splice(index, 1);
    }
    
    this.updateAllVisitorsAuthRanges();
  }
  updateAvailableVisitors(): void {
    // Get all selected documents including the main visitor
    const selectedDocuments = new Set([
      this.selectedVisitor.document,
      ...this.additionalVisitors.map(v => v.document)
    ]);

    // Filter out already selected visitors
    this.availableVisitors = this.visitors.filter(visitor => 
      !selectedDocuments.has(visitor.document)
    );
  }
  getAvailableVisitorsForIndex(currentIndex: number): AccessUserAllowedInfoDto2[] {
    const selectedDocuments = new Set([
      this.selectedVisitor.document,
      ...this.additionalVisitors
        .map((v, index) => index !== currentIndex ? v.document : null)
        .filter(doc => doc !== null && doc !== '')
    ]);

    return this.visitors.filter(visitor => !selectedDocuments.has(visitor.document));
  }

  // Override hour update methods
  updateInitHour(day: AccessDayOfWeek, event: any): void {
    const allowedDay = this.selectedVisitor.authRange.allowedDays
      .find(d => d.day === day.toUpperCase());
    if (allowedDay) {
      const [hours, minutes] = event.target.value.split(':');
      allowedDay.init_hour = [parseInt(hours, 10), parseInt(minutes, 10)];
      this.updateAllVisitorsAuthRanges();
    }
  }

  updateEndHour(day: AccessDayOfWeek, event: any): void {
    const allowedDay = this.selectedVisitor.authRange.allowedDays
      .find(d => d.day === day.toUpperCase());
    if (allowedDay) {
      const [hours, minutes] = event.target.value.split(':');
      allowedDay.end_hour = [parseInt(hours, 10), parseInt(minutes, 10)];
      this.updateAllVisitorsAuthRanges();
    }
  }
  
}
