import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  NgZone,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import {
  AccessDocumentTypeDto,
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
import { RouterModule } from '@angular/router';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
} from 'ngx-scanner-qrcode';
import {
  AccessNewMovementsEntryDtoOwner,
  AccessUserAllowedInfoDtoOwner,
  AccessVehicleOwner,
  MovementBodyEmployee,
} from '../../../models/access-visitors/interface/access-owner';
import {
  AccessMovementEntryDto,
} from '../../../models/access-employee-allowed/access-user-allowed';
import { AccessVisitorHelperService } from '../../../services/access_visitors/access-visitor-helper.service';
import { AccessOwnerRenterserviceService } from '../../../services/access-owner/access-owner-renterservice.service';
import { AccessUserServiceService } from '../../../services/access-user/access-user-service.service';
import { AccessEmergenciesService } from '../../../services/access-emergencies/access-emergencies.service';
import { AccessNewEmergencyDto } from '../../../models/access-emergencies/access-new-emergecy-dto';
import { AccessRegistryUpdateService } from '../../../services/access-registry-update/access-registry-update.service';
declare var bootstrap: any;
import { AccesesVisitorsTempComponent } from '../acceses-visitors-temp/acceses-visitors-temp.component';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import { AccessUserReportService } from '../../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import { User } from '../../../models/access-report/User';

