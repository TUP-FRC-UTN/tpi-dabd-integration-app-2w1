import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChargeResponse } from '../../models/charge-response';
import { ChargeService } from '../../services/charge.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-iep-cargos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './iep-charges.component.html',
  styleUrl: './iep-charges.component.css'
})
export class IepChargesComponent implements OnInit, OnDestroy, AfterViewInit {
  cargoForm: FormGroup;
  cargos: ChargeResponse[] = [];
  selectedCargo: ChargeResponse | null = null;
  modoEdicion = false;
  private table: any;
  isModalVisible = false;
  isConfirmModalVisible = false;
  isModalOpen = false;
  isConfirmDeleteModalOpen = false;
  isErrorModalOpen = false;
  errorMessage = '';

  searchTerm: string = '';
  filteredData: ChargeResponse[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(ChargeService) private cargoService: ChargeService,
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Cargos', 10, 10);

    const dataToExport = this.cargos.map((cargo) => [
      cargo.charge,
      cargo.description,
    ]);

    (doc as any).autoTable({
      head: [['Cargo', 'Descripción']],
      body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Cargos.pdf');
  }

  exportToExcel(): void {
    const dataToExport = this.cargos.map((cargo) => ({
      'Cargo': cargo.charge,
      'Descripción': cargo.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Cargos');

    XLSX.writeFile(workbook, 'Lista_Cargos.xlsx');
  }


  ngOnInit(): void {
    this.loadCargos();
  }

  ngAfterViewInit(): void {
    this.initializeDataTable();

  }

  filterData(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredData = [...this.cargos];
    } else {
      this.filteredData = this.cargos.filter(cargo => 
        cargo.charge.toLowerCase().includes(searchTerm)
      );
    }
    
    this.refreshDataTable();
  }


  loadCargos(): void {
    this.cargoService.getAllCargos().subscribe({
      next: (cargos) => {
        this.cargos = cargos;
        this.filteredData = [...cargos];
        this.refreshDataTable();
      },
      error: (err) => {
        console.error('Error al cargar cargos:', err);
      }
    });
  }

  private refreshDataTable(): void {
    if (this.table) {
      this.table.clear().destroy();
      this.initializeDataTable();
    } else {
      this.initializeDataTable();
    }
  }

  initializeDataTable(): void {
    if (!this.cargos || this.cargos.length === 0) {
      return;
    }

    this.table = $('#cargosTable').DataTable({
      dom:
          '<"mb-3"t>' +                           //Tabla
          '<"d-flex justify-content-between"lp>', //Paginacion
      data: this.filteredData,
      columns: [
        { data: 'charge', title: 'Cargo' },
        { data: 'description', title: 'Descripción' },
        {
          data: null,
          title: 'Acciones',
          orderable: false,
          render: (data: any) => {
            return `
              <div class="dropdown">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" 
                   style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942;
                </a>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li><a class="dropdown-item edit-btn" href="#" data-id="${data.id}">Editar</a></li>
                  <li><a class="dropdown-item delete-btn" href="#" data-id="${data.id}">Eliminar</a></li>
                </ul>
              </div>`;
          }
        }
      ],
      pageLength: 10,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu:[10, 25, 50],
      searching: false, // Desactivar la búsqueda
      language: {
        emptyTable: "No hay datos disponibles en la tabla",
        zeroRecords: "No se encontraron coincidencias",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "Mostrando 0 a 0 de 0 entradas",
        infoFiltered: "(filtrado de _MAX_ entradas totales)",
        search: 'Buscar:',
        paginate: {
          first: '<<',
          last: '>>',
          next: '>',
          previous: '<',
        },
        lengthMenu: '_MENU_',
      }
    });

    this.setupTableListeners();
  }

  private setupTableListeners(): void {
    this.table.on('click', '.edit-btn', (event: { preventDefault: () => void; currentTarget: any; }) => {
      event.preventDefault();
      const id = parseInt($(event.currentTarget).data('id'), 10);
      const cargo = this.cargos.find(c => c.id === id);
      if (cargo) {
        this.abrirModalEditar(cargo);
      }
    });

    this.table.on('click', '.delete-btn', (event: { preventDefault: () => void; currentTarget: any; }) => {
      event.preventDefault();
      const id = parseInt($(event.currentTarget).data('id'), 10);
      const cargo = this.cargos.find(c => c.id === id);
      if (cargo) {
        this.abrirModalConfirmarEliminacion(cargo);
      }
    });
  }

  abrirModalConfirmarEliminacion(cargo: ChargeResponse): void {
    this.selectedCargo = cargo;
    this.isConfirmDeleteModalOpen = true;
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.selectedCargo = null;
    this.cargoForm.reset();
    this.isModalOpen = true;
  }

  abrirModalEditar(cargo: any): void {
    this.modoEdicion = true;
    this.selectedCargo = cargo;
    this.cargoForm.patchValue(cargo);
    this.isModalOpen = true;
  }

  onSubmit(): void {
    if (this.cargoForm.valid) {
      const chargeValue = this.cargoForm.get('charge')?.value;

      this.cargoService.getAllCargos().subscribe(cargos => {
        const exists = cargos.some(cargo => cargo.charge === chargeValue && cargo.id !== this.selectedCargo?.id);

        if (exists) {
          this.errorMessage = `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`;
          this.isErrorModalOpen = true;
          return;
        }

        if (this.modoEdicion) {
          if (this.selectedCargo) {
            this.cargoService.updateCargo(this.selectedCargo.id, this.cargoForm.value).subscribe(() => {
              this.loadCargos();
              this.isModalOpen = false;
            });
          }
        } else {
          this.cargoService.createCargo(this.cargoForm.value).subscribe(() => {
            this.loadCargos();
            this.isModalOpen = false;
          });
        }
      });
    }
  }

  markAllControlsAsTouched(): void {
    Object.keys(this.cargoForm.controls).forEach(key => {
      this.cargoForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.isModalOpen = false;
    this.cargoForm.reset();
    this.selectedCargo = null;
    this.modoEdicion = false;
    this.isConfirmDeleteModalOpen = false;
  }

  eliminarCargo(id: number): void {
    if (!id) return;

    this.cargoService.updateStatus(id).subscribe({
      next: () => {
        this.isConfirmDeleteModalOpen = false;
        this.selectedCargo = null;
        this.loadCargos();
      },
      error: (err) => {
        console.error('Error al eliminar cargo:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }
}

