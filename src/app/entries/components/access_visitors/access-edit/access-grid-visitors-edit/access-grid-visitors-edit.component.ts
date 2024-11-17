import { Component, OnInit, OnDestroy, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Output,EventEmitter } from '@angular/core';
import { AccessUserAllowedInfoDto, AccessVisitor } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { AccessUserAllowedInfoDto2, Owner } from '../../../../models/access-visitors/access-VisitorsModels';
import { AccessVisitorsEditServiceService } from '../../../../services/access_visitors/access-visitors-edit/access-visitors-edit-service/access-visitors-edit-service.service';
import { AccessVisitorsEditServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-edit/access-visitors-edit-service-http-service/access-visitors-edit-service-http-client.service';
import { AccessContainerVisitorsEditComponent } from '../access-container-visitors-edit/access-container-visitors-edit.component';

@Component({
  selector: 'app-access-grid-visitors-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-grid-visitors-edit.component.html',
  styleUrl: './access-grid-visitors-edit.component.css'
})
export class AccessGridVisitorsEditComponent implements OnInit, OnDestroy{
  visitors: AccessUserAllowedInfoDto2[] = [];
  @Output() updateVisit = new EventEmitter<AccessUserAllowedInfoDto2>();
  private unsubscribe$ = new Subject<void>();
  VisitorOnUpdate: AccessUserAllowedInfoDto2 | null = null;
  table: any = null;
  @Input() parent?: AccessContainerVisitorsEditComponent;
  Owners: Owner[] = [];

  neighborid: number = 0;
  constructor(
    private visitorService: AccessVisitorsEditServiceService,
    private visitorHttpService: AccessVisitorsEditServiceHttpClientService
  ) {}

  loadVisitors(id: number): void {
    
    this.visitorHttpService.getVisitors(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (visitors) => {
          this.visitors = visitors;
          console.log('Visitantes cargados:', visitors);
          if (this.table) {
            this.updateDataTable();
          } else {
            this.initializeDataTable();
          }
        },
        error: (error) => {
          console.error('Error al cargar visitantes:', error);
        }
      });
  }

  updateDataTable(): void {
    if(!this.table) return;
    
    this.table.clear();  
    console.log('Visitantes a mostrar en la grilla:', this.visitors);
    console.log('vehiculo:', this.visitors[0].vehicle?.plate);
    this.visitors.forEach((visitor, index) => {
      this.table.row.add([
        visitor.document,
        `${visitor.last_name}, ${visitor.name}`,  // Combinamos apellido y nombre
        visitor.vehicle ? visitor.vehicle?.plate : 'Sin vehículo', 
        `<button class="btn btn-light update-visitor-btn" data-index="${index}">
         <i class="fas fa-edit" style="color: black;"></i> Modificar
       </button>`
      ]);
    });
    
    this.table.draw();
    this.addActionsEventListeners();
}

initializeDataTable(): void {
  this.table = ($('#tablaconsulta') as any).DataTable({
    dom: '<"top d-flex justify-content-start mb-2"f>rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"li>p><"clear">',
    columnDefs: [
      { orderable: false, searchable: false, targets: 3 }, // Cambiado de 4 a 3 porque ahora tenemos una columna menos
      { className: "text-start", targets: '_all' },
      { className: "text-start", targets: 0 },
      { className: "text-center", targets: 3 }  // Agregamos esta línea para centrar la columna de acciones
    ],
    paging: true,
    ordering: true,
    pageLength: 5,
    lengthMenu: [5, 10, 25, 50],
    lengthChange: true,
    searching: true,
    info: true,
    autoWidth: false,
    language: {
      lengthMenu: " _MENU_ ",
      zeroRecords: "No se encontraron invitados",
      search: "", 
      searchPlaceholder: "Buscar",
      emptyTable: "No hay invitados cargados",
      info: "",
      infoEmpty: "",
      infoFiltered: ""
    },
    responsive: true
  });
  this.updateDataTable();
}

  addActionsEventListeners() {
    const updateButtons = document.querySelectorAll('.update-visitor-btn') as NodeListOf<HTMLButtonElement>;
    const deleteButtons = document.querySelectorAll('.delete-visitor-btn') as NodeListOf<HTMLButtonElement>;
    
    updateButtons.forEach(b => {
      b.addEventListener('click', () => {
        const index = parseInt(b.getAttribute('data-index') || '0', 10);
        const selectedVisitor = this.visitors[index];
        this.updateVisitor(selectedVisitor);
      });
    });
    
    deleteButtons.forEach(b => {
      b.addEventListener('click', () => {
        const index = parseInt(b.getAttribute('data-index') || '0', 10);
        const selectedVisitor = this.visitors[index];
        this.deleteVisitor(selectedVisitor);
      });
    });
  }

  updateVisitor(visitor: AccessUserAllowedInfoDto2) {
    // Emitir el visitante seleccionado
    this.updateVisit.emit(visitor);

    // Actualizar la tabla
    this.updateDataTable();
  }

  deleteVisitor(visitor: AccessUserAllowedInfoDto2) {
    this.visitors = this.visitors.filter(v => v.document !== visitor.document);
    this.updateDataTable();
    this.visitorService.deleteVisitorsTemporalsSubject(visitor);
  }

  ngOnInit(): void {
    this.loadOwners();
    console.log('Iniciando componente de grilla...');
    this.visitorService.getNeighbors().subscribe(id => {
      this.neighborid = id;
      this.loadVisitors(this.neighborid)
    });
    // Cargar visitantes iniciales
    ;

    // Suscribirse a cambios en el servicio
    if (this.parent) {
      this.parent.visitorSaved.subscribe(() => {
        this.loadVisitors(this.neighborid);
      });
    }
    
    // Inicializar DataTable después de un pequeño delay
    setTimeout(() => {
      if (!this.table) {
        this.initializeDataTable();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onOwnerChange(event: any) {
    const selectedDocument = event.target?.value;
    const selectedOwner = this.Owners.find(owner => owner.document === selectedDocument);
    this.neighborid = selectedOwner?.authRanges[0].neighbor_id ?? 0;
    this.visitorService.setNeighbors(this.neighborid);
    console.log('Propietario seleccionado:', selectedOwner);
  }

  loadOwners(): void {
    this.visitorHttpService.getowners()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (Owners) => {
          console.log('Owners cargados:', Owners);
          this.Owners = Owners;
        },
        error: (error) => {
          console.error('Error al cargar visitantes:', error);
        }
      });
  }
}