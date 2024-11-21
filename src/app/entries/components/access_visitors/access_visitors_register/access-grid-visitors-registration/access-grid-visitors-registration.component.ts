import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Output,EventEmitter } from '@angular/core';
import { AccessVisitor } from '../../../../models/access-visitors/access-visitors-models';

import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { AccessVisitorsExcelReaderComponent } from '../access-visitors-excel-reader/access-visitors-excel-reader.component';

@Component({
  selector: 'app-access-grid-visitors-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, AccessVisitorsExcelReaderComponent],
  templateUrl: './access-grid-visitors-registration.component.html',
  styleUrl: './access-grid-visitors-registration.component.css'
})
export class AccessGridVisitorsRegistrationComponent implements OnInit, OnDestroy {

  @Output() updateVisit = new EventEmitter<AccessVisitor>();
  private unsubscribe$ = new Subject<void>();
  unifiedSearch: string = '';
  visitors: AccessVisitor[] = [];
  VisitorOnUpdate: AccessVisitor | null = null;
  table: any = null;

  constructor(private visitorService: AccessVisitorsRegisterServiceService) {}
  updateDataTable(): void {
    if(!this.table)
      return;
    this.table.clear();  
  
    this.visitors.forEach((visitor, index) => {
      this.table.row.add([
        visitor.document,
        visitor.firstName,
        visitor.lastName, 
        visitor.hasVehicle ? visitor.vehicle?.licensePlate : 'Sin vehículo', 
        `<div class="dropdown d-flex justify-content-center">
          <button class="btn btn-light d-flex align-items-center justify-content-center" type="button" id="actionMenu${index}" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical" style="color: black;"></i>
          </button>
          <ul class="dropdown-menu" aria-labelledby="actionMenuButton-${visitor.document}">
            <li>
              <a role="button" class="dropdown-item update-visitor-btn"
              onclick="window.dispatchEvent(new CustomEvent('updateVisitor', { detail: '${index}' }))">Modificar</a>
            </li>
            <li>
              <a role="button" class="dropdown-item text-danger delete-visitor-btn" 
              onclick="window.dispatchEvent(new CustomEvent('deleteVisitor', { detail: '${index}' }))"">Eliminar</a>
            </li>
          </ul>
        </div>`
      ]);
    });
    this.table.draw();
  }
  
  addActionsEventListeners() {
    window.addEventListener('updateVisitor', (event) => {
      const customEvent = event as CustomEvent;
      const index = customEvent.detail;
      const selectedVisitor = this.visitors[index];
      this.updateVisitor(selectedVisitor);
    });

    window.addEventListener('deleteVisitor', (event) => {
      const customEvent = event as CustomEvent;
      const index = customEvent.detail;
      const selectedVisitor = this.visitors[index];
      this.deleteVisitor(selectedVisitor);
    });
  }
  initializeDataTable(): void {
    this.table = ($('#tablaconsulta') as any).DataTable({
      dom: 'rt<"bottom d-flex justify-content-between align-items-center"<"d-flex align-items-center gap-3"l i> p><"clear">',
      columnDefs: [
        { orderable: false, searchable: false, targets: 4 },
        { className: "text-start", targets: '_all' },
        { className: "text-start", targets: 0 }
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
        zeroRecords: "No se encontraron invitaciones",
        search: "", 
        searchPlaceholder: "Buscar",
        emptyTable: "No hay invitaciones cargadas",
        info: "_TOTAL_ Invitaciones cargadas",
        infoEmpty: "",
        infoFiltered: "(filtrado de _MAX_ registros totales)"
      },
      responsive: true
    });
    this.updateDataTable();
  }

  ngOnInit(): void {
    this.addActionsEventListeners();
    setTimeout(() => {
      this.initializeDataTable();
      this.setupUnifiedSearchFilter();
      this.setupCustomFilters();

      $('#tablaconsulta tbody').on('click', '.view-more-btn', (event: any) => {
        const index = $(event.currentTarget).data('index');
        // const selectedUser = this.movements[index].user_allowed;
  
        // this.viewuser(selectedUser);
      });
    });

    this.visitorService.getVisitorsTemporalsSubject()
      .pipe(
        takeUntil(this.unsubscribe$))
      .subscribe(visitors => {
        this.visitors = visitors;
        this.updateDataTable();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateVisitor(visitor: AccessVisitor) {
    this.VisitorOnUpdate = { ...visitor };
    this.updateVisit.emit(this.VisitorOnUpdate);
    this.deleteVisitor(visitor);
  }

  saveModification() {
    if (this.VisitorOnUpdate) {
      this.visitorService.updateVisitorsTemporalsSubject(this.VisitorOnUpdate);
      this.VisitorOnUpdate = null;
    }
  }
  
  deleteVisitor(visitor: AccessVisitor) {
    this.visitorService.deleteVisitorsTemporalsSubject(visitor);
  }

  private filterRow(data: string[]): boolean {
    if (this.unifiedSearch) {
      const searchTerm = this.unifiedSearch.toLowerCase();
      if (!data.some(field => field.toLowerCase().includes(searchTerm))) {
        return false;
      }
    }

    return true;
  }

  private setupCustomFilters(): void {
    $.fn.dataTable.ext.search.push(
      (settings: any, data: string[]) => this.filterRow(data)
    );
  }

  private setupUnifiedSearchFilter(): void {
    $('#unifiedSearchFilter').on('keyup', (e) => {
      const target = $(e.target);
      const inputValue = target.val() as string;
      
      this.unifiedSearch = inputValue.length >= 3 ? inputValue : '';
      
      if (this.table) {
        this.table.draw();
      }
    });
  }
}
