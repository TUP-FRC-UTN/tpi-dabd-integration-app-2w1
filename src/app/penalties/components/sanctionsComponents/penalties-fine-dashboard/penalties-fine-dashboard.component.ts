import { Component, inject } from '@angular/core';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Fine,
  ColumnChartKPIs,
  PieChartKPIs,
  TopExpenseKPIs,
} from '../../../models/Dashboard-models';
import { textShadow } from 'html2canvas/dist/types/css/property-descriptors/text-shadow';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';

@Component({
  selector: 'app-penalties-fine-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule],
  templateUrl: './penalties-fine-dashboard.component.html',
  styleUrl: './penalties-fine-dashboard.component.scss',
})
export class PenaltiesFineDashboardComponent {
  private sanctionsService: PenaltiesSanctionsServicesService = inject(
    PenaltiesSanctionsServicesService
  );
  finesData: Fine[] = [];
  status: number = 0;
  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();

  //Filtros avanzados
  states: any[] = [];
  reportsReasons: ReportReasonDto[] = [];
  state = ''
  reportReason = ''
  reportReason2 = ''
  //propiedades para los kpi
  totalFines: number = 0;
  averageFinesPerMonth: number = 0;
  finesByState: { [key: string]: number } = {};
  highestFine: Fine | null = null;
  finesByReason: { [key: string]: number } = {};
  lowestFine: Fine | null = null;
  finesByStatePercentage: { state: string; percentage: number }[] = [];
  stateWithHighestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  stateWithLowestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  paidFinesCount: any;
  pendingFinesCount: any;

  // Datos para gráficos
  pieChartData: any[] = [];
  lineChartData: any[] = [];
  columnChartData: any[] = [];

