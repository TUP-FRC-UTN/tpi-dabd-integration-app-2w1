import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import 'datatables.net';
import 'datatables.net-bs5';
import moment from 'moment';
import 'bootstrap';
import $ from 'jquery';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BillViewOwner } from '../../../models/expenses-models/bill-view-owner.model';
import { BillViewOwnerService } from '../../../services/expenses-services/viewOwnerServices/bill-view-owner.service';
import { ProviderViewOwnerService } from '../../../services/expenses-services/viewOwnerServices/provider-view-owner.service';
import { ExpenseViewService } from '../../../services/expenses-services/expenseView/expenseView.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, takeUntil } from 'rxjs/operators';
import { ExpenseView } from '../../../models/expenses-models/expenseView';
import { ExpenseViewComponent } from '../../expenses-components/expenses-view/expenses-view.component';

declare let bootstrap: any;
@Component({
  selector: 'app-view-owner-expense',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ExpenseViewComponent],
  providers: [ExpenseViewService],
  templateUrl: './expenses-view-expense-owner.component.html',
  styleUrls: ['./expenses-view-expense-owner.component.scss'],
})
export class ViewOwnerExpenseComponent implements OnInit, OnDestroy {

  bills: BillViewOwner[] = [];
  filteredBills: BillViewOwner[] = [];
  providersMap: { [key: string]: string } = {};
  dataTable: any;
  fechaDesde: string = '';
  fechaHasta: string = '';
  maxDateTo: string = '';
  table: any;
  searchTerm: string = '';
  selectedExpense: ExpenseView | null = null;
  private dateChangeSubject = new Subject<{ from: string, to: string }>();
  private unsubscribe$ = new Subject<void>();
  isLoading = false;


  constructor(
    private billService: BillViewOwnerService,
    private providerService: ProviderViewOwnerService,
    private cdRef: ChangeDetectorRef,
    private expenseViewService: ExpenseViewService
  ) { }
  onSearch(event: any) {
    const searchValue = event.target.value;

    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }
  ngOnInit(): void {
    this.loadDates();
    this.setupDateChangeObservable();
    this.configDataTable();
    this.filterDataOnChange();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Configuración del observable para escuchar cambios en las fechas
  private setupDateChangeObservable() {
    this.dateChangeSubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      debounceTime(1200),
      distinctUntilChanged((prev, curr) =>
        prev.from === curr.from && prev.to === curr.to
      ),
      switchMap(({ from, to }) => {
        return this.billService.getBillsWithProviders(223, from, to);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (response: BillViewOwner[]) => {
        this.bills = response;
        this.loadBillsFiltered();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
        this.isLoading = false;
      }
    });
  }
  loadBillsFiltered() {
    const dataTable = $('#myTable').DataTable();
    dataTable.clear().rows.add(this.bills).draw();
  }
  // Cargar fechas por defecto (último mes hasta hoy)
  loadDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.fechaHasta = `${yyyy}-${mm}-${dd}`;
    this.maxDateTo = `${yyyy}-${mm}-${dd}`;

    const past = new Date();
    past.setMonth(past.getMonth() - 1);
    const pastyyyy = past.getFullYear();
    const pastmm = String(past.getMonth() + 1).padStart(2, '0');
    const pastdd = String(past.getDate()).padStart(2, '0');
    this.fechaDesde = `${pastyyyy}-${pastmm}-${pastdd}`;

    this.filterDataOnChange();
  }

  filterDataOnChange() {
    this.dateChangeSubject.next({ from: this.fechaDesde, to: this.fechaHasta });
  }

  // Exportar a PDF
  exportToPDF(): void {
    const doc = new jsPDF();

    const pageTitle = 'Listado de Gastos';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);

    doc.text(`Fechas: Desde ${moment(this.fechaDesde).format('DD/MM/YYYY')} hasta ${moment(this.fechaHasta).format('DD/MM/YYYY')}`, 15, 20);

    const table = $('#myTable').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();

    const pdfData = filteredData.map(bill => [
      bill.category.description,
      bill.providerName,
      bill.expenseType === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : bill.expenseType,
      bill.description,
      `$${bill.amount}`,
      moment(bill.expenseDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
    ]);

    let pageCount = 0;

    (doc as any).autoTable({
      head: [['Categoría', 'Proveedor', 'Tipo de Gasto', 'Descripción', 'Monto', 'Fecha']],
      body: pdfData,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
      didDrawPage: function (data: any) {
        pageCount++;
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();

        doc.setFontSize(10);
        const text = `Página ${pageCount}`;
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageSize.width / 2) - (textWidth / 2), pageHeight - 10);
      }
    });

    doc.save('listado_gastos.pdf');
  }

  // Exportar a Excel
  exportToExcel(): void {
    const table = $('#myTable').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();

    const excelData = filteredData.map(bill => ({
      'Categoría': bill.category.description,
      'Proveedor': bill.providerName,
      'Tipo de Gasto': bill.expenseType === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : bill.expenseType,
      'Descripción': bill.description,
      'Monto': `$${bill.amount}`,
      'Fecha': moment(bill.expenseDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Listado de Gastos');

    XLSX.writeFile(workbook, 'listado_gastos.xlsx');
  }

  // Actualizar la tabla DataTable con los nuevos datos
  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix();
    console.log(this.bills);
    if ($.fn.DataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().clear().destroy();
    }

    this.table = $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [5, 'desc'],
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.bills,

      columns: [
        {
          data: 'category.description',
          title: 'Categoría',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'providerName',
          title: 'Proveedor',
          className: 'align-middle',
        },
        {
          data: 'expenseType',
          title: 'Tipo de Gasto',
          className: 'align-middle',
          render: function (data) {
            return `<div>${data === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : data}</div>`
          }
        },
        {
          data: 'description',
          title: 'Descripción',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'amount',
          title: 'Monto',
          className: 'align-middle',
          render: (data) => `<div>$${data}</div>`
        },
        {
          data: 'expenseDate',
          title: 'Fecha',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          title: "Opciones",
          data: null,
          orderable: false,
          className: 'text-center',
          render: function (data, type, row) {
            return `
              <div class="text-center">
                <div class="btn-group">
                  <div class="dropdown">
                    <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                    <ul class="dropdown-menu">
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item btn-view" style="cursor: pointer">Ver más</a></li>
                    </ul>
                  </div>
                </div>
              </div>`;
          }
        }

      ],
      dom:
        '<"mb-3"t>' +
        '<"d-flex justify-content-between"lp>',

      language: {
        lengthMenu:
          `<select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles',
        loadingRecords: "Cargando...",
        processing: "Procesando..."
      }
    })

    // Configuración de botones de exportación

    $('#myTable tbody').on('click', '.btn-view', (event) => {
      const row = this.table.row($(event.currentTarget).parents('tr'));
      const rowData = row.data();
      if (rowData) {
        this.viewBillDetails(rowData.expenseId);
      }
      
    });
    
  }
  viewBillDetails(id: any) {
    console.log("ID de la expensa:", id);
    this.expenseViewService.getById(id).subscribe({
      next: (expense) => {
        this.selectedExpense = expense;
        this.cdRef.detectChanges();
        console.log("Detalles de la expensa:", expense);
        // Aquí puedes activar el modal más adelante si deseas
        const modalElement = document.getElementById('expenseModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      },
      error: (err) => {
        console.error("Error al obtener los detalles de la expensa:", err);
        // Aquí puedes manejar el error, como mostrar un mensaje en la UI
      }
    });
  }
}