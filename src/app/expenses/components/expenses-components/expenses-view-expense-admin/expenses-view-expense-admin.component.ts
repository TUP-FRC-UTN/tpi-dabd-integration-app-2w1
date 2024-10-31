import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Bill } from '../../../models/expenses-models/bill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//Imports para el DataTable
import moment from 'moment';
import 'bootstrap';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import * as XLSX from 'xlsx';
import { DistributionList } from '../../../models/expenses-models/distributionList';
import { Instalmentlist } from '../../../models/expenses-models/installmentList';
import { BillService } from '../../../services/expenses-services/billServices/bill.service';
import { ExpenseViewService } from '../../../services/expenses-services/expenseView/expenseView.service';
import { debounceTime, distinctUntilChanged, filter, finalize, mergeMap, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { ExpenseView } from '../../../models/expenses-models/expenseView';
import { ExpenseViewComponent } from '../expenses-view/expenses-view.component';

declare let bootstrap: any;

@Component({
  selector: 'app-view-gastos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpenseViewComponent],
  providers: [BillService,ExpenseViewService],
  templateUrl: './expenses-view-expense-admin.component.html',
  styleUrl: './expenses-view-expense-admin.component.scss'
})
export class ViewGastosAdminComponent implements OnInit {

  dateFrom: string = '';
  dateTo: string = '';
  maxDateTo: string = '';
  distributionList: DistributionList[] = [];
  installmentList: Instalmentlist[] = [];
  failedBillId: number = 0;
  isLoading = false;
  table: any;
  searchTerm: string = '';
  private dateChangeSubject = new Subject<{ from: string, to: string }>();
  private unsubscribe$ = new Subject<void>();
  @ViewChild('modalNoteCredit') modalNoteCredit!: ElementRef;
  @ViewChild('modalError') modalError!: ElementRef;
  @ViewChild('modalConfirmDelete') modalConfirmDelete!: ElementRef;


  bills: Bill[] = [];
  filterBills: Bill[] = [];
  categories: string[] = [];
  providers: string[] = [];
  expenseTypes: string[] = [];
  selectedExpense: ExpenseView | null = null;
  constructor(
    private cdRef: ChangeDetectorRef,
    private billService: BillService,
    private expenseViewService: ExpenseViewService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDates();
    this.setupDateChangeObservable();
    this.configDataTable();
    this.filterDataOnInit();
  }
  onSearch(event: any) {
    const searchValue = event.target.value;

    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }

  filterDataOnInit() {
    this.isLoading = true;  // Activar spinner
    this.billService.getBillsByDateRange(this.dateFrom, this.dateTo).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      })
    ).subscribe({
      next: (response: Bill[]) => {
        this.bills = response;
        this.loadBillsFiltered();
      },
      error: (error) => {
        console.error('Error fetching initial bills:', error);
      }
    });
  }
  redirect(path: string) {
    this.router.navigate([path]);
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setupDateChangeObservable() {
    // Set loading true immediately when method is called
    this.isLoading = true;
    this.cdRef.detectChanges();

    this.dateChangeSubject.pipe(
      tap(() => {
        // Set loading true on each new emission
        this.isLoading = true;
        this.cdRef.detectChanges();
      }),
      debounceTime(3000),
      distinctUntilChanged((prev, curr) =>
        prev.from === curr.from && prev.to === curr.to
      ),
      switchMap(({ from, to }) => {
        this.isLoading = false
        return this.billService.getBillsByDateRange(from, to);
      }),
      finalize(() => {
        // Set loading false when the observable completes or errors
        this.isLoading = false;
        this.cdRef.detectChanges();
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (response: Bill[]) => {
        this.bills = response;
        this.loadBillsFiltered();
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
      }
    });
  }

  // Exportar a PDF
  exportToPDF(): void {
    const doc = new jsPDF();

    const pageTitle = 'Listado de Gastos';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);

    doc.text(`Fechas: Desde ${moment(this.dateFrom).format('DD/MM/YYYY')} hasta ${moment(this.dateTo).format('DD/MM/YYYY')}`, 15, 20);

    const table = $('#myTable').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();

    const pdfData = filteredData.map(bill => {
      const category = bill.category || 'Sin categoría';
      const provider = bill.provider || 'Sin proveedor';
      return [
        bill.expenseType === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : bill.expenseType,
        category,
        provider,
        moment(bill.expenseDate).format('DD/MM/YYYY'),
        `$${bill.amount}`
      ];
    });

    let pageCount = 0;

    (doc as any).autoTable({
      head: [['Tipo de Gasto', 'Categoría', 'Proveedor', 'Fecha', 'Monto']],
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
  
    const excelData = filteredData.map(bill => {
      const category = bill.category || 'Sin categoría';
      const provider = bill.provider || 'Sin proveedor';
      return {
        'Tipo de Gasto': bill.expenseType === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : bill.expenseType,
        'Categoría': category,
        'Proveedor': provider,
        'Fecha': moment(bill.expenseDate).format('DD/MM/YYYY'),
        'Monto': `$${bill.amount}`
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Listado de Gastos');
  
    XLSX.writeFile(workbook, 'listado_gastos.xlsx');
  }

  filterDataOnChange() {
    this.dateChangeSubject.next({ from: this.dateFrom, to: this.dateTo });
  }

  loadDates() {
    const today = moment();
    this.dateTo = today.format('YYYY-MM-DD');
    this.maxDateTo = this.dateTo;
    this.dateFrom = today.subtract(1, 'month').format('YYYY-MM-DD');
  }
  confirmDeleteExpense() {
    this.deleteBill(this.failedBillId)
    this.closeModal(this.modalConfirmDelete)
  }
  deleteBill(id: number) {
    this.billService.deleteLogicBill(id).subscribe({
      next: () => {
        console.log(`Gasto con ID ${id} eliminada con éxito.`);
        Swal.fire({
          title: '¡Expensa borrada!',
          text: 'La expensa se ha eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          background: '#ffffff',
          customClass: {
            title: 'text-xl font-medium text-gray-900',
            htmlContainer: 'text-sm text-gray-600',  // Changed from 'content' to 'htmlContainer'
            confirmButton: 'px-4 py-2 text-white rounded-lg',
            popup: 'swal2-popup'
          }
        });
        this.filterDataOnChange();
      },
      error: (error) => {
        console.error(`Error al eliminar la factura con ID ${id}:`, error);
        if (error.error.status == 409 && error.error.message == "Expense has related bill installments") {
          this.openModal(this.modalNoteCredit)
        } else {
          this.openModal(this.modalError)
        }
      }
    });
  }

  openModal(modal: ElementRef | HTMLDivElement) {
    const element = modal instanceof ElementRef ? modal.nativeElement : modal;
    element.style.display = 'block';
    element.classList.add('show');
    document.body.classList.add('modal-open');
    this.cdRef.detectChanges();
  }

  loadBillsFiltered() {
    const dataTable = $('#myTable').DataTable();
    dataTable.clear().rows.add(this.bills).draw();
  }
  closeModal(modal: ElementRef | HTMLDivElement) {
    const element = modal instanceof ElementRef ? modal.nativeElement : modal;
    element.style.display = 'none';
    element.classList.remove('show');
    document.body.classList.remove('modal-open');
    this.cdRef.detectChanges();
    this.loadBillsFiltered();
  }

  deleteWithNoteCredit() {
    this.billService.createNoteOfCredit(this.failedBillId).subscribe({
      next: () => {
        console.log(`Gasto con ID ${this.failedBillId} se le creó nota de crédito con éxito`);
        this.filterDataOnChange();
        alert('Se realizó la nota de crédito con éxito');
        this.closeModal(this.modalNoteCredit);
      },
      error: (error) => {
        console.error(`Error al realizar la nota de crédito del gasto con ID ${this.failedBillId}:`, error);
        alert('No se pudo realizar la nota de crédito con éxito');
      }
    });
  }
  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix();

    if ($.fn.DataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().clear().destroy();
    }

    this.table = $('#myTable').DataTable({
      // Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [4, 'desc'], // Ordenar por fecha por defecto
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.bills,

      // Columnas de la tabla
      columns: [
        // {
        //   data: 'id',
        //   visible: false
        // },
        {
          data: 'category',
          title: 'Categoría',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'provider',
          title: 'Proveedor',
          className: 'align-middle',
          render: function (data) {
            return `<div>empresa anonima</div>`
          }
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
                      <li><a class="dropdown-item btn-edit" style="cursor: pointer">Editar</a></li>
                      <li><a class="dropdown-item btn-delete" style="cursor: pointer">Eliminar</a></li>
                    </ul>
                  </div>
                </div>
              </div>`;
          }
        }
      ],

      // Configuración del DOM y diseño
      dom:
        '<"mb-3"t>' +                           // Tabla
        '<"d-flex justify-content-between"lp>', // Paginación

      // Configuración del lenguaje
      language: {
        lengthMenu: `
          <select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: "Mostrando 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        },
        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles',
        loadingRecords: "Cargando...",
        processing: "Procesando..."
      }
    });

    // Event handlers
    $('#myTable tbody').on('click', '.btn-view', (event) => {
      const row = this.table.row($(event.currentTarget).parents('tr'));
      const rowData = row.data();
      if (rowData) {
        this.viewBillDetails(rowData.id);
      }
      
    });

    $('#myTable tbody').on('click', '.btn-edit', (event) => {
      const row = this.table.row($(event.currentTarget).parents('tr'));
      const rowData = row.data();
      if (rowData) {
        this.editBill(rowData.id)
      }
    });

    $('#myTable tbody').on('click', '.btn-delete', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      this.failedBillId = rowData.id;
      this.openModal(this.modalConfirmDelete);
    });
  }
  editBill(id: any) {
    console.log(id); // Esto mostrará el id en la consola
    this.router.navigate(['/registerExpense', id]); // Navega a /viewExpenseAdmin/id
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





