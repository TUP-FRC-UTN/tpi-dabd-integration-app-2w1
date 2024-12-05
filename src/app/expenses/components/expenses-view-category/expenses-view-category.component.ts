import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/expensesCategoryServices/category.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import 'jspdf-autotable';
import { ExpensesViewCategoryDetailsComponent } from '../expenses-view-category-details/expenses-view-category-details.component';
import { ExpensesEditCategoryComponent } from "../expenses-edit-category/expenses-edit-category.component";
import { ExpenseRegisterCategoryComponent } from "../expenses-register-category/expenses-register-category.component";
import { ExpensesStateCategoryNgSelectComponent } from "../expenses-state-category-ng-select/expenses-state-category-ng-select.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Shepherd from 'shepherd.js';
import { Subscription } from 'rxjs';
import { TutorialService } from '../../../common/services/tutorial.service';

@Component({
  selector: 'app-expenses-view-category',
  standalone: true,
  imports: [CommonModule, FormsModule,
    ExpensesViewCategoryDetailsComponent,
    ExpensesEditCategoryComponent,
    ExpenseRegisterCategoryComponent, ExpensesStateCategoryNgSelectComponent],
  providers: [CategoryService],
  templateUrl: './expenses-view-category.component.html',
  styleUrl: './expenses-view-category.component.scss',
})
export class ExpensesViewCategoryComponent implements OnInit, OnDestroy {
  searchTerm: any;
  table: any;

