import { Component, inject } from '@angular/core';
import { DashboardService } from '../../users-servicies/dashboard.service';
import {
  AgeDistribution,
  AgeDistributionResponse,
} from '../../users-models/dashboard/age-distribution';
import { CommonModule } from '@angular/common';
import {
  ChartType,
  GoogleChartComponent,
  GoogleChartsModule,
} from 'angular-google-charts';
import { UsersGraphicPlotsStatsComponent } from '../users-graphic-plots-stats/users-graphic-plots-stats.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-graphic-histogram',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users-graphic-histogram.component.html',
  styleUrl: './users-graphic-histogram.component.css',
})
export class UsersGraphicHistogramComponent {
  private readonly apiService = inject(DashboardService);
  startDate: FormControl = new FormControl('');
  endDate: FormControl = new FormControl('');

  ageDistribution: AgeDistributionResponse = new AgeDistributionResponse();

  loading = true;
  error: string | null = null;
  errorRange: string | null = null;

  columnChart = ChartType.ColumnChart;
  barChartData: any[] = [];

  barChartOptions = {
    legend: { position: 'top', alignment: 'center' },
    series: {
      0: { labelInLegend: 'Activos' },
      1: { labelInLegend: 'Inactivos' },
    },
    backgroundColor: 'trasparent',
    colors: ['#4285F4', '#DB4437'],
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out',
    },
    hAxis: {
      title: 'Rango de Edad',
      titleTextStyle: { color: '#6c757d', fontSize: 14, bold: true },
      textStyle: { color: '#495057', fontSize: 12 },
    },
    vAxis: {
      title: 'Cantidad de Usuarios',
      format: '0',
      minValue: 0,
      titleTextStyle: { color: '#6c757d', fontSize: 14, bold: true },
      textStyle: { color: '#495057', fontSize: 12 },
    },
    bar: { groupWidth: '70%' },
    tooltip: {
      showColorCode: true,
      trigger: 'both',
    },
  };

  pieChart = ChartType.PieChart;
  pieChartData: any[] = [];
  pieChartOptions = {
    //pieHole: 0.4,
    colors: ['#4285F4', '#DB4437'],
    backgroundColor: 'transparent',
    legend: {
      position: 'right',
      textStyle: { color: '#495057', fontSize: 12 },
    },
    chartArea: { width: '90%', height: '80%' },
    tooltip: {
      textStyle: { fontSize: 14, color: '#495057' },
      showColorCode: true,
      trigger: 'both',
    },
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    this.apiService.getAgeDistribution().subscribe({
      next: (data: AgeDistributionResponse) => {
        this.ageDistribution = data;
        this.loading = false;
        this.processData();
      },
      error: () => {
        this.error = 'Error al cargar las estadísticas';
        this.loading = false;
      },
    });
  }

  private processData() {

    this.barChartData = [
      //['Rango de Edad', 'Activos', 'Inactivos'],
      ...this.ageDistribution.ageDistribution.map((item: any) => [
        {
          v: item.ageRange,
          f: item.ageRange,
        },
        {
          v: item.activeCount,
          f: `Activos: ${item.activeCount} usuarios`,
        },
        {
          v: item.inactiveCount,
          f: `Inactivos: ${item.inactiveCount} usuarios.`,
        },
      ]),
    ];

    // Prepare pie chart data
    const status = this.ageDistribution.userStatusDistribution;
    this.pieChartData = [
      //['Estado', 'Cantidad'],
      ['Activos', status.activeUsers],
      ['Inactivos', status.inactiveUsers],
    ];
  }

  filterByDate() {
    const startDateValue = this.startDate.value;
    const endDateValue = this.endDate.value;

    if (startDateValue && endDateValue) {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);

      if (start > end) {
        this.errorRange = 'La fecha de inicio debe ser menor a la fecha de fin';
        return;
      }

      const formattedStartDate = this.formatDate(start);
      const formattedEndDate = this.formatDate(end);

      this.updateDashboardData(formattedStartDate, formattedEndDate);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private updateDashboardData(startDate: string, endDate: string) {

    this.error = null;
    this.apiService.getAgeDistribution(startDate, endDate).subscribe({
      next: (stats) => {
        this.ageDistribution = stats;
        this.loading = false;
        this.processData();
      },
      error: (error) => {
        console.error('Error al obtener estadísticas:', error);
      },
    });
  }

  clearFilters() {
    this.startDate.reset();
    this.endDate.reset();
    this.errorRange = null;
    this.error = null;
    this.loadData();
  }
}
