import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  NgZone,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AuthRangeInfoDto,
  AccessDocumentTypeDto,
  AccessLastEntryUserAllowedDto,
  AccessLastExitUserAllowedDto,
  AccessNewAuthRangeDto,
  AccessNewMovementExitDto,
  AccessNewMovementsEntryDto,
  AccessNewUserAllowedDto,
  AccessNewVehicleDto,
  AccessUserAllowedInfoDto,
  AccessUserAllowedTypeDto,
} from '../../../models/access-visitors/access-VisitorsModels';
import Swal from 'sweetalert2';
import { VisitorsService } from '../../../services/access_visitors/access-visitors.service';
import { Observable, Subscription } from 'rxjs';
//
import $ from 'jquery';
import 'datatables.net';

import 'datatables.net-bs5';
//import { AlertDirective } from '../alert.directive';
import { InternalSettings } from 'datatables.net';
import { AllowedDaysDto } from '../../../services/access_visitors/movement.interface';
import { RouterModule } from '@angular/router';
import { AccessAutosizeTextareaDirective } from '../../../directives/access-autosize-textarea.directive';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
} from 'ngx-scanner-qrcode';
import jsQR from 'jsqr';
import {
  AccessNewMovementsEntryDtoOwner,
  AccessUserAllowedInfoDtoOwner,
  AccessVehicleOwner,
} from '../../../models/access-visitors/interface/access-owner';
import {
  AccessMovementEntryDto,
  AccessSuppEmpDto,
} from '../../../models/access-employee-allowed/access-user-allowed';
import { AccessVisitorHelperService } from '../../../services/access_visitors/access-visitor-helper.service';
import { AccessOwnerRenterserviceService } from '../../../services/access-owner/access-owner-renterservice.service';
import { AccessUserServiceService } from '../../../services/access-user/access-user-service.service';

@Component({
  selector: 'access-app-visitor-registry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccessAutosizeTextareaDirective,
    RouterModule,
    NgxScannerQrcodeModule,
  ],
  providers: [DatePipe, VisitorsService, CommonModule],
  templateUrl: './access-visitor-registry.component.html',
  styleUrl: './access-visitor-registry.component.css',
})
export class AccessVisitorRegistryComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('qrInput') qrInput!: ElementRef;

  subscription = new Subscription();

  private readonly helperService = inject(AccessVisitorHelperService);
  private readonly visitorService = inject(VisitorsService);
  private readonly ownerService: AccessOwnerRenterserviceService = inject(
    AccessOwnerRenterserviceService
  );
  private observations: string = '';
  constructor(private userService: AccessUserServiceService) {}

  dataTable: any;

  isModalOpen = false;

  private readonly ngZone: NgZone = inject(NgZone);

  modalValid: boolean = false;

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    this.subscription.unsubscribe();
  }
  //PARA ESCANEAR

  isScanning = false;
  scannedResult: string = '';

  //Estado del visitante
  visitorStatus: { [document: string]: string } = {}; // Estado de cada visitante

  uploadQrImage() {
    // Abre el cuadro de diálogo de selección de archivo
    this.qrInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();

      // Procesa la imagen una vez cargada
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // Crea un canvas temporal para extraer los datos de la imagen
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            // Usa jsQR para procesar la imagen
            const qrCode = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (qrCode) {
              // QR encontrado: procesa el contenido escaneado
              this.handleQrScan([{ value: qrCode.data }]);
            } else {
              // QR no válido: muestra una alerta
              Swal.fire({
                icon: 'error',
                title: 'QR Invalido',
                text: 'No se ha podido leer un código QR válido en la imagen.',
              });
            }
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  initializeDataTable(): void {
    this.ngZone.runOutsideAngular(() => {
      this.dataTable = ($('#visitorsTable') as any).DataTable({
        paging: true,
        ordering: true,
        pageLength: 10,
        lengthChange: true,
        searching: true,
        info: true,
        autoWidth: false,
        language: {
          lengthMenu: '_MENU_',
          zeroRecords: 'No se encontraron registros',
          search: 'Buscar:',
          emptyTable: 'No hay datos disponibles',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
        },
        responsive: true,
        dom: '<"top d-flex justify-content-start mb-2"f>rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"li>p><"clear">',
      });

      $('#dt-search-0')
        .off('keyup')
        .on('keyup', () => {
          const searchTerm = $('#dt-search-0').val() as string;

          if (searchTerm.length >= 3) {
            this.dataTable.search(searchTerm).draw();
          } else if (searchTerm.length === 0) {
            this.dataTable.search('').draw(false);
          } else {
            this.dataTable.search('').draw(false);
          }
        });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupModalEventListeners();
      
      // Asegúrate de que el elemento de búsqueda esté disponible
      const searchInput = $('#dt-search-0');
      searchInput.on('keyup', () => {
        const searchTerm = searchInput.val() as string;
        this.dataTable.search(searchTerm).draw();
      });
    });
  }
  

  /* Aca carga los visitantes */
  allVisitorsChecked = false;

  toggleAllVisitors(): void {
    this.allVisitorsChecked = !this.allVisitorsChecked; // Alternar el estado
    this.allEmployersChecked = false;
    this.allOwnersChecked = false;
    if (this.allVisitorsChecked) {
      // Cargar todos los visitantes
      this.loadVisitorsList();
    } else {
      // Vaciar la lista de visitantes
      this.owners = [];
      this.showOwners = [];
      this.employers = [];
      this.showEmployers = [];
      this.visitors = [];
      this.showVisitors = [];
      this.updateDataTable();
    }
  }

  loadAllVisitors(): void {
    const subscriptionAll = this.visitorService.getVisitorsData().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.visitors = data; // Carga todos los visitantes
          this.showVisitors = this.visitors; // Actualiza la lista de visitantes a mostrar
          console.log('Visores en el componente: ', this.visitors);
          this.updateDataTable(); // Actualiza la tabla de visitantes
        });
      },
      error: (error) => {
        console.error('Error al cargar visitantes:', error);
      },
    });
    this.subscription.add(subscriptionAll);
  }

  ////carga empleados
  allEmployersChecked = false;

  toggleAllEmployers(): void {
    this.allEmployersChecked = !this.allEmployersChecked;// Alternar el estado
    this.allVisitorsChecked = false; 
    this.allOwnersChecked = false;
    if (this.allEmployersChecked) {
      // Cargar todos los visitantes
      this.loadEmployersList();
    } else {
      // Vaciar la lista de visitantes
      this.owners = [];
    this.showOwners = [];
    this.employers = [];
    this.showEmployers = [];
    this.visitors = [];
    this.showVisitors = [];
      this.updateDataTable();
    }
  }

  loadAllEmployers(): void {
    const subscriptionAll = this.userService.getSuppEmpData().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.employers = data; // Carga todos los visitantes
          this.showEmployers = this.employers; // Actualiza la lista de visitantes a mostrar
          console.log('Empleados en el componente: ', this.employers);
          this.updateDataTable(); // Actualiza la tabla de visitantes
        });
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
      },
    });
    this.subscription.add(subscriptionAll);
  }
