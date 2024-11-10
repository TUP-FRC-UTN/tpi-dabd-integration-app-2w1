import { Component, inject } from '@angular/core';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fine } from '../../../models/Dashboard-models';
import { textShadow } from 'html2canvas/dist/types/css/property-descriptors/text-shadow';

@Component({
  selector: 'app-penalties-fine-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule],
  templateUrl: './penalties-fine-dashboard.component.html',
  styleUrl: './penalties-fine-dashboard.component.scss'
})
export class PenaltiesFineDashboardComponent {
  private sanctionsService: PenaltiesSanctionsServicesService = inject(PenaltiesSanctionsServicesService);
  finesData: Fine[] = [];
  status: number = 0;
  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();

  // Datos para gráficos
  pieChartData: any[] = [];
  lineChartData: any[] = [];
  columnChartData: any[] = [];

  // Tipos de gráficos
  pieChartType = ChartType.PieChart;
  lineChartType = ChartType.LineChart;
  columnChartType = ChartType.ColumnChart;

  // pieChartOptions = {
  //   backgroundColor: 'transparent',
  //   colors: ['#8A2BE2', '#00BFFF', '#FF4500', '#32CD32'],
  //   legend: {
  //     position: 'right',
  //     textStyle: { color: '#000000', fontSize: 17 },  // Cambiado a negro
  //   },
  //   pieSliceTextStyle: { color: '#000000' }, // Texto dentro de las porciones en negro
  //   chartArea: { width: '80%', height: '80%' },
  //   pieHole: 0.7,
  //   height: '80%',
  //   title: 'Distribución de Tipos de Multas'
  // };
  pieChartOptions = {
    backgroundColor: 'transparent',
    
    legend: {
      position: 'right',
      textStyle: { color: '#6c757d', fontSize: 17 }
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: '80%',
    slices: {
      0: { color: '#8A2BE2' },  // MP siempre azul
      1: { color: '#00BFFF' },  // STRIPE siempre violeta
      2: { color: '#FF4500' },
      3:{color:'#32CD32'},
      4:{color:'#666666'}   // EFECTIVO siempre verde
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 16
    }
  };

  lineChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#24f73f'],
    legend: { position: 'none' },
    chartArea: { width: '90%', height: '80%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad de Multas'
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Mes'
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    title: 'Evolución de Multas por Mes'
  };

  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#24473f', '#FF4500', '#32CD32', '#8A2BE2'],
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '75%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad'
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Estado de Multas'
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 600,
    width: '100%',
    bar: { groupWidth: '70%' },
    title: 'Cantidad de Multas por Estado'
  };

  ngOnInit() {
    this.updateCharts();
  }

  applyFilters() {
    this.updateCharts();
  }

  private convertArrayDateToDate(dateArray: number[]): Date {
    // Asumiendo que dateArray tiene el formato [año, mes, día]
    return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
  }

  private getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private updateCharts() {
    this.sanctionsService.getAllFines().subscribe({
      next: (fines: Fine[]) => {
        const fromDate = new Date(this.periodFrom + '-01');
        const toDate = new Date(this.periodTo + '-01');
        toDate.setMonth(toDate.getMonth() + 1);

        // Filtrar multas por rango de fecha
        this.finesData = fines.filter(fine => {
          const fineDate = new Date(fine.createdDate);
          return fineDate >= fromDate && fineDate < toDate;
        });

        this.updatePieChart();
        this.updateLineChart();
        this.updateColumnChart();
      },
      error: (error) => {
        console.error('Error al obtener multas:', error);
      }
    });
  }

  private updatePieChart() {
    const finesByType = this.finesData.reduce((acc: { [key: string]: number }, fine) => {
      const type = fine.report.reportReason.reportReason;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    this.pieChartData = Object.entries(finesByType).map(([type, count]) => [type, count]);
  }

  private updateLineChart() {
    const fromDate = new Date(this.periodFrom + '-01');
    const toDate = new Date(this.periodTo + '-01');
    toDate.setMonth(toDate.getMonth() + 1);

    const finesByMonth: { [key: string]: number } = {};
    
    this.finesData.forEach(fine => {
      const fineDate = new Date(fine.createdDate);
      const monthKey = fineDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      finesByMonth[monthKey] = (finesByMonth[monthKey] || 0) + 1;
    });

    const lineChartData = [];
    let currentDate = new Date(fromDate);
    
    while (currentDate < toDate) {
      const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      lineChartData.push([monthLabel, finesByMonth[monthLabel] || 0]);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    this.lineChartData = lineChartData;
  }

  private updateColumnChart() {
    const finesByState = this.finesData.reduce((acc: { [key: string]: number }, fine) => {
      acc[fine.fineState] = (acc[fine.fineState] || 0) + 1;
      return acc;
    }, {});

    this.columnChartData = Object.entries(finesByState).map(([state, count]) => [state, count]);
  }

  makeBig(nro: number) {
    this.status = nro;
  }
}
