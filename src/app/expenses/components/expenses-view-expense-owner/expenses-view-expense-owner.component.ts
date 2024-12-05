import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import 'datatables.net';
import 'datatables.net-bs5';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import 'bootstrap';
import $ from 'jquery';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BillViewOwner } from '../../models/bill-view-owner.model';
import { BillViewOwnerService } from '../../services/viewOwnerServices/bill-view-owner.service';
import { ExpenseViewService } from '../../services/expenseView/expenseView.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, takeUntil } from 'rxjs/operators';
import { ExpenseView } from '../../models/expenseView';
import { ExpenseViewComponent } from '../expenses-view/expenses-view.component';
import { ExpensesFiltersComponent } from "../expenses-filters/expenses-filters.component";
import { Category } from '../../models/category';
import { Provider } from '../../models/provider';
import { Bill } from '../../models/bill';
import { ExpenseType } from '../../models/expenseType';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../common/services/tutorial.service';

// declare let bootstrap: any;
@Component({
  selector: 'app-view-owner-expense',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ExpenseViewComponent, ExpensesFiltersComponent],
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
  selectedCategories: Category[] = [];
  selectedProviders: Provider[] = [];
  selectedType: ExpenseType[] = [];
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(
    private billService: BillViewOwnerService,
    private cdRef: ChangeDetectorRef,
    private expenseViewService: ExpenseViewService,
    private modalNG: NgbModal,
    private tutorialService: TutorialService
  ) {
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        canClickTarget: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
      },
      keyboardNavigation: false,

      useModalOverlay: true,
    })
  }

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

    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  startTutorial() {
    if (this.tour) {
      this.tour.complete();
    }
    this.tour.addStep({
      id: 'table-step',
      title: 'Tabla de gastos',
      text: 'Acá puede ver todos sus gastos con su correspondiente fecha, tipo, categoría, proveedor y monto. También tiene un botón ver más para poder acceder a información más detallada.',
      attachTo: {
        element: '#myTable',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar los gastos seleccionando una fecha de inicio y otra de fin, y realizar una búsqueda en todo el listado. También puede exportar los gastos a Excel o PDF, o borrar los filtros aplicados con el botón de basura.', attachTo: {
        element: '#simpleFilters',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]

    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar clickear el embudo para acceder a filtros avanzados, también puede exportar los gastos a Excel o PDF, o borrar los filtros aplicados con el botón de basura.', attachTo: {
        element: '#filters',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Finalizar',
          action: this.tour.complete
        }
      ]

    });

    this.tour.start();
  }

  // loadBillsFilter() {
  //   const dataTable = $('#myTable').DataTable();
  //   let billsFiltered = this.fileredByCategiries(this.bills.slice());
  //   billsFiltered = this.fileredByProviders(billsFiltered);
  //   dataTable.clear().rows.add(billsFiltered).draw();
  // }
  filteredByCategiries(bills: BillViewOwner[]): BillViewOwner[] {
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(category => category.id);
      return bills.filter(bill => selectedCategoryIds.includes(bill.categoryId)); // Filtrar solo los que tienen un id que coincida
    }
    return bills;
  }
  filteredByProviders(bills: BillViewOwner[]): BillViewOwner[] {
    if (this.selectedProviders && this.selectedProviders.length > 0) {
      const selectedProviderIds = this.selectedProviders.map(provider => provider.id); // Extraer los ids de los proveedores seleccionadas
      return bills.filter(bill => selectedProviderIds.includes(bill.providerId)); // Filtrar solo los que tienen un id que coincida
    }
    return bills;
  }
  filteredByType(bills: BillViewOwner[]): BillViewOwner[] {
    if (this.selectedType && this.selectedType.length > 0) {
      const selectedTypeIds = this.selectedType.map(type => type.id); // Extraer los ids de los tipo seleccionadas
      return bills.filter(bill => selectedTypeIds.includes(bill.expenseType)); // Filtrar solo los que tienen un id que coincida
    }
    return bills;
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
        return this.billService.getBillsWithProviders(from, to);
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
    this.isLoading = true
    const dataTable = $('#myTable').DataTable();
    //this.bills es la lista filtrada por fecha desde la API, esa no se toca
    let billsFiltered = this.filteredByType(this.bills.slice());
    billsFiltered = this.filteredByCategiries(billsFiltered);
    billsFiltered = this.filteredByProviders(billsFiltered);
    dataTable.clear().rows.add(billsFiltered).draw();
    this.isLoading = false
  }
  clearFiltered() {

    this.selectedCategories = [];
    this.selectedProviders = [];
    this.selectedType = [];
    this.loadBillsFiltered();
    this.loadDates();
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
      bill.categoryDescription,
      bill.providerDescription,
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
    const dateFromFormatted = moment(this.fechaDesde).format('YYYY-MM-DD');
    const dateToFormatted = moment(this.fechaHasta).format('YYYY-MM-DD');
    const fileName = `${dateFromFormatted}_${dateToFormatted}_listado_gastos.pdf`;
    doc.save(fileName);
  }

  // Exportar a Excel
  exportToExcel(): void {
    const table = $('#myTable').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();
    const excelData = filteredData.map(bill => ({
      'Categoría': bill.categoryDescription,
      'Proveedor': bill.providerDescription,
      'Tipo de Gasto': bill.expenseType === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : bill.expenseType,
      'Descripción': bill.description,
      'Monto': `$${bill.amount}`,
      'Fecha': moment(bill.expenseDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Listado de Gastos');

    const dateFromFormatted = moment(this.fechaDesde).format('YYYY-MM-DD');
    const dateToFormatted = moment(this.fechaHasta).format('YYYY-MM-DD');
    const fileName = `${dateFromFormatted}_${dateToFormatted}_listado_gastos.xlsx`;

    XLSX.writeFile(workbook, fileName);
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
      order: [0, 'desc'],
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.bills,

      columns: [
        {
          data: 'expenseDate',
          title: 'Fecha',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
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
          data: 'categoryDescription',
          title: 'Categoría',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'providerDescription',
          title: 'Proveedor',
          className: 'align-middle',
        },
        {
          data: 'amount',
          title: 'Monto',
          className: 'align-middle text-end',
          render: (data) => {
            let formattedAmount = new Intl.NumberFormat('es-AR', {
              minimumFractionDigits: 2
            }).format(data);
            return `<div class="text-end">$ ${formattedAmount} </div>`;
          }
        },
        {
          title: "Acción",
          data: null,
          orderable: false,
          className: 'text-center',
          render: function (data, type, row) {
            return `
              <div class="text-center">
                <div class="btn-group">
                  <div class="dropdown">
                    <button type="button" class="btn btn-light border border-2 btn-view">Ver más</button>
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
            <option value="5">5</option>
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
        const modal = this.modalNG.open(ExpenseViewComponent, { size: 'lg', keyboard: false });
        modal.componentInstance.expense = expense;
        modal.result.then((result) => {

        }).catch((error) => {
          console.log('Modal dismissed with error:', error);
        });
      },
      error: (err) => {
        console.error("Error al obtener los detalles de la expensa:", err);
        // Aquí puedes manejar el error, como mostrar un mensaje en la UI
      }
    });
  }
}