//// carga owners
allOwnersChecked = false;

toggleAllOwner(): void {
  this.allOwnersChecked = !this.allOwnersChecked; // Alternar el estado
  this.allEmployersChecked = false;
  this.allVisitorsChecked = false;
  if (this.allOwnersChecked) {
    // Cargar todos los owners
    this.loadAllOwners();
  } else {
    // Vaciar la lista de owners
    this.owners = [];
    this.showOwners = [];
    this.employers = [];
    this.showEmployers = [];
    this.visitors = [];
    this.showVisitors = [];
    this.updateDataTable();
  }
}
loadAllOwners(): void {
  const subscriptionAll = this.ownerService.getAllOwnerRenterList().subscribe({
    next: (data) => {
      this.ngZone.run(() => {
        this.owners = data; // Carga todos los visitantes
        this.showOwners = this.owners; // Actualiza la lista de visitantes a mostrar
        console.log('owners en el componente: ', this.owners);
        this.updateDataTable(); // Actualiza la tabla de visitantes
      });
    },
    error: (error) => {
      console.error('Error al cargar visitantes:', error);
    },
  });
  this.subscription.add(subscriptionAll);
}


  updateDataTable(): void {
    if (this.dataTable) {
      this.ngZone.runOutsideAngular(() => {
        const formattedData = this.visitors.map((visitor, index) => {
          const status = this.visitorStatus[visitor.document] || 'En espera';

          let statusButton = '';
          let actionButtons = '';

          switch (status) {
            case 'Ingresado':
              statusButton = `<button class="btn btn-success">Ingresado</button>`;
              actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
              break;
            case 'Egresado':
              statusButton = `<button class="btn btn-danger">Egresado</button>`;
              break;
            case 'En espera':
            default:
              statusButton = `<button class="btn btn-warning">En espera</button>`;
              actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
              break;
          }

          return [
            `${visitor.last_name} ${visitor.name}`,
            this.getDocumentType(visitor), // "PASSPORT" se muestre como "Pasaporte"
            `<div class="text-start">${visitor.document}</div>`,
            `<div class="d-flex justify-content-center">
              <div class="dropdown">
                <button class="btn btn-white dropdown-toggle p-0" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                    <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
                </button>
                <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                  <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->

                  <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
                  <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
                </ul>
              </div>
            </div>`,
            `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
            statusButton,
            actionButtons,
          ];
        });

        this.dataTable.clear().rows.add(formattedData).draw();
      });
      this.addEventListeners();
      if(this.allEmployersChecked){
        this.ngZone.runOutsideAngular(() => {
          const formattedData = this.employers.map((visitor, index) => {
            const status = this.visitorStatus[visitor.document] || 'En espera';
  
            let statusButton = '';
            let actionButtons = '';
  
            switch (status) {
              case 'Ingresado':
                statusButton = `<button class="btn btn-success">Ingresado</button>`;
                actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
                break;
              case 'Egresado':
                statusButton = `<button class="btn btn-danger">Egresado</button>`;
                break;
              case 'En espera':
              default:
                statusButton = `<button class="btn btn-warning">En espera</button>`;
                actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
                break;
            }
  
            return [
              `${visitor.last_name} ${visitor.name}`,
              'DNI',
             // this.getDocumentType(visitor), // "PASSPORT" se muestre como "Pasaporte"
              `<div class="text-start">${visitor.document}</div>`,
              `<div class="d-flex justify-content-center">
                <div class="dropdown">
                  <button class="btn btn-white dropdown-toggle p-0" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                      <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                    <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->
  
                    <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
                    <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
                  </ul>
                </div>
              </div>`,
              `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
              statusButton,
              actionButtons,
            ];
          });
  
          this.dataTable.clear().rows.add(formattedData).draw();
        });
        this.addEventListeners();
      } 
      else if(this.allVisitorsChecked){
        this.ngZone.runOutsideAngular(() => {
          const formattedData = this.visitors.map((visitor, index) => {
            const status = this.visitorStatus[visitor.document] || 'En espera';
  
            let statusButton = '';
            let actionButtons = '';
  
            switch (status) {
              case 'Ingresado':
                statusButton = `<button class="btn btn-success">Ingresado</button>`;
                actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
                break;
              case 'Egresado':
                statusButton = `<button class="btn btn-danger">Egresado</button>`;
                break;
              case 'En espera':
              default:
                statusButton = `<button class="btn btn-warning">En espera</button>`;
                actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
                break;
            }
  
            return [
              `${visitor.last_name} ${visitor.name}`,
              this.getDocumentType(visitor), // "PASSPORT" se muestre como "Pasaporte"
              `<div class="text-start">${visitor.document}</div>`,
              `<div class="d-flex justify-content-center">
                <div class="dropdown">
                  <button class="btn btn-white dropdown-toggle p-0" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                      <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                    <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->
  
                    <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
                    <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
                  </ul>
                </div>
              </div>`,
              `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
              statusButton,
              actionButtons,
            ];
          });
  
          this.dataTable.clear().rows.add(formattedData).draw();
        });
        this.addEventListeners();
      }
      else if(this.allOwnersChecked){
        this.ngZone.runOutsideAngular(() => {
          const formattedData = this.owners.map((visitor, index) => {
            const status = this.visitorStatus[visitor.document] || 'En espera';
  
            let statusButton = '';
            let actionButtons = '';
  
            switch (status) {
              case 'Ingresado':
                statusButton = `<button class="btn btn-success">Ingresado</button>`;
                actionButtons = `<button class="btn btn-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</button>`;
                break;
              case 'Egresado':
                statusButton = `<button class="btn btn-danger">Egresado</button>`;
                break;
              case 'En espera':
              default:
                statusButton = `<button class="btn btn-warning">En espera</button>`;
                actionButtons = `<button class="btn btn-info" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</button>`;
                break;
            }
  
            return [
              `${visitor.last_name} ${visitor.name}`,
              'DNI',
            //this.getDocumentType(visitor), // "PASSPORT" se muestre como "Pasaporte"
              `<div class="text-start">${visitor.document}</div>`,
              `<div class="d-flex justify-content-center">
                <div class="dropdown">
                  <button class="btn btn-white dropdown-toggle p-0" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                      <i class="fas fa-ellipsis-v" style="color: black;"></i> <!-- Tres puntos verticales -->
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" data-index="${index}">
                    <li><button class="dropdown-item select-action" data-value="verMas" data-index="${index}">Ver más</button></li> <!-- Opción Ver más -->
  
                    <li><button class="dropdown-item select-action" data-value="ingreso" data-index="${index}">Ingreso</button></li>
                    <li><button class="dropdown-item select-action" data-value="egreso" data-index="${index}">Egreso</button></li>
                  </ul>
                </div>
              </div>`,
              `<textarea class="form-control" name="observations${index}" id="observations${index}"></textarea>`,
              statusButton,
              actionButtons,
            ];
          });
  
          this.dataTable.clear().rows.add(formattedData).draw();
        });
        this.addEventListeners();
      }
    }
  }

  // Actualizar el método addEventListeners para manejar los clicks en el nuevo menú
  addEventListeners(): void {
    const tableBody = document.querySelector('#visitorsTable tbody');

    if (tableBody) {
      tableBody.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        // Manejar el botón "Ver más" en el menú desplegable
        if (target.classList.contains('select-action')) {
          const index = target.getAttribute('data-index');
          const value = target.getAttribute('data-value');

          if (index !== null) {

            let selectedOwner = this.visitors[parseInt(index, 10)];

            if(this.allEmployersChecked){
              selectedOwner = this.employers[parseInt(index, 10)];
            }
            if(this.allVisitorsChecked){
              selectedOwner = this.visitors[parseInt(index, 10)];
            }
            if(this.allOwnersChecked){
              let selectedOwnerr = this.owners[parseInt(index, 10)];
              let selectedOwnerWithNeighborId: AccessUserAllowedInfoDto = {
                ...selectedOwnerr,
                neighbor_id: 0, // Agregar el neighbor_id
              };
              selectedOwner = selectedOwnerWithNeighborId;
            }

            // Aquí se maneja la opción "Ver más"
            if (value === 'verMas') {
              this.MoreInfo(selectedOwner);
            } else {
              // Manejar otras acciones (Ingreso/Egreso)
              const textareaElement = document.getElementById(
                'observations' + index
              ) as HTMLTextAreaElement;

              selectedOwner.observations = textareaElement.value || '';

              if (this.observations===''){
                this.observations=textareaElement.value
              }
              
              const mockEvent = {
                target: { value: value },
              } as unknown as Event;

              this.onSelectionChange(mockEvent, selectedOwner);
            }
          }
        }
      });
    } else {
      console.error('No se encontró el cuerpo de la tabla.');
    }
  }

  onSelectionChange(event: Event, visitor: AccessUserAllowedInfoDto) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    if (selectedValue === 'ingreso') {
      let accessObservable: Observable<boolean>;

      if (visitor.userType.description === 'Owner' || visitor.userType.description === 'Tenant') {
        accessObservable = this.prepareEntryMovement(visitor);
      } else if (visitor.userType.description === 'Emplooyed' || visitor.userType.description === 'Supplier') {
        accessObservable = this.prepareEntryMovementEmp(visitor);
      } else {
        accessObservable = this.visitorService.RegisterAccess(visitor);
      }

      if (accessObservable) {
        const sub = accessObservable.subscribe({
          next: (success) => {
            if (success) {
              console.log('Se registró el Ingreso correctamente');
              this.updateVisitorStatus(visitor, 'ingreso');
              this.updateDataTable();
            } else {
              console.log('Falló al registrar ingreso');
            }
          },
          error: (error) => {
            console.error('Error al registrar ingreso:', error);
          }
        });
        this.subscription.add(sub);
      }

    } else if (selectedValue === 'egreso') {

      let exitObservable: Observable<boolean>;

      if (visitor.userType.description === 'Owner' || visitor.userType.description === 'Tenant') {
        exitObservable = this.prepareExitMovement(visitor);
        

      } else if (visitor.userType.description === 'Emplooyed' || visitor.userType.description === 'Supplier') {
        exitObservable = this.prepareExitMovementEmp(visitor);

      } else {
        exitObservable = this.visitorService.RegisterExit(visitor);
        
      }

      if (exitObservable) {
        const sub = exitObservable.subscribe({
          next: (success) => {
            if (success) {
              console.log('Se registró el Egreso correctamente');
              this.updateVisitorStatus(visitor, 'egreso');
              this.updateDataTable();
            } else {
              console.log('Falló al registrar egreso');
            }
          },
          error: (error) => {
            console.error('Error al registrar egreso:', error);
          }
        });
        this.subscription.add(sub);
      }

    } else {
      this.visitorStatus[visitor.document] = 'En espera';
    }

    selectElement.value = '';
}

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    //DATOS
    /*  Comentado para que no cargue de entrada los datos*/
    this.loadVisitorsList();
    this.loadOwnerRenter();
    this.loadDataEmp();
  }

  loadVisitorsList() {
    const subscriptionAll = this.visitorService.getVisitorsData().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.visitors = data;
          this.showVisitors = this.visitors;
          //console.log("data en el component: ", data);
          console.log('visitors en el component: ', this.visitors);
          this.updateDataTable();
        });
      },
    });
    this.subscription.add(subscriptionAll);
  }
  loadEmployersList() {
    const subscriptionAll = this.userService.getSuppEmpData().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.employers = data;
          this.showEmployers = this.employers;
          //console.log("data en el component: ", data);
          console.log('empleados en el component: ', this.employers);
          this.updateDataTable();
        });
      },
    });
    this.subscription.add(subscriptionAll);
  }
  loadOwnerList() {
    const subscriptionAll = this.ownerService.getAllOwnerRenterList().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.owners = data;
          this.showOwners = this.owners;
          //console.log("data en el component: ", data);
          console.log('owners en el component: ', this.visitors);
          this.updateDataTable();
        });
      },
    });
    this.subscription.add(subscriptionAll);
  }

 // lista de empleados
 employers: AccessUserAllowedInfoDto[] = [];
 // lista de emplados que se muestran en pantalla
 showEmployers = this.employers;

  // lista de owners
  owners: AccessUserAllowedInfoDtoOwner[] = [];
  // lista de owners que se muestran en pantalla
  showOwners = this.owners;

  
  // lista de Visitors
  visitors: AccessUserAllowedInfoDto[] = [];
  // lista de Visitors que se muestran en pantalla
  showVisitors = this.visitors;

  // datos de búsqueda/filtrado
  parameter: string = '';

  // buscar visitantes por parámetro (Nombre o DNI)
  Search(param: string): void {
    this.showVisitors = this.visitorService.getVisitorByParam(param);
  }

  // mostrar más info de un visitante
  selectedVisitor: AccessUserAllowedInfoDto | null = null; // Información del visitante seleccionado

  getDocumentType(visitor: AccessUserAllowedInfoDto): string {
    return visitor.documentTypeDto?.description === 'PASSPORT'
      ? 'Pasaporte'
      : visitor.documentTypeDto?.description ||
          'DNI';
  }

  getVehicles(visitor: AccessUserAllowedInfoDto): AccessNewVehicleDto[] {
    return visitor.vehicles || []; // Devuelve la lista de vehículos o un array vacío
  }

  hasVehicles(visitor: AccessUserAllowedInfoDto): boolean {
    return visitor.vehicles && visitor.vehicles.length > 0; // Verifica si hay vehículos
  }

  // Método para abrir el modal y establecer el visitante seleccionado
  MoreInfo(visitor: AccessUserAllowedInfoDto) {
    this.selectedVisitor = visitor; // Guardar el visitante seleccionado
    this.openModal(); // Abrir el modal
  }


  // Función para actualizar el estado del visitante
  updateVisitorStatus(
    visitor: AccessUserAllowedInfoDto,
    action: 'ingreso' | 'egreso'
  ) {
    if (action === 'ingreso') {
      this.visitorStatus[visitor.document] = 'Ingresado';
    } else if (action === 'egreso') {
      this.visitorStatus[visitor.document] = 'Egresado';
    }

    // Cambia a "En espera" si no egresa después de un tiempo
    //  setTimeout(
    //    () => {
    //      if (this.visitorStatus[visitor.document] === 'Ingresado') {
    //        this.visitorStatus[visitor.document] = 'En espera';
    //      }
    //    } /* tiempo en ms */
    //  );
  }

  openModal(): void {
    this.isModalOpen = true; // Abre el modal
  }

  closeModal(): void {
    this.isModalOpen = false; // Cierra el modal
    this.stopScanner(); // Detiene el escáner cuando se cierra
  }

  // Datos de escaneo
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR() {
    this.isScanning = true; // Activar el escáner
    this.startScanner();
  }

  startScanner(): void {
    if (!this.scanner.isStart) {
      this.scanner.start();
    }
  }

  stopScanner(): void {
    if (this.scanner.isStart) {
      this.scanner.stop();
      this.isScanning = false;
    }
  }


  

  handleQrScan(data: any): void {
    const scannedData = data[0]?.value; // Obtiene el valor escaneado
    if (scannedData) {
      console.log('Código QR escaneado:', scannedData);

      // Detener el scanner inmediatamente después de escanear
      this.stopScanner();

      try {
        // Parsear el JSON escaneado
        const visitorData = JSON.parse(scannedData)[0]; // Asumimos que siempre hay un elemento

        // Crear el nuevo visitante sin validar en el backend
        const newVisitor: AccessUserAllowedInfoDto = {
          document: visitorData.document,
          name: visitorData.name,
          last_name: visitorData.lastName,
          email: 'email@example.com', // Asignar un valor por defecto si no se proporciona
          vehicles: [], // Aquí podrías llenar la lista de vehículos si se necesita
          userType: { description: 'Visitante' },
          authRanges: [
            {
              init_date: visitorData.init_date,
              end_date: visitorData.end_date,
              neighbor_id: visitorData.neighborId || 0,
              allowedDays: [
                {
                  day: visitorData.init_hour,
                  init_hour: visitorData.init_hour,
                  end_hour: visitorData.end_hour,
                },
              ],
            },
          ],
          observations: '', // Asigna observaciones si están disponibles
          documentTypeDto: { description: visitorData.documentType || 'DNI' },
          neighbor_id: visitorData.neighborId || 0,
        };

        // Agregar el visitante a la lista y actualizar el DataTable
        this.visitors.push(newVisitor);
        this.updateDataTable(); // Actualiza la tabla de visitantes

        // Cerrar el modal si hay uno abierto
        this.closeModal();
      } catch (error) {
        console.error('Error al parsear el código QR:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar el código QR.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
      }
    } else {
      console.warn('No se encontraron datos en el escaneo.');
    }
  }

  setupModalEventListeners() {
    const modal = document.getElementById('qrScannerModal');
    modal?.addEventListener('shown.bs.modal', () => {
      this.startScanner();
    });
    modal?.addEventListener('hidden.bs.modal', () => {
      this.stopScanner();
    });
  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor() {}

  //owner
  doument: AccessDocumentTypeDto = {
    description: 'DNI',
  };
  movement: AccessNewMovementsEntryDtoOwner = {
    movementDatetime: new Date(),
    observations: '',
    newUserAllowedDto: {
      name: '',
      last_name: '',
      document: '',
      user_allowed_Type: {
        description: '',
      },
      documentType: this.doument,
      email: '',
    },
    authRangesDto: {
      neighbor_id: 0,
      init_date: new Date(),
      end_date: new Date(),
      allowedDaysDtos: [],
    },
  };
  vehiclee: AccessVehicleOwner = {
    plate: '',
    insurance: '',
    vehicle_Type: {
      description: '',
    },
  };
  loadOwnerRenter() {
    const subscriptionAll = this.ownerService
      .getAllOwnerRenterList()
      .subscribe({
        next: (ownerList: AccessUserAllowedInfoDtoOwner[]) => {
          this.ngZone.run(() => {
            ownerList.forEach((owner) => {
              this.visitors.push({
                document: owner.document,
                name: owner.name,
                userType: owner.userType,
                last_name: owner.last_name,
                documentTypeDto: owner.documentTypeDto,
                authRanges: owner.authRanges,
                email: owner.email,
                vehicles: owner.vehicles,
                neighbor_id: 0,
              });
            });

            console.log('Loaded owner/renter list:', this.visitors);
            this.updateDataTable();
          });
        },
      });
    this.subscription.add(subscriptionAll);
  }

  //quedo obsoleto pq lo q antes se verificaba aca, ahora se hace en el back
  RegisterAccessOwner(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

    return this.prepareEntryMovement(visitor);

  }

  // registra el ingreso de un VECINO (propietario o inquilino)
  private prepareEntryMovement(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        // Preparar datos del movimiento
        const vehicless = visitor.vehicles?.length > 0 ? visitor.vehicles[0] : undefined;
        const firstRange = visitor.authRanges[0];
        const now = new Date();
  
        // Construir objeto de movimiento
        this.movement = {
          movementDatetime: now,
          authRangesDto: {
            neighbor_id: firstRange.neighbor_id,
            init_date: new Date(firstRange.init_date),
            end_date: new Date(firstRange.end_date),
            allowedDaysDtos: firstRange.allowedDays || [],
          },
          observations: this.observations,
          newUserAllowedDto: {
            name: visitor.name,
            last_name: visitor.last_name,
            document: visitor.document,
            email: visitor.email,
            user_allowed_Type: visitor.userType,
            documentType: this.doument,
            vehicle: vehicless,
          }
        };
  
        console.log('Observaciones:', this.movement.observations);
  
        // Mostrar diálogo de confirmación
        Swal.fire({
          title: 'Confirmar Ingreso',
          text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            // Realizar el registro solo si se confirma
            this.ownerService.registerOwnerRenterEntry(this.movement)
              .subscribe({
                next: (response) => {
                  console.log('Ingreso registrado con éxito:', response);
                  Swal.fire({
                    title: 'Registro Exitoso',
                    text: 'Registro de ingreso exitoso.',
                    icon: 'success',
                    confirmButtonText: 'Cerrar',
                  })
                  .then(() => {
                    observer.next(true);
                    observer.complete();
                  });
                },
                error: (err) => {
                  console.error('Error al registrar la entrada:', err);
                  if (err.status !== 409) {
                    Swal.fire({
                      title: 'Error',
                      text: 'Error al cargar los datos. Intenta nuevamente.',
                      icon: 'error',
                      confirmButtonText: 'Cerrar',
                    }).then(() => {
                      observer.next(false);
                      observer.complete();
                    });
                  } else {
                    Swal.fire({
                      title: 'El Vecino tiene un Ingreso previo!',
                      text: 'El Vecino debe egresar antes de poder volver a entrar',
                      icon: 'error',
                      confirmButtonText: 'Cerrar',
                    }).then(() => {
                      observer.next(false);
                      observer.complete();
                    });
                  }
                }
              });
          } else {
            // Si se cancela la confirmación
            observer.next(false);
            observer.complete();
          }
        }).catch(error => {
          console.error('Error en el diálogo de confirmación:', error);
          observer.error(error);
        });
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
      }
    });
  }