  constructor(private cdRef: ChangeDetectorRef, private modalNG: NgbModal, private tutorialService: TutorialService) {
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
    });
  }
  private readonly categoryService = inject(CategoryService);

  selectedStates: any[] = []
  categorySelected: Category = new Category();
  category: Category[] = [];
  filterCategory: Category[] = [];
  expenseCategory: Category = new Category();
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  filters = {
    categoryOrProviderOrExpenseType: '',
    expenseTypes: '',
  };

  ngOnInit(): void {
    this.configDataTable();
    this.filterData();

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  ngOnDestroy(): void {
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
      title: 'Tabla para gestionar gastos',
      text: 'Acá puede ver todos los gastos con su correspondiente fecha, estado y categoría. También tiene un botón de acciones que le permitirá ver más información de un gasto o poder editarlo.',
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
      text: 'Desde acá podrá filtrar los gastos por estado y realizar una búsqueda en todo el listado. También puede exportar los gastos a Excel o PDF, o borrar los filtros aplicados con el botón de basura.', attachTo: {
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
      id: 'subject-step',
      title: 'Añadir',
      text: 'Haciendo click en este botón puede acceder a la página de alta de gastos. Acá puede crear un nuevo gasto con sus datos correspondientes.', attachTo: {
        element: '#addExpense',
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

  // Alert Templates
  showSuccessAlert(message: string) {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
    });
  }
  onStateChange() {
    this.loadCategory()
  }

  showErrorAlert(message: string) {
    return Swal.fire({
      title: '¡Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#f44336',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      }
    });
  }
  loadAlertAndFilter(msg: string) {
    this.showSuccessAlert(msg)
    this.filterData()
  }

  showDeleteConfirmation() {
    return Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        cancelButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      }
    });
  }



  filterData() {
    this.categoryService.getCategory().subscribe({
      next: (filteredCategory) => {
        this.category = filteredCategory;
        this.loadCategory();
        console.log(this.category)
      },
      error: (error) => {
        this.showErrorAlert('Error al filtrar las categorías');
        console.error('Error al filtrar las categorías:', error);
      }
    });
  }
  clearFiltered() {
    this.selectedStates = [];
    this.loadCategory();
  }
  loadCategory() {
    const dataTable = $('#myTable').DataTable();
    let categoriasFiltered = this.filteredByState(this.selectedStates)
    dataTable.clear().rows.add(categoriasFiltered).draw();
  }
  filteredByState(selectedStates: any[]): Category[] {
    console.log(selectedStates);
    if (selectedStates.length === 0) {
      return this.category;
    }

    return this.category.filter(m => {
      return selectedStates.some(state => state.description === m.state);
    });
  }

  onSearch(event: any) {
    const searchValue = event.target.value;

    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }




  // Export functions
  exportToExcel() {
    try {
      const data = this.category.map(item => ({
        Categoría: item.description,
        Estado: item.state,
        'Última Actualización': moment(item.lastUpdatedDatetime).format('DD/MM/YYYY')
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Categorías');

      XLSX.writeFile(wb, `${moment(new Date()).format('DD/MM/YYYY')}_listado_categorias.xlsx`);


    } catch (error) {
      this.showErrorAlert('Error al exportar a Excel');
      console.error('Error al exportar a Excel:', error);
    }
  }

  exportToPDF() {
    try {
      const doc = new jsPDF();

      const tableData = this.category.map(item => [
        item.description,
        item.state,
        moment(item.lastUpdatedDatetime).format('DD/MM/YYYY')
      ]);

      (doc as any).autoTable({
        head: [['Categoría', 'Estado', 'Última Actualización']],
        body: tableData,
      });

      doc.save(`${moment(new Date()).format('DD/MM/YYYY')}_listado_categorias.pdf`);


    } catch (error) {
      this.showErrorAlert('Error al exportar a PDF');
      console.error('Error al exportar a PDF:', error);
    }
  }

  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'YYYY-MM-DD').unix();

    if ($.fn.DataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().clear().destroy();
    }

    this.table = $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      lengthMenu: [5, 10, 25, 50],
      pageLength: 5,
      data: this.category,
      columns: [
        {
          title: 'Fecha',
          data: 'lastUpdatedDatetime',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          title: 'Estado',
          data: 'state',
          className: 'align-middle',
          render: (data) => {
            if (data === 'Activo') {
              return `<span class="badge bg-success text-white rounded-pill px-3">${data}</span>`;
            } else {
              return `<span class="badge bg-secondary text-white rounded-pill px-3">${data}</span>`;
            }
          }
        },
        {
          title: 'Categoría',
          data: 'description',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          title: 'Acciones',
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
                            <li><a class="dropdown-item btn-view" style="cursor: pointer;">Ver más</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-edit" style="cursor: pointer;">Editar</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>`;
          }
        }
      ],
      dom: '<"mb-3"t><"d-flex justify-content-between"lp>',
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
        infoEmpty: 'Mostrando 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros totales)',
        loadingRecords: 'Cargando...',
        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles en la tabla',
      }
    });

    $('#myTable tbody').on('click', '.btn-view', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      if (rowData) {
        this.viewSelectedCategory(rowData);
      }
    });

    $('#myTable tbody').on('click', '.btn-edit', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      if (rowData) {
        this.editCategory(rowData);
      }
    });
  }


  editCategory(rowData: any) {
    this.categorySelected = rowData
    this.categoryService.getCategoryById(this.categorySelected.id).subscribe({
      next: (value: Category) => {
        this.categorySelected = value
      },
    })
    this.cdRef.detectChanges();
    const modalElement = this.modalNG.open(ExpensesEditCategoryComponent, { size: '', keyboard: false })
    modalElement.componentInstance.category = this.categorySelected
    modalElement.componentInstance.eventSucces.subscribe(() => {
      this.loadAlertAndFilter('Se actualizo la categoría con éxito');
    });
    modalElement.componentInstance.eventError.subscribe((errorMessage: string) => {
      this.showErrorAlert(errorMessage);
    });
  }
  viewSelectedCategory(rowData: any) {
    this.categorySelected = rowData
    this.cdRef.detectChanges();
    const modalElement = this.modalNG.open(ExpensesViewCategoryDetailsComponent, { size: '', keyboard: false })
    modalElement.componentInstance.category = this.categorySelected
    modalElement.result.then((result) => {
    }).catch((error) => {
      console.log('Modal dismissed with error:', error);
    });
  }
  addCategory() {
    const modalElement = this.modalNG.open(ExpenseRegisterCategoryComponent);
    modalElement.componentInstance.eventSucces.subscribe(() => {
      this.loadAlertAndFilter('Se registró la categoría con éxito');
    });
    modalElement.componentInstance.eventError.subscribe((errorMessage: string) => {
      this.showErrorAlert(errorMessage);
    });
  }

  handleEditSuccess() {
    this.showSuccessAlert('Categoría actualizada con éxito');
    this.filterData();
  }
  handleEditError(message: string) {
    this.showErrorAlert(message);
  }

}