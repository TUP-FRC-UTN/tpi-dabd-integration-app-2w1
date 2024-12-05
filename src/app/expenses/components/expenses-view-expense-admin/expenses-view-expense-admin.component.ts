import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Bill } from '../../models/bill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import * as XLSX from 'xlsx';
import { DistributionList } from '../../models/distributionList';
import { Instalmentlist } from '../../models/installmentList';
import { BillService } from '../../services/billServices/bill.service';
import { ExpenseViewService } from '../../services/expenseView/expenseView.service';
import { debounceTime, distinctUntilChanged, filter, finalize, mergeMap, of, Subject, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { ExpenseView } from '../../models/expenseView';
import { ExpenseViewComponent } from '../expenses-view/expenses-view.component';
import { Category } from '../../models/category';
import { ExpenseCategoriesNgSelectComponent } from "../expense-categories-ng-select/expense-categories-ng-select.component";
import { ExpenseProvidersNgSelectComponent } from "../expense-providers-ng-select/expense-providers-ng-select.component";
import { Provider } from '../../models/provider';
import { ExpensesFiltersComponent } from "../expenses-filters/expenses-filters.component";
import { ExpenseType } from '../../models/expenseType';
import { RoutingService } from '../../../common/services/routing.service';
import { TutorialService } from '../../../common/services/tutorial.service';
import Shepherd from 'shepherd.js';


@Component({
  selector: 'app-view-gastos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpenseViewComponent, ExpenseCategoriesNgSelectComponent, ExpenseProvidersNgSelectComponent, ExpensesFiltersComponent],
  providers: [BillService, ExpenseViewService],
  templateUrl: './expenses-view-expense-admin.component.html',
  styleUrl: './expenses-view-expense-admin.component.scss'
})
export class ViewGastosAdminComponent implements OnInit, OnDestroy {
  dateFrom: string = '';
  dateTo: string = '';
  maxDateTo: string = '';
  distributionList: DistributionList[] = [];
  installmentList: Instalmentlist[] = [];
  failedBillId: number = 0;
  isLoading = false;
  table: any;
  searchTerm: string = '';
  tour: Shepherd.Tour;
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
  tutorialSubscription = new Subscription();
  selectedCategories: Category[] = [];
  selectedProviders: Provider[] = [];
  selectedType: ExpenseType[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private billService: BillService,
    private expenseViewService: ExpenseViewService,
    private router: Router,
    private modalNG: NgbModal,
    private routerS: RoutingService,
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
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      keyboardNavigation: false,

      useModalOverlay: true,
    })
  }


  ngOnInit(): void {
    this.loadDates();
    this.setupDateChangeObservable();
    this.configDataTable();
    this.filterDataOnInit();

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

    // CÓDIGO PARA PREVENIR SCROLLEO DURANTE TUTORIAL
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const restoreScroll = () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };

    // Al empezar, lo desactiva
    this.tour.on('start', () => {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
    });

    // Al completar lo reactiva, al igual que al cancelar
    this.tour.on('complete', restoreScroll);
    this.tour.on('cancel', restoreScroll);
    
    this.tour.addStep({
      id: 'table-step',
      title: 'Listado de Gastos',
      text: 'Acá puede ver una lista completa de los gastos que se han realizado. Tambien se puede clickear para ver mas detalles, editar o eliminar.',
      attachTo: {
        element: '#expensesTable',
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
      id: 'filter-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar los gastos por nombre y fecha o desplegar los filtros avanzados para ordenar por tipo, categoria y proveedor. También puede exportar el listado a Excel o PDF, o borrar los filtros aplicados con el botón de basura.',
      attachTo: {
        element: '#filters',
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
      id: 'float-button-step',
      title: 'Agregar Gasto',
      text: 'Haciendo click en este botón puede acceder a la página de alta de gastos. Acá puede crear un nuevo gasto con sus datos correspondientes.',
      attachTo: {
        element: '#addButton',
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
        console.log(this.bills)
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

    const table = $('#expensesTable').DataTable();
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

    const dateFromFormatted = moment(this.dateFrom).format('YYYY-MM-DD');
    const dateToFormatted = moment(this.dateTo).format('YYYY-MM-DD');
    const fileName = `${dateFromFormatted}_${dateToFormatted}_listado_gastos.pdf`;
    doc.save(fileName);
  }

  // Exportar a Excel
  exportToExcel(): void {
    const table = $('#expensesTable').DataTable();
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

    const dateFromFormatted = moment(this.dateFrom).format('YYYY-MM-DD');
    const dateToFormatted = moment(this.dateTo).format('YYYY-MM-DD');
    const fileName = `${dateFromFormatted}_${dateToFormatted}_listado_gastos.xlsx`;

    XLSX.writeFile(workbook, fileName);
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
          icon: 'success',               // Icono de éxito
          title: 'Éxito',                // Título del mensaje
          text: 'Los cambios se guardaron correctamente', // Mensaje de confirmación
        })
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
    this.isLoading=true;
    const dataTable = $('#expensesTable').DataTable();
    let billsFiltered = this.filteredbyType(this.bills.slice());
    billsFiltered = this.filteredByCategiries(billsFiltered);
    billsFiltered = this.filteredByProviders(billsFiltered);
    dataTable.clear().rows.add(billsFiltered).draw();
    this.isLoading=false;
  }
  filteredByCategiries(bills: Bill[]): Bill[] {

    console.log(this.selectedCategories)
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(category => category.id); // Extraer los ids de las categorías seleccionadas
      return bills.filter(bill => selectedCategoryIds.includes(bill.categoryId)); // Filtrar solo los que tienen un id que coincida
    }
    return bills;
  }
  filteredByProviders(bills: Bill[]): Bill[] {

    if (this.selectedProviders && this.selectedProviders.length > 0) {
      const selectedProviderIds = this.selectedProviders.map(provider => provider.id as number); // Extraer los ids de las categorías seleccionadas
      return bills.filter(bill => selectedProviderIds.includes(bill.providerId)); // Filtrar solo los que tienen un id que coincida
    }
    return bills;
  }
  filteredbyType(bills: Bill[]): Bill[] {
    if (this.selectedType && this.selectedType.length > 0) {
      const selectedTypeIds = this.selectedType.map(type => type.id);
      return bills.filter(bill => selectedTypeIds.includes(bill.expenseType)); // Filtrar solo los que tienen un id que coincida
    }
    return bills;
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
        Swal.fire({
          icon: 'success',               // Icono de éxito
          title: 'Éxito',                // Título del mensaje
          text: 'Los cambios se guardaron correctamente', // Mensaje de confirmación
        })
        this.closeModal(this.modalNoteCredit);
      },
      error: (error) => {
        console.error(`Error al realizar la nota de crédito del gasto con ID ${this.failedBillId}:`, error);
        alert('No se pudo realizar la nota de crédito con éxito');
      }
    });
  }
  onSelectedCategoriesChange(): void {
    this.loadBillsFiltered()
    console.log(this.selectedCategories);
  }

  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix();

    if ($.fn.DataTable.isDataTable('#expensesTable')) {
      $('#expensesTable').DataTable().clear().destroy();
    }

    this.table = $('#expensesTable').DataTable({
      // Atributos de la tabla
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      order: [0, 'desc'], // Ordenar por fecha por defecto
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.bills,

      // Columnas de la tabla
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
          data: 'category',
          title: 'Categoría',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'provider',
          title: 'Proveedor',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          data: 'amount',
          title: 'Monto',
          className: 'align-middle text-end',
          render: (data) => {
            let formattedAmount = new Intl.NumberFormat('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(data);
            return `<div class="text-end">$ ${formattedAmount} </div>`;
          }
        },
        {
          title: "Acciones",
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
                      <li><a class="dropdown-item btn-view" style="cursor: pointer">Ver más</a></li>
                      <li><hr class="dropdown-divider"></li>
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
          <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: "Mostrando 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",

        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles',
        loadingRecords: "Cargando...",
        processing: "Procesando..."
      }
    });

    // Event handlers
    $('#expensesTable tbody').on('click', '.btn-view', (event) => {
      const row = this.table.row($(event.currentTarget).parents('tr'));
      const rowData = row.data();
      if (rowData) {
        this.viewBillDetails(rowData.id);
      }

    });

    $('#expensesTable tbody').on('click', '.btn-edit', (event) => {
      const row = this.table.row($(event.currentTarget).parents('tr'));
      const rowData = row.data();
      if (rowData) {
        this.editBill(rowData.id)
      }
    });

    $('#expensesTable tbody').on('click', '.btn-delete', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      this.failedBillId = rowData.id;
      this.openModal(this.modalConfirmDelete);
    });
  }
  clearFiltered() {

    this.selectedCategories = [];
    this.selectedProviders = [];
    this.selectedType = [];
    this.loadDates()
    this.filterDataOnChange()
  }
  editBill(id: any) {
    console.log(id); // Esto mostrará el id en la consola
    this.routerS.redirect('/main/expenses/register-expense/' + id, "Editar Gasto"); // Navega a /viewExpenseAdmin/ida
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





