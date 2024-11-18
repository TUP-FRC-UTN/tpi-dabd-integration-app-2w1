import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PutCategoryDTO } from '../../models/putCategoryDTO';
import { CategoriaService } from '../../services/categoria.service';
import { ProductCategory } from '../../models/product-category';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersMockIdService } from '../../../common-services/users-mock-id.service';
import { ProductService } from '../../services/product.service';
import * as XLSX from 'xlsx';
import { NgSelectModule } from '@ng-select/ng-select';

declare var bootstrap: any; // Añadir esta declaración al principio
@Component({
  selector: 'app-iep-categories-list',
  templateUrl: './iep-categories-list.component.html',
  styleUrls: ['./iep-categories-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, NgSelectModule],
  standalone: true
})
export class IepCategoriesListComponent implements OnInit {
  selectedStatuses: string[] = [];
  statusOptions = [
    { id: 'active', name: 'Activo' },
    { id: 'inactive', name: 'Inactivo' }
  ];

  private usersMockService: UsersMockIdService;
  private categoryService: CategoriaService;
  categories: ProductCategory[] = [];
  private table: any;
  filteredData: ProductCategory[] = [];
  categoryToDelete: number | undefined;
  idCategoryToEdit: number | null = null;
  categoryToEdit: ProductCategory | undefined;
  descrCategoryToEdit: string = '';
  categoryToCreate: string = '';
  private productService: ProductService;
  errorMessage: string = '';
  idUser: number = 0;
  loading: boolean = true;

  constructor(
    categoryService: CategoriaService,
    usersMockService: UsersMockIdService,
    productService: ProductService
  ) {
    this.usersMockService = usersMockService;
    this.categoryService = categoryService;
    this.productService = productService;
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    const pageTitle = 'Listado de Categorias';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);
    
    const dataToExport = this.categories.map((category) => [
      category.category,
      category.discontinued ? 'Inactivo' : 'Activo' 
    ]);

    (doc as any).autoTable({
      head: [['Categoría', 'Estado']],
      body: dataToExport,
      startY: 20,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });
    doc.save(`${this.getFormattedDate()}_Listado_De_Categorías.pdf`);
}

exportToExcel(): void {
  // Transformamos los datos antes de crear el Excel
  const dataToExport = this.categories.map(category => ({
      Categoría: category.category,
      Estado: category.discontinued ? 'Inactivo' : 'Activo'
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorías');
  XLSX.writeFile(workbook, `${this.getFormattedDate()}_Listado_De_Categorías.xlsx`);
}

  getFormattedDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  ngOnInit() {
    this.loadCategories();
  }

  private refreshDataTable(): void {
    if (this.table) {
      this.table.clear();
      this.table.rows.add(this.filteredData);
      this.table.draw();
    } else {
      this.initializeDataTable();
    }
  }

  filterData(event?: any): void {
    const searchTerm = event?.target?.value?.toLowerCase().trim() || 
      (document.getElementById('searchTerm') as HTMLInputElement)?.value?.toLowerCase().trim() || '';
  
    this.filteredData = this.categories.filter(cat => {
      const matchesSearch = cat.category.toLowerCase().includes(searchTerm);
  
      // Filtrado por estados seleccionados en ngSelect
      const matchesStatus = this.selectedStatuses.length === 0 || 
        this.selectedStatuses.includes(cat.discontinued ? 'Inactivo' : 'Activo');
  
      return matchesSearch && matchesStatus;
    });
  
    this.refreshDataTable();
  }
  

  cleanFilters(): void {
    // Limpia los valores de los inputs de texto en el DOM
    const textInputs = document.querySelectorAll('input.form-control');
    textInputs.forEach(input => (input as HTMLInputElement).value = '');
  
    // Reinicia el combo de estados
    this.selectedStatuses = [];
  
    // Restablece la lista filtrada a todas las categorías
    this.filteredData = [...this.categories];
    this.refreshDataTable();
  }
  


 
  initializeDataTable() {
    if (this.table) {
      this.table.destroy();
    }

    this.table = $('#categoryTable').DataTable({
       //Atributos de la tabla
       paging: true,
       searching: true,
       ordering: true,
       lengthChange: true,
       order: [0, 'asc'],
       lengthMenu: [5, 10, 25, 50],
       pageLength: 5,
       data: this.categories,
      columns: [
        {
          data: 'discontinued',
          title: 'Estado',
          className: 'text-center', // solo esta clase para alinear el texto a la izquierda
                  render: (data: any) => {
                    let colorClass;
                    let text;
                        
                    if (data) {
                      colorClass = '#dc3545'; // Rojo para "Inactivo"
                      text = 'Inactivo';
                    } else {
                      colorClass = '#198754'; // Verde para "Activo"
                      text = 'Activo';
                    }
                        
                    return `<span class="badge border rounded-pill" style="background-color: ${colorClass};">${text}</span>`;
                  }
        
             },
                {
                  data: 'category',
                  title: 'Categoría',
                  className: 'align-middle'
                }
          ,
          {
            data: null,
            title: 'Acciones',
            className: 'align-middle text-center', // Alinea el título al centro          orderable: false,
            render: (data: any) => {
              let deleteButtonClass = '';
              if (data.discontinued) {
                deleteButtonClass = 'disabled'; // Agregar clase "disabled" al botón de eliminar
              }
              return `
                <div class="text-center">
                  <div class="btn-group">
                    <div class="dropdown">
                      <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item edit-btn" href="#" data-id="${data.id}" 
                           data-bs-toggle="modal" data-bs-target="#categoriaModal">Editar</a></li>
                        <li><a class="dropdown-item delete-btn ${deleteButtonClass}" href="#" data-id="${data.id}">Eliminar</a></li>
                      </ul>
                    </div>
                  </div>
                </div>`;
            }
          }
      ],
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      language: {
        lengthMenu: `<select class="form-select">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>`,
        zeroRecords: "No se encontraron categorías",
        loadingRecords: "Cargando...",
        processing: "Procesando...",
        emptyTable: "No se encontraron categorías",
        info: "Mostrando _START_ a _END_ de _TOTAL_ categorías",
        infoEmpty: "Mostrando 0 a 0 de 0 categorías",
        infoFiltered: "(filtrado de _MAX_ categorías totales)",
        search: 'Buscar:',
      }
    });

    this.setupTableListeners();
  }


  showConfirmDeleteModal() {
    // Obtener el modal de Bootstrap
    const modalElement = document.getElementById('confirmDeleteModal');
    const confirmButton = document.getElementById('confirmDeleteButton');
  
    if (modalElement && confirmButton) {
      // Crear una instancia del modal de Bootstrap
      const modal = new bootstrap.Modal(modalElement);
  
      // Mostrar el modal
      modal.show();
  
      // Lógica de confirmación para eliminar la categoría
      confirmButton.onclick = () => {
        this.deleteCategory(); // Llamar a la función de eliminación
        modal.hide(); // Cerrar el modal después de eliminar
      };
    }
  }

  showSuccessDeleteAlert() {
    Swal.fire({
      title: 'Categoría eliminada',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.loadCategories();
      this.closeModal();
    });
  }

  showFailureDeleteAlert() {
    Swal.fire({
      title: 'Error al eliminar categoría',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.closeModal();
    });
  }

  showFailureCreateAlert() {
    Swal.fire({
      title: 'Error al crear categoría',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      text: this.errorMessage,
    }).then(() => {
      this.closeModal();
    });
  }

  showSuccessEditAlert() {
    Swal.fire({
      title: 'Categoría editada',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.loadCategories();
      this.closeModal();

    });
  }

  showFailureEditAlert() {
    Swal.fire({
      title: 'Error al editar categoría',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.closeModal();
    });
  }

  showSuccessCreateAlert() {
    Swal.fire({
      title: 'Categoría creada',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.loadCategories();
      this.closeModal();

    });
  }

  deleteCategory() {
    if (this.categoryToDelete === null || this.categoryToDelete === undefined) {
      console.error('No se ha seleccionado una categoría para eliminar');
      return;
    }
    this.categoryService.deleteCategory(
      this.categoryToDelete, this.usersMockService.getMockId()).subscribe({
        next: (response) => {
          console.log('Categoría eliminada:', response);
          this.showSuccessDeleteAlert();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
        },
      });
  }

  showProductsInCategoryAlert(products: any) {
    Swal.fire({
      title: 'Productos en categoría',
      html: `
        <p>La categoría que intentas eliminar tiene productos asociados.</p>
        <p>Por favor, elimina los productos antes de continuar.</p>
        <ul>
          ${products.map((product: any) => `<li>${product.name}</li>`).join('')}
        </ul>
      `,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }


  searchForProductsWithCategory(): any {
    /* this.productService.getDtoProducts(this.categoryToDelete).subscribe({
       next: (products) => {
         console.log('Productos con categoría:', products);
         if(products.length > 0){
           this.showProductsInCategoryAlert(products);
           this.closeModal();
         }else{
           this.deleteCategory();
         }
 
       },
       error: (error) => {
         console.error('Error al buscar productos por categoría:', error);
       },
   });*/
    this.deleteCategory();

  }

  updateCategory() {
    if (this.idCategoryToEdit === null || !this.categoryToEdit) {
      this.categoryService.postCategory(
        this.descrCategoryToEdit, this.usersMockService.getMockId()).subscribe({
          next: (response) => {
            console.log('Pasa:', response);
            this.showSuccessCreateAlert();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error al registrar categoría:', error);
            if (error.error.message === '400 Category already exists') {
              this.errorMessage = 'La categoría que intenta ingresar ya existe';
            }
            this.showFailureCreateAlert();
          },
        });
    } else {
      const dto: PutCategoryDTO =
        { id: this.idCategoryToEdit, category: this.descrCategoryToEdit };
      this.categoryService.putCategory(dto, this.usersMockService.getMockId()).subscribe({
        next: (response) => {
          console.log('Pasa:', response);
          this.showSuccessEditAlert();
          this.loadCategories();
        },
        error: (error) => {
          this.showFailureEditAlert();
          console.error('Error al registrar categoría:', error);
        },
      });
    }
  }

  setupTableListeners() {
    $('#categoryTable').on('click', '.edit-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      this.setCategoryToEdit(id);
    });

    $('#categoryTable').on('click', '.delete-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      this.setCategoryToDelete(id);
      this.showConfirmDeleteModal();
    });
  }

  setCategoryToDelete(id: number) {
    this.categoryToDelete = id;
    console.log('Eliminar categoría:', this.categoryToDelete);
  }

  setCategoryToEdit(id: number) {
    this.idCategoryToEdit = id;
    this.categoryToEdit = this.categories.find(cat => cat.id === id);
    this.descrCategoryToEdit = this.categoryToEdit?.category || '';
    console.log('Editar categoría:', this.idCategoryToEdit);
    console.log('Categoría:', this.categoryToEdit);
  }

  private closeModal() {
    const modalElement = document.getElementById('categoriaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Limpieza completa del modal y sus efectos
      setTimeout(() => {
        // Remover clases del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');

        // Remover todos los backdrops
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].remove();
        }

        // Limpiar el modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');

        // Remover cualquier estilo inline que Bootstrap pueda haber añadido
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
          (modal as HTMLElement).style.display = 'none';
        });
      }, 100);
    }
  }


  loadCategories() {  
    this.loading = true;
    this.categoryService.getCategorias().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredData = [...categories];
        setTimeout(() => {
          this.refreshDataTable();
          this.loading = false;
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loading = false;
      },
    });
  }
}