RegisterExitOwner(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

  //     const now = new Date();

  //   this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
  //     next: (lastEntryResponse) => {
  //       const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
  //       const lastEntryDateTime = this.helperService.processDate(
  //         lastEntry.movementDatetime
  //       );

  //       if (!lastEntryDateTime || lastEntryDateTime > now) {
  //         Swal.fire({
  //           title: 'Error',
  //           text: 'No puede salir sin haber ingresado previamente.',
  //           icon: 'error',
  //           confirmButtonText: 'Cerrar',
  //         });
  //         observer.next(false);
  //         observer.complete();
  //         return;
  //       }

  //       this.visitorService.getVisitorLastExit(visitor.document).subscribe({
  //         next: (lastExitResponse) => {
  //           const lastExit: LastExitUserAllowedDto = lastExitResponse;
  //           const lastExitDateTime =
  //             this.helperService.processDate(lastExit.movementDatetime) ||
  //             new Date(0);

  //           // Permitir egreso si es el primer egreso o si la última entrada es posterior a la última salida
  //           if (lastEntryDateTime > lastExitDateTime || lastExit.firstExit) {
  //             console.log('Egreso permitido');
              return this.prepareExitMovement(visitor);
              
              //.subscribe({
  //               next: (response) => {
  //                 observer.next(response);
  //                 observer.complete();
  //               },
  //               error: (err) => {
  //                 observer.next(false);
  //                 observer.complete();
  //               },
  //             });
  
  //           this.subscription.add(sub);

  //           } else {
  //             Swal.fire({
  //               title: 'Error',
  //               text: 'No puede egresar, debe salir primero antes de hacer un nuevo ingreso.',
  //               icon: 'error',
  //               confirmButtonText: 'Cerrar',
  //             });
  //             observer.next(false);
  //             observer.complete();
  //           }
  //         },
  //         error: (error) => {
  //           console.error(error);
  //           Swal.fire({
  //             title: 'Error',
  //             text: 'No se pudo verificar el último egreso.',
  //             icon: 'error',
  //             confirmButtonText: 'Cerrar',
  //           });
  //           observer.next(false);
  //           observer.complete();
  //         },
  //       });
  //     },
  //     error: (error) => {
  //       console.error(error);
  //       Swal.fire({
  //         title: 'Error',
  //         text: 'No se pudo verificar el último ingreso.',
  //         icon: 'error',
  //         confirmButtonText: 'Cerrar',
  //       });
  //       observer.next(false);
  //       observer.complete();
  //     },
  //   });

  }
  
  private prepareExitMovement(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

    return new Observable<boolean>((observer) => {

      const vehicless =
      visitor.vehicles && visitor.vehicles.length > 0
        ? visitor.vehicles[0]
        : undefined;
      const now = new Date();
      this.movement.movementDatetime = now;
      const firstRange = visitor.authRanges[0];
      this.movement.authRangesDto = {
        neighbor_id: firstRange.neighbor_id,
        init_date: new Date(firstRange.init_date),
        end_date: new Date(firstRange.end_date),
        allowedDaysDtos: firstRange.allowedDays || [],
      };
      this.movement.observations = this.observations;
      this.movement.newUserAllowedDto = {
        name: visitor.name,
        last_name: visitor.last_name,
        document: visitor.document,
        email: visitor.email,
        user_allowed_Type: visitor.userType,
        documentType: this.doument,
        vehicle: vehicless,
      };
      Swal.fire({
        title: 'Confirmar Egreso',
        text: `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          const sub = this.ownerService
            .registerExitOwner(this.movement)
            .subscribe({
              next: (response) => {
                console.log('Egreso registrado con éxito:', response);
                Swal.fire({
                  title: 'Registro Exitoso',
                  text: 'Registro de egreso exitoso.',
                  icon: 'success',
                  confirmButtonText: 'Cerrar',
                });
                //return true;
                observer.next(true);
                observer.complete();
              },
              error: (err) => {
                console.error('Error al registrar el egreso:', err);
                if(err.status != 409){
                  Swal.fire({
                    title: 'Error',
                    text: 'Error al cargar los datos. Intenta nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  });
                  //return false;
                  observer.next(false);
                  observer.complete();
                } else {
                  Swal.fire({
                    title: 'El Vecino tiene un egreso previo!',
                    text: 'El Vecino debe ingresar antes de poder volver a salir',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  });
                  //return false;
                  observer.next(false);
                  observer.complete();
                }
              },
            });
          this.subscription.add(sub);
        }

      });

    });
}

  //Empleados
  private userType: AccessUserAllowedTypeDto = {
    description: 'Emplooyed',
  };
  private loadDataEmp(): void {
    this.userService.getSuppEmpData().subscribe({
      next: (ownerList: AccessUserAllowedInfoDtoOwner[]) => {
        this.ngZone.run(() => {
          ownerList.forEach((owner) => {
            this.visitors.push({
              document: owner.document,
              name: owner.name,
              userType: this.userType,
              last_name: owner.last_name,
              documentTypeDto: owner.documentTypeDto,
              authRanges: owner.authRanges,
              email: owner.email,
              vehicles: owner.vehicles,
              neighbor_id: 0,
            });
          });

          console.log('Loaded owner/renter list:', this.visitors);
          this.updateDataTable();
        });
      },
    });
  }
  
  //QUEDO OBSOLETO, LA VERIFICACION QUE SE HACIA ACA, AHORA SE HACE EN EL BACK
  RegisterAccessEmp(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

      // const now = new Date();

      // this.visitorService.getVisitorLastExit(visitor.document).subscribe({
      //   next: (lastExitResponse) => {
      //     const lastExit: LastExitUserAllowedDto = lastExitResponse;
      //     const lastExitDateTime =
      //       this.helperService.processDate(lastExit.movementDatetime) ||
      //       new Date(0);
  
      //     // Si no hay egreso previo o es el primer ingreso, permitir ingreso
      //     if (lastExitDateTime <= now) {
      //       this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
      //         next: (lastEntryResponse) => {
      //           const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
      //           const lastEntryDateTime =
      //             this.helperService.processDate(lastEntry.movementDatetime) ||
      //             new Date(0);
  
                // // Permitir ingreso si no hay ingreso previo o si la última salida es posterior
                // if (
                //   lastEntryDateTime <= lastExitDateTime ||
                //   lastEntry.firstEntry
                // ) {
                //   console.log('Ingreso permitido');

                  return this.prepareEntryMovementEmp(visitor);

                  //.subscribe({
      //               next: (response) => {
      //                 return response;
      //               },
      //               error: (err) => {
      //                 return false;
      //               },
      //             });
      
      //           this.subscription.add(sub);;
      //           } else {
      //             Swal.fire({
      //               title: 'Error',
      //               text: 'No puede ingresar, debe salir primero antes de hacer un nuevo ingreso.',
      //               icon: 'error',
      //               confirmButtonText: 'Cerrar',
      //             });
      //             return false;
      //           }
      //         },
      //         error: (error) => {
      //           console.error(error);
      //           Swal.fire({
      //             title: 'Error',
      //             text: 'No se pudo verificar el último ingreso.',
      //             icon: 'error',
      //             confirmButtonText: 'Cerrar',
      //           });
      //           return false;
      //         },
      //       });
      //     } else {
      //       Swal.fire({
      //         title: 'Error',
      //         text: 'No puede ingresar sin haber salido previamente.',
      //         icon: 'error',
      //         confirmButtonText: 'Cerrar',
      //       });
      //       return false;
      //     }
      //   },
      //   error: (error) => {
      //     console.error(error);
      //     Swal.fire({
      //       title: 'Error',
      //       text: 'No se pudo verificar el último egreso.',
      //       icon: 'error',
      //       confirmButtonText: 'Cerrar',
      //     });
      //     return false;
      //   },
      // });

  }
  
  private prepareEntryMovementEmp(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        // Preparar el objeto de movimiento
        const movementS: AccessMovementEntryDto = {
          description: String(this.observations || ''),
          movementDatetime: new Date().toISOString(),
          vehiclesId: 0,
          document: visitor.document,
        };
  
        // Mostrar diálogo de confirmación
        Swal.fire({
          title: 'Confirmar Ingreso',
          text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            // Realizar el registro solo si se confirma
            const subscription = this.userService.registerEmpSuppEntry(movementS)
              .subscribe({
                next: (response) => {
                  console.log('Ingreso registrado con éxito:', response);
                  Swal.fire({
                    title: 'Registro Exitoso',
                    text: 'Registro de ingreso exitoso.',
                    icon: 'success',
                    confirmButtonText: 'Cerrar',
                  }).then(() => {
                    observer.next(true);
                    observer.complete();
                  });
                },
                error: (err) => {
                  console.error('Error al registrar la entrada:', err);
                  
                  const errorMessage = err.status !== 409 
                    ? {
                        title: 'Error',
                        text: 'Error al cargar los datos. Intenta nuevamente.',
                      }
                    : {
                        title: 'La Persona tiene un Ingreso previo!',
                        text: 'La persona debe egresar antes de poder volver a entrar',
                      };
  
                  Swal.fire({
                    ...errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  }).then(() => {
                    observer.next(false);
                    observer.complete();
                  });
                }
              });
  
            // Agregar la suscripción al gestor de suscripciones
            this.subscription.add(subscription);
            
          } else {
            // Si se cancela la confirmación
            observer.next(false);
            observer.complete();
          }
        }).catch(error => {
          console.error('Error en el diálogo de confirmación:', error);
          observer.error(error);
          observer.complete();
        });
  
      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }
  //QUEDO OBSOLETO, LA VERIFICACION AHORA SE HACE EN EL BACK
   RegisterExitEmp(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

  //   return new Observable<boolean>((observer) => {

  //     const now = new Date();

  //     this.visitorService.getVisitorLastEntry(visitor.document).subscribe({
  //       next: (lastEntryResponse) => {
  //         const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
  //         const lastEntryDateTime = this.helperService.processDate(
  //           lastEntry.movementDatetime
  //         );
  
  //         if (!lastEntryDateTime || lastEntryDateTime > now) {
  //           Swal.fire({
  //             title: 'Error',
  //             text: 'No puede salir sin haber ingresado previamente.',
  //             icon: 'error',
  //             confirmButtonText: 'Cerrar',
  //           });
  //           observer.next(false);
  //           observer.complete();
  //           return;
  //         }
  
  //         this.visitorService.getVisitorLastExit(visitor.document).subscribe({
  //           next: (lastExitResponse) => {
  //             const lastExit: LastExitUserAllowedDto = lastExitResponse;
  //             const lastExitDateTime =
  //               this.helperService.processDate(lastExit.movementDatetime) ||
  //               new Date(0);
  
  //             // Permitir egreso si es el primer egreso o si la última entrada es posterior a la última salida
  //             if (lastEntryDateTime > lastExitDateTime || lastExit.firstExit) {
  //               console.log('Egreso permitido');

                 return this.prepareExitMovementEmp(visitor);

  //                .subscribe({
  //                 next: (response) => {
  //                   observer.next(true);
  //                   observer.complete();
  //                 },
  //                 error: (err) => {
  //                   observer.next(false);
  //                   observer.complete();
  //                 },                
  //               });
  //             } else {
  //               Swal.fire({
  //                 title: 'Error',
  //                 text: 'No puede egresar, debe salir primero antes de hacer un nuevo ingreso.',
  //                 icon: 'error',
  //                 confirmButtonText: 'Cerrar',
  //               });
  //               observer.next(false);
  //               observer.complete();
  //             }
  //           },
  //           error: (error) => {
  //             console.error(error);
  //             Swal.fire({
  //               title: 'Error',
  //               text: 'No se pudo verificar el último egreso.',
  //               icon: 'error',
  //               confirmButtonText: 'Cerrar',
  //             });
  //             observer.next(false);
  //             observer.complete();
  //           },
  //         });
  //       },
  //       error: (error) => {
  //         console.error(error);
  //         Swal.fire({
  //           title: 'Error',
  //           text: 'No se pudo verificar el último ingreso.',
  //           icon: 'error',
  //           confirmButtonText: 'Cerrar',
  //         });
  //         observer.next(false);
  //         observer.complete();
  //       },
  //     });
  //   });

  }
  private prepareExitMovementEmp(visitor: AccessUserAllowedInfoDtoOwner): Observable<boolean> {

    return new Observable<boolean>((observer) => {

      const movementS: AccessMovementEntryDto = {
        description: String(this.observations || ''),
        movementDatetime: new Date().toISOString(),
        vehiclesId: 0,
        document: visitor.document,
      };
  
      Swal.fire({
        title: 'Confirmar Egreso',
        text: `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          const sub = this.userService.registerEmpSuppExit(movementS).subscribe({
            next: (response) => {
              console.log('Egreso registrado con éxito:', response);
              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de egreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              });
              //return true;
              observer.next(true);
              observer.complete(); 
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              if(err.status != 409){
                Swal.fire({
                  title: 'Error',
                  text: 'Error al cargar los datos. Intenta nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
                //return false;
                observer.next(false);
                observer.complete(); 

              } else {
                Swal.fire({
                  title: 'El Visitante tiene un Egreso previo!',
                  text: 'El Visitante debe ingresar antes de poder volver a salir',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                });
                //return false;
                observer.next(false);
                observer.complete(); 
              }
            },
          });
  
          this.subscription.add(sub);
        }

        //return false;
        // observer.next(false);
        // observer.complete(); 
      });
      //return false;
      // observer.next(false);
      // observer.complete(); 
      
    });
    
  }
}
