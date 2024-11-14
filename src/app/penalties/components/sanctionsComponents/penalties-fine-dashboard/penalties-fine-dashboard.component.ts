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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PenaltiesModalFineComponent } from '../modals/penalties-get-fine-modal/penalties-get-fine-modal.component';
import { PenaltiesKpiComponent } from '../../complaintComponents/penalties-kpi/penalties-kpi.component';

@Component({
  selector: 'app-penalties-fine-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule,PenaltiesKpiComponent],
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
  constructor(
    private _modal: NgbModal) {}

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

  
     //MODIFICADO OPTIONS
     pieChartOptions = {
      pieHole: 0.4,
      chartArea: { width: '100%', height: '90%' },
      sliceVisibilityThreshold: 0.01,
    };
  
    //MODIFICADO OPTIONS
    lineChartOptions = {
      hAxis: {
        title: 'Período',
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 1,
        textStyle: { fontSize: 12 },
        minValue: 0,
      },
      vAxis: { title: 'Cantidad', minValue: 0 }, // Asegurarse de que el valor mínimo sea 0
      chartArea: { width: '70%', height: '55%' },
      legend: { position: 'right' },
      colors: ['#4285F4', '#EA4335', '#34A853', '#FBBC05'],
      //tooltip: { isHtml: true }
    };
  
      //MODIFICADO OPTIONS
    columnChartOptions = {
      hAxis: {
        title: 'Estado',
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 1,
        textStyle: { fontSize: 12 },
        minValue: 0,
      },
      vAxis: { title: 'Cantidad', minValue: 0},
      chartArea: { width: '70%', height: '55%' },
      legend: { position: 'right' },
      colors: ['#4285F4', '#EA4335', '#34A853', '#FBBC05'],
      //tooltip: { isHtml: true }
    };
  
    //AÑADIR
    changeView(view: number) {
      this.status = view;
      if (view == 1) {
        this.updateColumnChart();
      }
      if (view == 2) {
        this.updatePieChart();
      }
      if (view == 3) {
        this.updateLineChart();
      }
    }

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

  get currentYearMonth(): string {
    return this.getCurrentYearMonth();
  }

  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  }

  getDefaultFromDate(): string {
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
    if (nro === 5 && this.highestFine) {
      this.openFineModal(this.highestFine.id);
    } else if (nro === 7 && this.lowestFine) {
      this.openFineModal(this.lowestFine.id);
    }
    else {
      this.status = nro;
    }
  }
  
  private openFineModal(fineId: number) {
    const modal = this._modal.open(PenaltiesModalFineComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.fineId = fineId;
    modal.result
      .then((result: any) => {
      })
      .catch((error: any) => {
        console.log("Error con modal: " + error);
      });
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
    console.log("la multa",this.highestFine?.amount)
  
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