  // Tipos de gráficos
  pieChartType = ChartType.PieChart;
  lineChartType = ChartType.ColumnChart;
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
      textStyle: { color: '#6c757d', fontSize: 17 },
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: '80%',
    slices: {
      0: { color: '#FCAE7C' }, // MP siempre azul
      1: { color: '#D1BDFF' }, // STRIPE siempre violeta
      2: { color: '#F9FFB5' },
      3: { color: '#D6F6FF' },
      4: { color: '#E2CBF7' }, // EFECTIVO siempre verde
      5: { color: '#B3F5BC' },
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 12,
    },
  };

  lineChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#D1BDFF'],
    legend: { position: 'none' },
    chartArea: { width: '90%', height: '80%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad de Multas',
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Mes',
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true,
    },
    title: 'Cantidad de Multas por Mes',
  };

  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#FCAE7C', '#F9FFB5', '#E2CBF7', '#B3F5BC'],
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '75%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad',
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Estado de Multas',
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true,
    },
    height: 500,
    width: '100%',
    bar: { groupWidth: '70%' },
    title: 'Cantidad de Multas por Estado',
  };

  ngOnInit() {
    this.updateCharts();
    this.getReportsReasons();
    this.getStates();
  }
  getStates() {
    this.sanctionsService.getStateFines().subscribe(
      (respuesta) => {
        this.states = Object.entries(respuesta)
          .map(([key, value]) => ({ key, value }))
          .filter(state => state.value !== 'Advertencia');
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
  getReportsReasons() {
    this.sanctionsService.getAllReportReasons().subscribe(
      (respuesta) => {
        this.reportsReasons = respuesta;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
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
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  }

  private getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  }

  private updateCharts() {
    this.sanctionsService.getAllFines().subscribe({
      next: (fines: Fine[]) => {
        const fromDate = new Date(this.periodFrom + '-01');
        const toDate = new Date(this.periodTo + '-01');
        toDate.setMonth(toDate.getMonth() + 1);

        // Filtrar multas por rango de fecha
        this.finesData = fines.filter((fine) => {
          const fineDate = new Date(fine.createdDate);
          return fineDate >= fromDate && fineDate < toDate;
        });

        // Calcular KPIs
        this.calculateKPIs();

        this.updatePieChart();
        this.updateLineChart();
        this.updateColumnChart();
      },
      error: (error) => {
        console.error('Error al obtener multas:', error);
      },
    });
  }

  private updatePieChart() {
    if(this.state == ""){
    const finesByType = this.finesData.reduce(
      (acc: { [key: string]: number }, fine) => {
        const type = fine.report.reportReason.reportReason;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {}
    );

    this.pieChartData = Object.keys(finesByType).length > 0
        ? Object.entries(finesByType).map(([type, count]) => [type, count])
        : [];
  }else{
    const filteredFines = this.state
    ? this.finesData.filter(fine => fine.fineState === this.state)
    : this.finesData;

  const finesByType = filteredFines.reduce(
    (acc: { [key: string]: number }, fine) => {
      const type = fine.report.reportReason.reportReason;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {}
  );

  this.pieChartData = Object.keys(finesByType).length > 0
        ? Object.entries(finesByType).map(([type, count]) => [type, count])
        : [];
  }
  }

  private updateLineChart() {
    console.log(this.reportReason2)
    if(this.reportReason2 == ""){
    const fromDate = new Date(this.periodFrom + '-01');
    const toDate = new Date(this.periodTo + '-01');
    toDate.setMonth(toDate.getMonth() + 1);

    const finesByMonth: { [key: string]: number } = {};

    this.finesData.forEach((fine) => {
      const fineDate = new Date(fine.createdDate);
      const monthKey = fineDate.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      finesByMonth[monthKey] = (finesByMonth[monthKey] || 0) + 1;
    });

    const lineChartData = [];
    let currentDate = new Date(fromDate);

    while (currentDate < toDate) {
      const monthLabel = currentDate.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      lineChartData.push([monthLabel, finesByMonth[monthLabel] || 0]);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.lineChartData = lineChartData;
    }
    else{
      const fromDate = new Date(this.periodFrom + '-01');
      const toDate = new Date(this.periodTo + '-01');
      toDate.setMonth(toDate.getMonth() + 1);
    
      const filteredFines = this.reportReason2
        ? this.finesData.filter(fine => fine.report.reportReason.reportReason == this.reportReason2)
        : this.finesData;
    
      const finesByMonth = filteredFines.reduce((acc: { [key: string]: number }, fine) => {
        const fineDate = new Date(fine.createdDate);
        const monthKey = fineDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {});
    
      const lineChartData = [];
      let currentDate = new Date(fromDate);
    
      while (currentDate < toDate) {
        const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        lineChartData.push([monthLabel, finesByMonth[monthLabel] || 0]);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    
      this.lineChartData = lineChartData;
    }
  }

  private updateColumnChart() {
    if(this.reportReason== ""){
    const finesByState = this.finesData.reduce(
      (acc: { [key: string]: number }, fine) => {
        acc[fine.fineState] = (acc[fine.fineState] || 0) + 1;
        return acc;
      },
      {}
    );

    this.columnChartData = Object.keys(finesByState).length > 0
        ? Object.entries(finesByState).map(([type, count]) => [type, count])
        : [];
  }
  else{
    const filteredFines = this.reportReason
    ? this.finesData.filter(fine => fine.report.reportReason.reportReason === this.reportReason)
    : this.finesData;

  const finesByState = filteredFines.reduce(
    (acc: { [key: string]: number }, fine) => {
      acc[fine.fineState] = (acc[fine.fineState] || 0) + 1;
      return acc;
    },
    {}
  );

  this.columnChartData = Object.keys(finesByState).length > 0
        ? Object.entries(finesByState).map(([type, count]) => [type, count])
        : [];
  }
  }

  makeBig(nro: number) {
    this.status = nro;
  }

  private calculateKPIs() {
    const totalAmount = this.finesData.reduce((acc: number, fine: Fine) => acc + fine.amount, 0);
    
    // Total de multas realizadas
    this.totalFines = this.finesData.length;
  
    // Calcular multas por mes para obtener el promedio
    const finesByMonth: { [key: string]: number } = {};
    this.finesData.forEach(fine => {
      const fineDate = new Date(fine.createdDate);
      const monthKey = fineDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      finesByMonth[monthKey] = (finesByMonth[monthKey] || 0) + 1;
    });
    this.averageFinesPerMonth = this.totalFines / Object.keys(finesByMonth).length;
  
    // Multa de mayor monto
    this.highestFine = this.finesData.reduce((max: Fine | null, fine: Fine) => {
      return fine.amount > (max?.amount || 0) ? fine : max;
    }, null as Fine | null);
  
    // Distribución de multas por estado
    this.finesByState = this.finesData.reduce((acc: { [key: string]: number }, fine) => {
      acc[fine.fineState] = (acc[fine.fineState] || 0) + 1;
      return acc;
    }, {});

    // Calcular el total de multas en estado "Pagada" y "Pendiente de Pago"
    this.paidFinesCount = this.finesData.filter(fine => fine.fineState === 'Pagada').length;
    this.pendingFinesCount = this.finesData.filter(fine => fine.fineState === 'Pendiente de pago').length;

  
    // Distribución de multas por razón
    this.finesByReason = this.finesData.reduce((acc: { [key: string]: number }, fine) => {
      const reason = fine.report.reportReason.reportReason;
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    // Calcular porcentaje de denuncias por estado
this.finesByStatePercentage = Object.entries(this.finesByState).map(([state, count]) => {
  const percentage = (count / this.totalFines) * 100;
  return { state, percentage };
});

// Encontrar el estado con el mayor porcentaje
this.stateWithHighestPercentage = this.finesByStatePercentage.reduce((max, current) => {
  return current.percentage > max.percentage ? current : max;
}, { state: '', percentage: 0 });

// Encontrar el estado con el menor porcentaje
this.stateWithLowestPercentage = this.finesByStatePercentage.reduce((min, current) => {
  return current.percentage < min.percentage ? current : min;
}, { state: '', percentage: Infinity });

// Multa de menor monto
this.lowestFine = this.finesData.reduce((min: Fine | null, fine: Fine) => {
  return fine.amount < (min?.amount || Infinity) ? fine : min;
  }, null as Fine | null);


    
  }
  
}
