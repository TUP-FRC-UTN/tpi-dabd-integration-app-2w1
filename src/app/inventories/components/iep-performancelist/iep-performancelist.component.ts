import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmployeePerformance, WakeUpCallDetail } from '../../models/listado-desempeño';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import { IepStockIncreaseComponent } from '../iep-stock-increase/iep-stock-increase.component';
import { IepAttentionCallComponent } from '../iep-attention-call/iep-attention-call.component';

@Component({
  selector: 'app-iep-performancelist',
  standalone: true,
  imports: [CommonModule, FormsModule, IepStockIncreaseComponent, IepAttentionCallComponent],
  templateUrl: './iep-performancelist.component.html',
  styleUrl: './iep-performancelist.component.css'
})
export class IepPerformancelistComponent implements OnInit {
  performances: EmployeePerformance[] = [];
  filteredPerformances: EmployeePerformance[] = [];
  searchTerm: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';
  dataTable: any;

  availableYears: number[] = [];
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  showModal = false;
  showInfoModal = false;
  selectedEmployeeDetails: WakeUpCallDetail[] = [];
  showDetailsModal = false;

  constructor(
    private employeeService: ListadoDesempeñoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.employeeService.refreshData();
  }

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  loadData(): void {
    this.employeeService.getCombinedData().subscribe({
      next: (data) => {
        this.performances = data;
        this.filteredPerformances = [...data];
        this.setAvailableYears();
        this.initializeDataTable();
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  initializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    const table = $('.data-table');
    if (table.length > 0) {
      this.dataTable = table.DataTable({
        dom:
          '<"mb-3"t>' +                           //Tabla
          '<"d-flex justify-content-between"lp>', //Paginacion
        data: this.filteredPerformances,
        columns: [
          { data: 'year' },
          { 
            data: 'month',
            render: (data: number) => this.getMonthName(data)
          },
          { data: 'fullName' },
          { data: 'totalObservations' },
          { 
            data: 'performanceType',
            render: (data: string) => {
              return `<span class="tag ${data.toLowerCase()}">${data}</span>`;
            }
          },
          {
            data: null,
            render: function (data: any) {
              return '<button class="btn btn-info btn-sm view-details">Ver más</button>';
            }
          }
        ],
        lengthMenu:[10, 25, 50],
        searching: false,
        language: {
          lengthMenu: '_MENU_',
          zeroRecords: "No se encontraron registros",
          info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
          infoEmpty: "Mostrando 0 a 0 de 0 registros",
          infoFiltered: "(filtrado de _MAX_ registros totales)",
          search: "Buscar:"
        },
        pageLength: 10,
        order: [[0, 'desc'], [1, 'desc']]
      });

      $('.data-table tbody').on('click', 'button.view-details', (event) => {
        const data = this.dataTable.row($(event.target).closest('tr')).data();
        this.viewDetails(data.id, data.year, data.month);
      });
    }
  }

  filterData(): void {
    // Aplicar filtros
    this.filteredPerformances = this.performances.filter(performance => {
      const matchesSearch = this.searchTerm === '' || 
        performance.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        performance.performanceType.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesYear = this.selectedYear === '' || 
        performance.year.toString() === this.selectedYear;

      const matchesMonth = this.selectedMonth === '' || 
        performance.month.toString() === this.selectedMonth;

      return matchesSearch && matchesYear && matchesMonth;
    });

    // Actualizar DataTable con los datos filtrados
    if (this.dataTable) {
      this.dataTable.clear();
      this.dataTable.rows.add(this.filteredPerformances);
      this.dataTable.draw();
    }
  }

  viewDetails(employeeId: number, year: number, month: number): void {
    this.employeeService.getWakeUpCallDetails().subscribe(details => {
      this.selectedEmployeeDetails = details.filter(detail => {
        const detailDate = new Date(detail.dateReal[0], detail.dateReal[1] - 1, detail.dateReal[2]);
        return detail.employeeId === employeeId && 
               detailDate.getFullYear() === year && 
               detailDate.getMonth() === month - 1;
      });
      this.showDetailsModal = true;
    });
  }

  setAvailableYears(): void {
    const years = this.performances.map(p => p.year);
    this.availableYears = [...new Set(years)].sort((a, b) => b - a);
  }

  getMonthName(month: number): string {
    return this.months[month - 1];
  }

  // Funciones de exportación
  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Desempeños de Empleados', 10, 10);

    const dataToExport = this.filteredPerformances.map((performance) => [
      performance.id,
      performance.fullName,
      performance.year,
      this.months[performance.month - 1],
      performance.totalObservations,
      performance.performanceType,
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Nombre Completo', 'Año', 'Mes', 'Total Observaciones', 'Tipo de Desempeño']],
      body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Desempeños.pdf');
  }

  exportToExcel(): void {
    const dataToExport = this.filteredPerformances.map((performance) => ({
      'ID': performance.id,
      'Nombre Completo': performance.fullName,
      'Año': performance.year,
      'Mes': this.months[performance.month - 1],
      'Total Observaciones': performance.totalObservations,
      'Tipo de Desempeño': performance.performanceType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Desempeños');
    XLSX.writeFile(workbook, 'Lista_Desempeños.xlsx');
  }

  // Funciones modales
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.loadData();
  }

  openInfoModal() {
    this.showInfoModal = true;
  }

  closeInfoModal() {
    this.showInfoModal = false;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }
}