@Component({
  selector: 'access-app-visitor-registry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxScannerQrcodeModule,
    NgSelectModule,
    AccesesVisitorsTempComponent
  ],
  providers: [DatePipe, VisitorsService, CommonModule],
  templateUrl: './access-visitor-registry.component.html',
  styleUrl: './access-visitor-registry.component.css',
})
export class AccessVisitorRegistryComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('qrInput') qrInput!: ElementRef;

  subscription = new Subscription();

  protected readonly helperService = inject(AccessVisitorHelperService);
  private readonly visitorService = inject(VisitorsService);
  private readonly ownerService: AccessOwnerRenterserviceService = inject(AccessOwnerRenterserviceService);
  private readonly registryUpdateService = inject(AccessRegistryUpdateService);
  private observations: string = '';
  private userId: number = 0;
  constructor(private userService: AccessUserServiceService, private emergencyService: AccessEmergenciesService, private authService: AuthService) { }
  private readonly accessUserReportService = inject(AccessUserReportService)
  selectedVehiclePlate: string = '';
  dataTable: any;
  plateVehicle: string = '';
  showModal = false;
  visitorDocument: string = '';
  private readonly ngZone: NgZone = inject(NgZone);
  userAllowedGetAll: AccessUserAllowedInfoDto[] = [];
  modalValid: boolean = false;

  listUser: User[] = []

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {

    const registryUpdated = this.registryUpdateService.getObservable().subscribe({
      next: v => {
        //lo siguiente carga a TODOS en la lista "comun" (donde estan todos los userAllowed)
        const sub = this.loadUsersAllowedData().subscribe({
          next: () => {
            this.filteredAllPeopleAllowed = this.allPeopleAllowed;
            this.userAllowedModal();
          },
          error: (err) => {
            console.error(err);
          }
        });
        this.subscription.add(sub);
      }
    });
    this.userId = this.authService.getUser().id;

    //DATOS
    //lo siguiente carga a TODOS en la lista "comun" (donde estan todos los userAllowed)
    const sub = this.loadUsersAllowedData().subscribe({
      next: () => {
        this.filteredAllPeopleAllowed = this.allPeopleAllowed;
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscription.add(sub);
    const subs = this.subscription = this.ownerService.modalState$.subscribe(
      (document: string) => {
        this.visitorDocument = document;
        this.ModalDocument(document)
      }
    );
    this.subscription.add(subs)
    const ub = this.subscription = this.ownerService.movementState$.subscribe(
      (data: { document: string, movement: string, plate: string }) => {
        const { document, movement, plate } = data;
        this.onChangeMovement(document, movement, plate)
      }
    )
    this.subscription.add(ub)
    this.subscription.add(registryUpdated);

    this.accessUserReportService.getAllUsers().subscribe({
      next: (data) => {
        this.listUser = data;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  onVehicleChange(plate: string): void {
    // Si la patente seleccionada es la misma que la actual, la desmarcamos
    if (this.selectedVehiclePlate === plate) {
      this.selectedVehiclePlate = plate
      this.plateVehicle = plate
      // Deseleccionamos
    } else if (plate === 'none') {
      this.selectedVehiclePlate = '';
      this.plateVehicle = '';
    }
    else {
      // Si se selecciona una nueva patente, la guardamos
      this.selectedVehiclePlate = plate;
      this.plateVehicle = plate
    }

  }

  onChangeMovement(doc: string, mov: string, plate: string) {

    let employeeMovement: MovementBodyEmployee;

    plate = this.selectedVehiclePlate
    const user = this.userAllowedGetAll.find(userallowed => String(userallowed.document) === String(doc)
    )
    this.selectedVisitor = user || null
    if (this.selectedVisitor?.userType.description === 'Tenant' && mov === 'salida') {
      this.prepareEntryMovement(this.selectedVisitor, plate).subscribe({
        next: (result) => {

        },
        error: (err) => {
          console.error('Error en prepareEntryMovement:', err);
        }
      });
    }
    else if (this.selectedVisitor?.userType.description === 'Tenant' && mov === 'entrada') {
      this.prepareExitMovement(this.selectedVisitor, plate).subscribe({
        next: (result) => {

        },
        error: (err) => {
          console.error('Error en prepareExitMovement:', err);
        }
      });
    }
    else if ((this.selectedVisitor?.userType.description === 'Employeed' || this.selectedVisitor?.userType.description === 'Supplier') && mov === 'entrada') {
      this.prepareExitMovementEmp(this.selectedVisitor, plate).subscribe({
        next: (result) => {

          if (result && this.selectedVisitor?.userType.description == 'Employeed') {

            const now = new Date(); // Fecha actual
            const movementDatetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;


            employeeMovement = {
              movementType: 'SALIDA',
              movementDatetime: movementDatetime,
              document: this.selectedVisitor!.document,
              typeUser: 'EMPLEADO'
            };

            this.userService.registerExitEmployeers(employeeMovement).subscribe(data => {
            })
          }


        },
        error: (err) => {
          console.error('Error en prepareExitMovementEmp:', err);
        }
      });
    }
    else if ((this.selectedVisitor?.userType.description === 'Employeed' || this.selectedVisitor?.userType.description === 'Supplier') && mov === 'salida') {

      this.prepareEntryMovementEmp(this.selectedVisitor, plate).subscribe({
        next: (result) => {

          if (result && this.selectedVisitor?.userType.description == 'Employeed') {

            const now = new Date(); // Fecha actual
            const movementDatetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;


            employeeMovement = {
              movementType: 'ENTRADA',
              movementDatetime: movementDatetime,
              document: this.selectedVisitor!.document,
              typeUser: 'EMPLEADO'
            };

            this.userService.registerEntryEmployeers(employeeMovement).subscribe(data => {

            })
          }


        },
        error: (err) => {
          console.error('Error en prepareEntryMovementEmp:', err);
        }
      });
    }
    else if (this.selectedVisitor?.userType.description === 'Owner' && mov === 'salida') {
      this.prepareEntryMovement(this.selectedVisitor, plate).subscribe({
        next: (result) => {
        },
        error: (err) => {
          console.error('Error en prepareEntryVisitor:', err);
        }
      });
    }
    else if (this.selectedVisitor?.userType.description === 'Owner' && mov === 'entrada') {
      this.prepareExitMovement(this.selectedVisitor, plate).subscribe({
        next: (result) => {
        },
        error: (err) => {
          console.error('Error en prepareExitVisitor:', err);
        }
      });
    }
    else if (this.selectedVisitor?.userType.description === 'Emergency' && mov === 'salida') {
      this.prepareEntryMovementEmergency(this.selectedVisitor, plate).subscribe({
        next: (result) => {
        },
        error: (err) => {
          console.error('Error en prepareEntryMovementEmergency:', err);
        }
      });
    }
    else if (this.selectedVisitor?.userType.description === 'Emergency' && mov === 'entrada') {
      this.prepareExitMovementEmergency(this.selectedVisitor, plate).subscribe({
        next: (result) => {
        },
        error: (err) => {
          console.error('Error en prepareExitMovementEmergency:', err);
        }
      })
    }
    else {
      if (this.selectedVisitor) {
        if (mov === 'entrada') {
          this.prepareExitVisitor(this.selectedVisitor, plate).subscribe({
            next: (result) => {
            },
            error: (err) => {
              console.error('Error en prepareExitVisitor:', err);
            }
          });
        }
        else {
          this.prepareEntryVisitor(this.selectedVisitor, plate).subscribe({
            next: (result) => {
            },
            error: (err) => {
              console.error('Error en prepareEntryVisitor:', err);
            }
          });
        }
      }
    }
  }
  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDataTable();
      this.setupModalEventListeners();
      this.updateDataTable();

      // Asegúrate de que el elemento de búsqueda esté disponible
      const searchInput = $('#dt-search-0');
      searchInput.on('keyup', () => {
        const searchTerm = searchInput.val() as string;
        this.dataTable.search(searchTerm).draw();
      });
    });
  }

  userAllowedModal() {
    const sub = this.visitorService.getAllUserAllowedModal().subscribe({
      next: (data) => {
        this.userAllowedGetAll = data;
      }, error: (error) => {
        console.error(error)
      }
    })
    this.subscription.add(sub)
  }

  //metodos para limpiar los filtros
  //agrupa TODOS los checkbox (q tengan #checkBoxRef en su tag)
  @ViewChildren('checkBoxRef') checkBoxes!: QueryList<ElementRef>;

  clearFilters() {
    this.checkBoxes.forEach((checkbox) => {
      checkbox.nativeElement.checked = false;
    });

    const customSearchInput = document.getElementById('customSearch') as HTMLInputElement;
    if (customSearchInput) {
      customSearchInput.value = '';
    }
    // Limpia el input de busqueda 
    this.dataTable.search('').draw(false);

    //limpia los valores elegidos en los checkbox
    this.selectedUserTypes = [];
    //busca todos los userAllowed (ya q no hay filtros en this.selectedValues)
    this.onFilterSelectionChange();
  }
  // FIN metodos para limpiar los filtros


  //PARA ESCANEAR

  isScanning = false;
  scannedResult: string = '';

  //Estado del visitante
  visitorStatus: { [document: string]: string } = {}; // Estado de cada visitante


  initializeDataTable(): void {
    this.ngZone.runOutsideAngular(() => {
      this.dataTable = ($('#visitorsTable') as any).DataTable({
        order: [], //asi no filtra por orden en la 1er columna, de esta forma muestra el ultimo userAllowed creado 
        paging: true,
        ordering: true,
        pageLength: 5,
        lengthMenu: [5, 10, 25, 50],
        lengthChange: true,
        searching: true,
        info: true,
        autoWidth: false,
        language: {
          lengthMenu: '_MENU_',
          zeroRecords: 'No se encontraron registros',
          search: '',
          searchPlaceholder: 'Buscar',
          emptyTable: 'No hay datos disponibles',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
        },
        responsive: true,
        dom: '<"top d-flex justify-content-start mb-2">rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"li>p><"clear">',
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

      $('#customSearch').on('keyup', (e) => {
        const target = e.target as HTMLInputElement;
        this.dataTable.search(target.value).draw();
      });
    });

  }


  // metodos Load DATA
  loadUsersAllowedData(): Observable<boolean> {

    return new Observable<boolean>((observer) => {

      const subscriptionAll = this.visitorService
        .getAllUserAllowedData()
        .subscribe({
          next: (list: AccessUserAllowedInfoDto[]) => {

            this.allPeopleAllowed = []; //limpiar lista

            this.ngZone.run(() => {
              list.forEach((userAllowed) => {
                this.allPeopleAllowed.push({ //lo agrega a la lista "comun" donde estan TODOS los autorizados a ingresar
                  document: userAllowed.document,
                  name: userAllowed.name,
                  userType: userAllowed.userType,
                  last_name: userAllowed.last_name,
                  documentTypeDto: userAllowed.documentTypeDto,
                  authRanges: userAllowed.authRanges,
                  email: userAllowed.email,
                  vehicles: userAllowed.vehicles,
                  neighbor_id: userAllowed.neighbor_id | 0,
                });
              });

              this.allPeopleAllowed = this.helperService.reverseArray(this.allPeopleAllowed);

              observer.next(true);
              observer.complete();
            });
            this.updateDataTable();
          },
          error: (err) => {
            observer.next(false);
            observer.complete();
          }
        });
      this.subscription.add(subscriptionAll);

    });
  }


  updateDataTable(): void {
    if (this.dataTable) {
      this.ngZone.runOutsideAngular(() => {
        const formattedData = this.filteredAllPeopleAllowed.map((visitor, index) => {
          const status = this.visitorStatus[visitor.document] || 'En espera';
          const userTypeIcon = this.getUserTypeIcon(visitor.userType.description);//icono
          let statusButton = '';
          let actionButtons = '';

          let fullName = '';
          if (visitor.last_name === "") {
            fullName = visitor.name;
          } else {
            fullName = `${visitor.last_name}, ${visitor.name}`;
          }

          switch (status) {
            case 'Ingresado':
              statusButton = `<span class="badge  text-bg-success">Ingresado</span>`;
              actionButtons = `<span class="badge  text-bg-danger" data-index="${index}" onclick="RegisterExit(${visitor})">Egresar</span>`;
              break;
            case 'Egresado':
              statusButton = `<span class="badge  text-bg-danger">Egresado</span>`;
              break;
            case 'En espera':
            default:
              statusButton = `<span class="badge text-bg-warning">En espera</span>`;
              actionButtons = `<span class="badge  text-bg-success" data-index="${index}" onclick="RegisterAccess(${visitor})">Ingresar</span>`;
              break;
          }
          const userTypeIconWithClick = `
              <div class="text-center"> 
              <span class="user-type-icon" data-document="${visitor.document}"style="cursor:pointer;">
                ${userTypeIcon}
              </span> 
              </div>`;
          return [
            fullName,
            userTypeIconWithClick,
            `<div class="text-start">${this.getDocumentType(visitor).substring(0, 1) + " - " + visitor.document}</div>`,
            `<div class="text-start">
                <select class="form-select" id="vehicles${index}" name="vehicles${index}">
                     <option value="sin_vehiculo" selected>Sin vehículo</option>
                    ${visitor.vehicles?.length > 0 ? visitor.vehicles.map(vehicle => `
                        <option value="${vehicle.plate}">${vehicle.plate} ${vehicle.vehicle_Type.description
                === 'Car' ? 'Auto' :
                vehicle.vehicle_Type.description === 'MotorBike' ? 'Motocicleta' :
                  vehicle.vehicle_Type.description === 'Truck' ? 'Camión' :
                    vehicle.vehicle_Type.description} </option>
                    `).join('') : ''}
                </select>
            </div>`,
            `<div class="text-center">
                <button style="background-color: #2bad49; color: white;" class="btn select-action" data-value="ingreso" data-index="${index}">
                  Ingreso
                </button>
                </div>
                `,
            actionButtons,
          ];
        });

        this.dataTable.clear().rows.add(formattedData).draw();
      });
      this.addEventListeners();
    }
  }

  // Actualizar el método addEventListeners para manejar los clicks en el nuevo menú
  addEventListeners(): void {

    const tableBody = document.querySelector('#visitorsTable tbody');
    const tdata = $('#visitorsTable tbody');
    // Delegación de eventos para los clics en los íconos de los usuarios
    tdata?.on('click', '.user-type-icon', (event: JQuery.TriggeredEvent) => {
      const document = $(event.currentTarget).data('document'); // Obtener el documento del data-atributo

      // Llamar a ModalDocument pasando el documento
      this.ModalDocument(document);
    });

    if (tableBody) {
      tableBody.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        // Verificar si el clic ocurrió en un ícono de tipo de usuario
        // Manejar el botón "Ver más" en el menú desplegable
        if (target.classList.contains('select-action')) {
          const index = target.getAttribute('data-index');
          const value = target.getAttribute('data-value');
          const selectElement = document.getElementById('vehicles' + index) as HTMLSelectElement;
          const selectedVehicle = selectElement.value;
          if (index !== null) {

            let selectedOwner = this.filteredAllPeopleAllowed[parseInt(index, 10)]; //antes era this.visitors

            // Aquí se maneja la opción "Ver más"
            if (value === 'verMas') {
              this.MoreInfo(selectedOwner);
            } else {
              selectedOwner.observations = '';

              const mockEvent = {
                target: { value: value },
              } as unknown as Event;

              this.onSelectionChange(mockEvent, selectedOwner, selectedVehicle);
            }
          }
        }
      });
    } else {
      console.error('No se encontró el cuerpo de la tabla.');
    }
  }

  getUserTypeIcon(descr: string) {
    switch (descr) {
      case "Employeed": {    //naranja (orange)
        return `<button style="background-color: #FFDAB9;border: bisque;" class="btn btn-primary" title="Empleado">
                  <i class="bi bi-briefcase text-dark"></i>
                </button>`
      }
      case "Supplied": {   //turquesa / verde agua (teal)
        return `<button style="background-color: #FFCECE;border: bisque;" class="btn btn-warning" title="Proveedor">
                  <i class="bi bi-truck text-dark"></i>
                </button>`
      }
      case "Visitor": {    //azul (blue)
        return `<button style="background-color: #B0E0E6;border: bisque;" class="btn btn-primary" title="Visitante">
                    <i class="bi bi-person-raised-hand text-dark"></i>
                  </button> `
      }
      case "Owner": {    //verde (green)
        return `<button style="background-color: #9FD8AB;border: bisque;" class="btn btn-primary" title="Vecino">
                    <i class="bi-house text-dark"></i> 
                  </button>`
      }
      case "Tenant": {   //verde (green)
        return `<button style="background-color: #9FD8AB;border: bisque;" class="btn btn-primary" title="Vecino">
                    <i class="bi-house text-dark"></i> 
                  </button>`
      }

      case "Worker": {   //rojo (red) <i class="bi bi-tools"></i> 
        return `<button style="background-color: #FFB0B0;border: bisque;" class="btn btn-primary" title="Obrero">
                    <i class='bi bi-tools text-dark'></i> 
                  </button>`
      }
      case "Delivery": {   //violeta (indigo) <i class="bi bi-box-seam"></i> 
        return `<button style="background-color: #FFB0B0;border: bisque;" class="btn btn-primary" title="Delivery">
                    <i class='bi bi-box-seam text-dark'></i> 
                  </button>`
      }
      case "Cleaning": {   //rosa (pink) <i class="bi bi-stars"></i>
        return `<button style="background-color: #FFB0B0;border: bisque;" class="btn btn-primary" title="P. de Limpieza">
                    <i class='bi-droplet text-dark'></i> 
                  </button>`
      }
      case "Gardener": { //celeste (cyan) <i class="bi bi-flower1"></i>
        return `<button style="background-color: #FFB0B0;border: bisque;" class="btn btn-primary" title="Jardinero">
                    <i class='bi-scissors text-dark'></i> 
                  </button>`
      }
      case "Taxi": { //
        return `<button style="background-color: #FFB0B0;border: bisque;" class="btn btn-primary" title="Taxi">
                   <i class="bi bi-taxi-front-fill text-dark"></i>
                  </button>`
      }

      default: {
        return `<button style="background-color: black;border: bisque;" class="btn btn-primary" title="???">
                  <i class="bi bi-question-lg"></i>
                </button> `
      }
    }
  }

  selectedUserTypes: string[] = [];

  // Definición de las opciones para ng-select
  userTypeOptions = [
    { value: 'neighbour', label: 'Vecino', descriptions: ['Owner', 'Tenant'] },
    { value: 'visitor', label: 'Visitante', descriptions: ['Visitor'] },
    { value: 'employee', label: 'Empleado', descriptions: ['Employeed'] },
    { value: 'service', label: 'Servicio', descriptions: ['Supplied', 'Worker', 'Delivery', 'Cleaning', 'Gardener'] },
    { value: 'supplied', label: 'Proveedor', descriptions: ['Supplied'] },
    { value: 'worker', label: 'Obrero', descriptions: ['Worker'] },
    { value: 'delivery', label: 'Delivery', descriptions: ['Delivery'] },
    { value: 'cleaning', label: 'Personal de Limpieza', descriptions: ['Cleaning'] },
    { value: 'gardener', label: 'Jardinero', descriptions: ['Gardener'] }
  ];

  onFilterSelectionChange() {

    this.loadUsersAllowedAfterRegistrationData();

    this.filteredAllPeopleAllowed = []; // Resetear la lista filtrada

    if (this.selectedUserTypes.length > 0) {
      // Obtener todas las descripciones seleccionadas
      const selectedDescriptions = this.selectedUserTypes
        .map(type => this.userTypeOptions.find(option => option.value === type)?.descriptions)
        .flat();

      // Filtrar usuarios según las descripciones seleccionadas
      const filteredUsers = this.allPeopleAllowed.filter(user =>
        selectedDescriptions.includes(user.userType.description)
      );

      // Procesar los usuarios filtrados
      filteredUsers.forEach(user => {
        if (['Owner', 'Tenant'].includes(user.userType.description)) {
          // Caso especial para vecinos
          this.filteredAllPeopleAllowed.push({
            ...user,
            neighbor_id: 0
          });
        } else {
          // Resto de casos
          this.filteredAllPeopleAllowed.push(user);
        }
      });
    } else {
      // Si no hay selecciones, mostrar todos
      this.filteredAllPeopleAllowed = [...this.allPeopleAllowed];
    }

    this.updateDataTable();
  }



  onSelectionChange(event: Event, visitor: AccessUserAllowedInfoDto, vehiclePlate: string) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    if (selectedValue === 'ingreso') {
      let accessObservable: Observable<boolean>;

      if (visitor.userType.description === 'Owner' || visitor.userType.description === 'Tenant') {
        accessObservable = this.prepareEntryMovement(visitor, vehiclePlate);
      } else if (visitor.userType.description === 'Employeed' || visitor.userType.description === 'Supplier' || visitor.userType.description === 'Supplied') {
        accessObservable = this.prepareEntryMovementEmp(visitor, vehiclePlate);
      } else {
        //es para visitors y los otros tipos q funcionan igual
        accessObservable = this.prepareEntryVisitor(visitor, vehiclePlate);
      }

      if (accessObservable) {
        const sub = accessObservable.subscribe({
          next: (success) => {
            if (success) {
              const sub2 = this.loadUsersAllowedAfterRegistrationData().subscribe({
                next: (response) => {
                  if (response) {
                    this.onFilterSelectionChange();
                  }
                },
              });
              this.subscription.add(sub2);

            } else {
              console.error('Falló al registrar ingreso');
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
        exitObservable = this.prepareExitMovement(visitor, vehiclePlate);


      } else if (visitor.userType.description === 'Employeed' || visitor.userType.description === 'Supplier' || visitor.userType.description === 'Supplied') {
        exitObservable = this.prepareExitMovementEmp(visitor, vehiclePlate);

      } else {
        //es para visitors y los otros tipos q funcionan igual
        exitObservable = this.prepareExitVisitor(visitor, vehiclePlate);
        //this.visitorService.RegisterExit(visitor, vehiclePlate);

      }

      if (exitObservable) {
        const sub = exitObservable.subscribe({
          next: (success) => {
            if (success) {

              const sub2 = this.loadUsersAllowedAfterRegistrationData().subscribe({
                next: (response) => {
                  if (response) {
                    this.onFilterSelectionChange();
                  }
                },
              });
              this.subscription.add(sub2);

            } else {
              console.error('Falló al registrar egreso');
            }
          },
          error: (error) => {
            console.error('Error al registrar egreso:', error);
          }
        });
        this.subscription.add(sub);
      }
    }

    selectElement.value = '';
  }

  loadUsersAllowedAfterRegistrationData(): Observable<boolean> {

    return new Observable<boolean>((observer) => {

      const subscriptionAll = this.visitorService
        .getAllUserAllowedData()
        .subscribe({
          next: (list: AccessUserAllowedInfoDto[]) => {

            this.allPeopleAllowed = []; // se vacia

            this.ngZone.run(() => {
              list.forEach((userAllowed) => {
                this.allPeopleAllowed.push({ //se agregan a la lista "comun" donde estan TODOS los autorizados a ingresar
                  document: userAllowed.document,
                  name: userAllowed.name,
                  userType: userAllowed.userType,
                  last_name: userAllowed.last_name,
                  documentTypeDto: userAllowed.documentTypeDto,
                  authRanges: userAllowed.authRanges,
                  email: userAllowed.email,
                  vehicles: userAllowed.vehicles,
                  neighbor_id: userAllowed.neighbor_id | 0,
                });
              });

              this.allPeopleAllowed = this.helperService.reverseArray(this.allPeopleAllowed);
              //this.updateDataTable();
              observer.next(true);
              observer.complete();
            });
          },
          error: (err) => {
            observer.next(false);
            observer.complete();
          }
        });
      this.subscription.add(subscriptionAll);

    });

  }


  allPeopleAllowed: AccessUserAllowedInfoDto[] = [];
  filteredAllPeopleAllowed: AccessUserAllowedInfoDto[] = [];

  // datos de búsqueda/filtrado
  parameter: string = '';



  // mostrar más info de un visitante
  selectedVisitor: AccessUserAllowedInfoDto | null = null; // Información del visitante seleccionado

  getDocumentType(visitor: AccessUserAllowedInfoDto): string {
    let response = '';

    if (visitor.documentTypeDto?.description === 'PASSPORT') {
      response = 'Pasaporte';
    }
    else if (visitor.documentTypeDto?.description === 'DNI') {
      response = 'DNI';

    } else if (visitor.documentTypeDto?.description === 'CUIT') {
      response = 'CUIT'
    } else {
      response = visitor.documentTypeDto?.description || '';
    }

    return response;
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
  }

  ModalDocument(documentData: string) {

    const user = this.userAllowedGetAll.find(userallowed => String(userallowed.document) === String(documentData)
    )
    this.selectedVisitor = user || null;

    const modalElement = document.getElementById('visitorInfoModal')!;
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();

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


  private scannedUid: string | null = null;
  private visitorsByUid: { [key: string]: any[] } = {};

  handleQrScan(data: any): void {
    const scannedData = data[0]?.value;
    if (scannedData) {
      this.stopScanner();

      try {
        const visitorsData = JSON.parse(scannedData);
        if (visitorsData.length === 0) {
          throw new Error('No hay datos de visitantes en el QR');
        }

        // Obtener el UID del primer visitante (todos tienen el mismo UID)
        const uid = visitorsData[0].uid;
        this.scannedUid = uid;

        // Filtrar solo los visitantes que aún están en `filteredAllPeopleAllowed`
        const existingVisitors = visitorsData.filter((visitorData: AccessUserAllowedInfoDto) =>
          this.filteredAllPeopleAllowed.some(existingVisitor => existingVisitor.document === visitorData.document)
        );

        if (existingVisitors.length === 0) {
          Swal.fire({
            title: 'Usuario no encontrado',
            text: 'No se encontró ningún usuario registrado con los datos escaneados.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            showCloseButton: true,
            confirmButtonColor: '#3085d6',
          });
          return; // Detener el proceso aquí si no se encuentra ningún visitante
        }

        // Filtrar la DataTable usando los documentos de los visitantes existentes
        this.filteredAllPeopleAllowed = this.filteredAllPeopleAllowed.filter(visitor =>
          existingVisitors.some((v: AccessUserAllowedInfoDto) => v.document === visitor.document)
        );

        // Actualizar la tabla con los datos filtrados
        this.updateDataTable();

        Swal.fire({
          title: 'Éxito',
          text: `Se han filtrado ${existingVisitors.length} visitante(s).`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

      } catch (error) {
        console.error('Error al parsear el código QR:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar el código QR.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } else {
      console.warn('No se encontraron datos en el escaneo.');
    }
  }




  // Método para obtener todos los visitantes de un UID específico
  getVisitorsByUid(uid: string): AccessUserAllowedInfoDto[] {
    return this.visitorsByUid[uid] || [];
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
    userId: this.userId
  };
  vehiclee: AccessVehicleOwner = {
    plate: '',
    insurance: '',
    vehicle_Type: {
      description: '',
    },
  };


  // registra el ingreso de un VECINO (propietario o inquilino)
  //Metodo pero con modal de bootstrap (revisar) deje comentado abajo el original por las dudas
  private prepareEntryMovement(visitor: AccessUserAllowedInfoDtoOwner, plate: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        plate = this.plateVehicle

        // Preparar datos del movimiento
        const vehicless = plate ? visitor.vehicles.find(v => v.plate === plate) || undefined : undefined;
        const firstRange = visitor.authRanges[0];
        const now = new Date();
        let hasMovement = false;

        for (const auth of visitor.authRanges) {
          let startDate = new Date(auth.init_date);
          let endDate = new Date(auth.end_date);

          if (startDate <= now && endDate >= now) {
            hasMovement = true;
            break;
          }

        }

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
            documentType: visitor.documentTypeDto,
            vehicle: vehicless,
          },
          userId: this.userId
        };


        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessage')!.textContent = modalMessage;

        // Obtener el modal usando el método correcto de Bootstrap 5
        const modalElement = document.getElementById('confirmIngresoModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal antes de mostrarlo
        modalElement.addEventListener('hidden.bs.modal', () => {
          // Limpiar los event listeners cuando se cierra el modal
          const confirmButton = document.getElementById('confirmButton')!;
          const cancelButton = document.getElementById('cancelButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmButton')!;
        confirmButton.onclick = () => {
          if (!hasMovement) {
            Swal.fire({
              title: 'No se puede registrar el ingreso',
              text: 'El vecino no tiene un rango de autorización válido para ingresar.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            }).then(() => {
              observer.next(false);
              observer.complete();
              modal.hide();
            });
            return;
          }

          this.ownerService.registerOwnerRenterEntry(this.movement).subscribe({
            next: (response) => {
              modal.hide();

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
              modal.hide();

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
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
      }
    });
  }




  //Egreso con modal de bootstrap 
  private prepareExitMovement(visitor: AccessUserAllowedInfoDtoOwner, plate: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {

        // Preparar datos del movimiento
        const vehicless = this.selectedVehiclePlate ? visitor.vehicles.find(v => v.plate === this.selectedVehiclePlate) || undefined : undefined;
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
            documentType: visitor.documentTypeDto,
            vehicle: vehicless,
          },
          userId: this.userId
        };

        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageEgreso')!.textContent = modalMessage;

        // Obtener el modal usando el método correcto de Bootstrap 5
        const modalElement = document.getElementById('confirmEgresoModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal antes de mostrarlo
        modalElement.addEventListener('hidden.bs.modal', () => {
          // Limpiar los event listeners cuando se cierra el modal
          const confirmButton = document.getElementById('confirmEgresoButton')!;
          const cancelButton = document.getElementById('cancelEgresoButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmEgresoButton')!;
        confirmButton.onclick = () => {
          const sub = this.ownerService.registerExitOwner(this.movement).subscribe({
            next: (response) => {
              modal.hide();

              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de egreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              modal.hide();

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
                  title: 'El Vecino tiene un egreso previo!',
                  text: 'El Vecino debe ingresar antes de poder volver a salir',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
          this.subscription.add(sub);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelEgresoButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
      }
    });
  }




  //Empleados
  private userType: AccessUserAllowedTypeDto = {
    description: 'Employeed',
  };


  private prepareEntryMovementEmp(visitor: AccessUserAllowedInfoDtoOwner, platee: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        let movementDatetime = new Date(); // Current date and time
        movementDatetime.setHours(movementDatetime.getHours() - 3); // Subtract 3 hours
        let updatedDatetime = movementDatetime.toISOString();
        
        // Preparar el objeto de movimiento
        const movementS: AccessMovementEntryDto = {
          description: String(this.observations || ''),
          movementDatetime: updatedDatetime,
          vehiclesId: visitor.vehicles.find(x => x.plate === platee)?.plate,
          document: visitor.document,
          documentType: visitor.documentTypeDto.description,
          userId: this.userId
        };

        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageIngresoEmp')!.textContent = modalMessage;

        // Obtener el modal
        const modalElement = document.getElementById('confirmIngresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
          const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
        confirmButton.onclick = () => {
          const subscription = this.userService.registerEmpSuppEntry(movementS).subscribe({
            next: (response) => {
              modal.hide();

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
              modal.hide();

              if (err.status === 403) {
                const errorMessage = err.error.message;
                if (errorMessage === "The user does not have authorization range") {
                  Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'El usuario no tiene un rango de autorización asignado.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                  });
                } else if (errorMessage === "The user does not have authorization to entry for today") {
                  this.helperService.entryOutOfAuthorizedHourRange(
                    visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges))
                  );
                }
                observer.next(false);
                observer.complete();
              } else if (err.status === 409) {
                Swal.fire({
                  title: 'Error',
                  text: 'Tiene que salir antes de entrar.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
          this.subscription.add(subscription);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

  private prepareExitMovementEmp(visitor: AccessUserAllowedInfoDtoOwner, platee: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        let movementDatetime = new Date(); // Current date and time
        movementDatetime.setHours(movementDatetime.getHours() - 3); // Subtract 3 hours
        let updatedDatetime = movementDatetime.toISOString();
        
        alert(updatedDatetime)
        // Preparar el objeto de movimiento
        const movementS: AccessMovementEntryDto = {
          description: String(this.observations || ''),
          movementDatetime: updatedDatetime,
          vehiclesId: visitor.vehicles.find(x => x.plate === platee)?.plate,
          document: visitor.document,
          documentType: visitor.documentTypeDto.description,
          userId: this.userId
        };

        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageEgresoEmp')!.textContent = modalMessage;

        // Obtener el modal
        const modalElement = document.getElementById('confirmEgresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
          const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.userService.registerEmpSuppExit(movementS).subscribe({
            next: (response) => {
              modal.hide();

              Swal.fire({
                title: 'Registro Exitoso',
                text: 'Registro de egreso exitoso.',
                icon: 'success',
                confirmButtonText: 'Cerrar',
              }).then(() => {
                observer.next(true);
                observer.complete();
              });
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              modal.hide();

              if (err.status != 409 && err.status != 403) {
                Swal.fire({
                  title: 'Error',
                  text: 'Error al cargar los datos. Intenta nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              } else if (err.status === 403) {
                const errorMessage = err.error.message;

                if (errorMessage === "The user does not have authorization range") {
                  Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'El usuario no tiene un rango de autorización asignado para hoy.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                  });
                } else if (errorMessage === "The user does not have authorization to entry for today") {
                  this.helperService.entryOutOfAuthorizedHourRange(
                    visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges))
                  );
                }
                observer.next(false);
                observer.complete();
              } else if (err.status === 409) {
                Swal.fire({
                  title: 'Error',
                  text: 'Tiene que entrar antes de salir.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
          this.subscription.add(sub);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

  prepareEntryVisitor(visitor: AccessUserAllowedInfoDto, vehiclePlate: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {

      try {

        const neighbor = this.listUser.filter(x => x.id === visitor.neighbor_id)
        const nameNeighbor = neighbor.at(0)?.name + " " + neighbor.at(0)?.lastname

        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}? Ingresará al lote de ${nameNeighbor}`;
        document.getElementById('modalMessageIngresoEmp')!.textContent = modalMessage;

        // Obtener el modal
        const modalElement = document.getElementById('confirmIngresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
          const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.visitorService.RegisterAccess(visitor, vehiclePlate, this.userId).subscribe({
            next: (response) => {
              modal.hide();
              if (response) {
                observer.next(true);
                observer.complete();
              } else {
                observer.next(false);
                observer.complete();
              }
            },
            error: (error) => {
              console.error('Error al registrar egreso:', error);
              modal.hide();
              observer.next(false);
              observer.complete();
            }
          });
          this.subscription.add(sub);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });

  }

  prepareExitVisitor(visitor: AccessUserAllowedInfoDto, vehiclePlate: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {

      try {

        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageEgresoEmp')!.textContent = modalMessage;

        // Obtener el modal
        const modalElement = document.getElementById('confirmEgresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
          const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.visitorService.RegisterExit(visitor, vehiclePlate, this.userId).subscribe({
            next: (response) => {
              modal.hide();
              if (response) {
                observer.next(true);
                observer.complete();
              }
              else {
                observer.next(false);
                observer.complete();
              }
            },
            error: (error) => {
              console.error('Error al registrar egreso:', error);
              modal.hide();
              observer.next(false);
              observer.complete();
            }
          });
          this.subscription.add(sub);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

  //---------- EMERGENCIAS --------
  private prepareExitMovementEmergency(visitor: AccessUserAllowedInfoDtoOwner, platee: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        // Preparar el objeto de movimiento
        const movementS: AccessNewEmergencyDto = {
          people: [
            {
              document: {
                type: visitor.documentTypeDto,
                number: visitor.document,
              },
              name: visitor.name,
              lastName: visitor.last_name,
            }
          ],
          vehicle: {
            plate: platee,
            vehicle_Type: visitor.vehicles.find((a) => a.plate === platee)?.vehicle_Type ?? {
              description: ''
            }
          },
          observations: this.observations,
          loggedUserId: this.userId,
          neighborId: 0
        };

        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageIngresoEmp')!.textContent = modalMessage;

        // Obtener el modal
        const modalElement = document.getElementById('confirmIngresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
          const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmIngresoEmpButton')!;
        confirmButton.onclick = () => {
          const subscription = this.emergencyService.registerEmergencyExit(movementS).subscribe({
            next: (response) => {
              modal.hide();
              if (response.at(0)?.state === 'SUCCESSFUL') {
                Swal.fire({
                  title: 'Registro Exitoso',
                  text: 'Registro de egreso exitoso',
                  icon: 'success',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(true);
                  observer.complete();
                });
              }
              else {
                const state = this.getState(response.at(0)?.state + '')
                Swal.fire({
                  title: 'Registro inválido',
                  text: state,
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            },
            error: (err) => {
              console.error('Error al registrar la entrada:', err);
              modal.hide();
            }
          });
          this.subscription.add(subscription);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelIngresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

  private prepareEntryMovementEmergency(visitor: AccessUserAllowedInfoDtoOwner, platee: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      try {
        // Preparar el objeto de movimiento
        const movementS: AccessNewEmergencyDto = {
          people: [
            {
              document: {
                type: visitor.documentTypeDto,
                number: visitor.document,
              },
              name: visitor.name,
              lastName: visitor.last_name,
            }
          ],
          vehicle: {
            plate: platee,
            vehicle_Type: visitor.vehicles.find((a) => a.plate === platee)?.vehicle_Type ?? {
              description: ''
            },
          },
          observations: this.observations,
          neighborId: visitor.authRanges.at(0)?.neighbor_id ?? 0,
          loggedUserId: this.userId
        };

        // Preparar mensaje del modal
        const modalMessage = `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`;
        document.getElementById('modalMessageEgresoEmp')!.textContent = modalMessage;

        // Obtener el modal
        const modalElement = document.getElementById('confirmEgresoEmpModal')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        // Configurar los eventos del modal
        modalElement.addEventListener('hidden.bs.modal', () => {
          const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
          const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
          confirmButton.onclick = null;
          cancelButton.onclick = null;
        });

        // Configurar el botón de confirmación
        const confirmButton = document.getElementById('confirmEgresoEmpButton')!;
        confirmButton.onclick = () => {
          const sub = this.emergencyService.registerEmergencyEntry(movementS).subscribe({
            next: (response) => {

              modal.hide();
              if (response.at(0)?.state === 'SUCCESSFUL') {
                Swal.fire({
                  title: 'Registro Exitoso',
                  text: 'Registro de ingreso exitoso.',
                  icon: 'success',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(true);
                  observer.complete();
                });
              }
              else {
                const state = this.getState(response.at(0)?.state + '')
                Swal.fire({
                  title: 'Registro inválido',
                  text: state,
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            },
            error: (err) => {
              console.error('Error al registrar el egreso:', err);
              modal.hide();

              if (err.status != 409 && err.status != 403) {
                Swal.fire({
                  title: 'Error',
                  text: 'Error al cargar los datos. Intenta nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              } else if (err.status === 403) {
                const errorMessage = err.error.message;

                if (errorMessage === "The user does not have authorization range") {
                  Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'El usuario no tiene un rango de autorización asignado para hoy.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                  });
                } else if (errorMessage === "The user does not have authorization to entry for today") {
                  this.helperService.entryOutOfAuthorizedHourRange(
                    visitor.authRanges.at(this.helperService.todayIsInDateRange(visitor.authRanges))
                  );
                }
                observer.next(false);
                observer.complete();
              } else if (err.status === 409) {
                Swal.fire({
                  title: 'Error',
                  text: 'Tiene que entrar antes de salir.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar',
                }).then(() => {
                  observer.next(false);
                  observer.complete();
                });
              }
            }
          });
          this.subscription.add(sub);
        };

        // Configurar el botón de cancelar
        const cancelButton = document.getElementById('cancelEgresoEmpButton')!;
        cancelButton.onclick = () => {
          modal.hide();
          observer.next(false);
          observer.complete();
        };

        // Mostrar el modal
        modal.show();

      } catch (error) {
        console.error('Error al preparar el movimiento:', error);
        observer.error(error);
        observer.complete();
      }
    });
  }

  private getState(state: string): string {
    let text = '';
    switch (state) {
      case 'UNAUTHORIZED':
        text = 'El usuario no está autorizado a ingresar.';
        break;
      case 'WITHOUT_USER':
        text = 'No existe un usuario con el documento provisto.';
        break;
      case 'WITHOUT_EXIT':
        text = 'Tiene que salir antes de entrar';
        break;
      case 'WITHOUT_ENTRY':
        text = 'Tiene que entrar antes de salir.';
        break;
      case 'FAILED':
        text = 'Error al cargar los datos.';
        break;
      case null:
      default:
        return '';
    }
    return text
  }
}