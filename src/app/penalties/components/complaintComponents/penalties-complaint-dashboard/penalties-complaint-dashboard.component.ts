import { Component, inject } from '@angular/core';
import { ComplaintService } from '../../../services/complaintsService/complaints.service';
import {
  ComplaintDto,
  EstadoDenuncia,
  TipoDenuncia,
} from '../../../models/complaint';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { State } from '@popperjs/core';
import { ReportReason } from '../../../models/Dashboard-models';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';

@Component({
  selector: 'app-penalties-complaint-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule],
  templateUrl: './penalties-complaint-dashboard.component.html',
  styleUrl: './penalties-complaint-dashboard.component.scss',
})
export class PenaltiesComplaintDashboardComponent {
  private sanctionsService: ComplaintService = inject(ComplaintService);
  complaintsData: ComplaintDto[] = [];
  status: number = 0;
  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();
  stateFilter: string = '';
  //filtros avanzados
  states: any[] = [];
  reportsReasons: ReportReasonDto[] = [];

  //propiedades para los kpi
  totalComplaints: number = 0;
  averageComplaintsPerMonth: number = 0;
  complaintWithMostFiles?: ComplaintDto | null;
  complaintsByState?: { [key: string]: number };
  complaintsByReason?: { [key: string]: number };
  complaintsByUser?: { [key: number]: number };
  complaintsByStatePercentage: { state: string; percentage: number }[] = [];
  stateWithHighestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  stateWithLowestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  /////////////////////////
  state = '';
  reportReason = '';
  reportReason2 = '';
  //filtros avanzados
  complaintState: EstadoDenuncia = EstadoDenuncia.Aprobada;
  complaintType: TipoDenuncia = TipoDenuncia.Daño;

  pieChartData: any[] = [];
  lineChartData: any[] = [];
  columnChartData: any[] = [];

  pieChartType = ChartType.PieChart;
  lineChartType = ChartType.ColumnChart;
  columnChartType = ChartType.ColumnChart;
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

  // pieChartOptions = {
  //   backgroundColor: 'transparent',
  //   colors: ['#8A2BE2', '#00BFFF', '#FF4500', '#32CD32'],
  //   legend: {
  //     position: 'right',
  //     textStyle: { color: '#000000', fontSize: 17 },
  //   },
  //   pieSliceText: 'none',  // Oculta los porcentajes dentro del gráfico
  //   chartArea: { width: '80%', height: '80%' },
  //   pieHole: 0.7,
  //   height: '80%',
  //   title: 'Distribución de Tipos de Multas',
  // };
  lineChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#D1BDFF'],
    legend: { position: 'none' },
    chartArea: { width: '90%', height: '80%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad de Denuncias',
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Periodo',
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true,
    },
    title: 'Cantidad de Denuncias por Mes',
  };

  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: ['#FCAE7C', '#F9FFB5', '#E2CBF7', '#B3F5BC'], // Colores por estado
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '75%' },
    vAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Cantidad',
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      title: 'Estado de Denuncias',
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true,
    },
    height: 500,
    width: '100%',
    bar: { groupWidth: '70%' },
    title: 'Cantidad de Denuncias por Estado',
  };

  //constructor(private sanctionsService: SanctionsService) {}

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

  ngOnInit() {
    this.updateCharts();
    this.getReportReasons();
    this.getStates();
  }
  getReportReasons() {
    this.sanctionsService.getAllReportReasons().subscribe(
      (respuesta) => {
        this.reportsReasons = respuesta;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
  getStates() {
    this.sanctionsService.getState().subscribe(
      (respuesta) => {
        this.states = Object.entries(respuesta).map(([key, value]) => ({
          key,
          value,
        }));
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  applyFilters() {
    this.updateCharts();
  }

  private updateColumnChart() {
    console.log(this.state);
    if (this.reportReason == '') {
      const complaintsByState = this.complaintsData.reduce(
        (acc: any, complaint) => {
          acc[complaint.complaintState] =
            (acc[complaint.complaintState] || 0) + 1;
          return acc;
        },
        {}
      );
      this.columnChartData = Object.keys(complaintsByState).length > 0
        ? Object.entries(complaintsByState).map(([type, count]) => [type, count])
        : [];
    } else {
      const filteredComplaints = this.complaintsData.filter((complaint) => {
        return complaint.complaintReason === this.reportReason; // Filtra por el campo 'reportReason'
      });

      const complaintsByState = filteredComplaints.reduce(
        (acc: any, complaint) => {
          acc[complaint.complaintState] =
            (acc[complaint.complaintState] || 0) + 1;
          return acc;
        },
        {}
      );

      this.columnChartData = Object.keys(complaintsByState).length > 0
        ? Object.entries(complaintsByState).map(([type, count]) => [type, count])
        : [];
    }
  }

  private updateLineChart() {
    if (this.reportReason2 == '') {
      const fromDate = new Date(this.periodFrom + '-01');
      const toDate = new Date(this.periodTo + '-01');
      toDate.setMonth(toDate.getMonth() + 1);
      const complaintsInRange = this.complaintsData.filter((complaint) => {
        const complaintDate = new Date(complaint.createdDate);
        return complaintDate >= fromDate && complaintDate < toDate;
      });
      const complaintsByMonth = complaintsInRange.reduce(
        (acc: any, complaint) => {
          const month = new Date(complaint.createdDate).toLocaleString(
            'default',
            { month: 'short', year: 'numeric' }
          );
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {}
      );
      const lineChartData = [];
      let currentDate = new Date(fromDate);
      while (currentDate < toDate) {
        const monthLabel = currentDate.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        lineChartData.push([monthLabel, complaintsByMonth[monthLabel] || 0]); // 0 si no hay denuncias en ese mes
        currentDate.setMonth(currentDate.getMonth() + 1); // Avanzar al siguiente mes
      }

      this.lineChartData = lineChartData;
    } else {
      const fromDate = new Date(this.periodFrom + '-01');
      const toDate = new Date(this.periodTo + '-01');
      toDate.setMonth(toDate.getMonth() + 1);
      const complaintsInRange = this.complaintsData.filter((complaint) => {
        const complaintDate = new Date(complaint.createdDate);
        const isWithinDateRange =
          complaintDate >= fromDate && complaintDate < toDate;
        const matchesReportReason =
          this.reportReason2 === '' ||
          complaint.complaintReason === this.reportReason2;
        return isWithinDateRange && matchesReportReason;
      });
      const complaintsByMonth = complaintsInRange.reduce(
        (acc: any, complaint) => {
          const month = new Date(complaint.createdDate).toLocaleString(
            'default',
            { month: 'short', year: 'numeric' }
          );
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {}
      );
      const lineChartData = [];
      let currentDate = new Date(fromDate);
      while (currentDate < toDate) {
        const monthLabel = currentDate.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        lineChartData.push([monthLabel, complaintsByMonth[monthLabel] || 0]);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      this.lineChartData = lineChartData;
    }
  }

  private updatePieChart() {
    console.log(this.state);
    if (this.state == '') {
      console.log(this.state);
      const complaintsByType = this.complaintsData.reduce(
        (acc: any, complaint) => {
          acc[complaint.complaintReason] =
            (acc[complaint.complaintReason] || 0) + 1;
          return acc;
        },
        {}
      );
      this.pieChartData = Object.keys(complaintsByType).length > 0
        ? Object.entries(complaintsByType).map(([type, count]) => [type, count])
        : [];
    } else {
      const filteredComplaints = this.complaintsData.filter((complaint) => {
        return complaint.complaintState === this.state; // Filtra por el campo 'state'
      });

      const complaintsByType = filteredComplaints.reduce(
        (acc: any, complaint) => {
          acc[complaint.complaintReason] =
            (acc[complaint.complaintReason] || 0) + 1;
          return acc;
        },
        {}
      );

      this.pieChartData = Object.keys(complaintsByType).length > 0
        ? Object.entries(complaintsByType).map(([type, count]) => [type, count])
        : [];
    }
  }

  updateCharts() {
    this.sanctionsService.getAllComplaints().subscribe({
      next: (complaints) => {
        const fromDate = new Date(this.periodFrom + '-01');
        const toDate = new Date(this.periodTo + '-01');
        toDate.setMonth(toDate.getMonth() + 1);
        this.complaintsData = complaints.filter((complaint) => {
          const complaintDate = new Date(complaint.createdDate);
          return complaintDate >= fromDate && complaintDate < toDate;
        });
        //Actualizar los KPIS
        this.calculateKPIs()

        this.updatePieChart();
        this.updateLineChart();
        this.updateColumnChart();
      },
      error: (error) => {
        console.error('Error al obtener denuncias:', error);
      },
    });
  }

  makeBig(nro: number) {
    this.status = nro;
  }

  private calculateKPIs() {
    // Total de denuncias realizadas
    this.totalComplaints = this.complaintsData.length;

    // Calcular denuncias por mes para obtener el promedio
    const complaintsByMonth: { [key: string]: number } = {};
    this.complaintsData.forEach(complaint => {
      const complaintDate = new Date(complaint.createdDate);
      const monthKey = complaintDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      complaintsByMonth[monthKey] = (complaintsByMonth[monthKey] || 0) + 1;
    });
    this.averageComplaintsPerMonth = this.totalComplaints / Object.keys(complaintsByMonth).length;

    // Denuncia con mayor cantidad de archivos adjuntos
    this.complaintWithMostFiles = this.complaintsData.reduce((max: ComplaintDto | null, complaint: ComplaintDto) => {
      return complaint.fileQuantity > (max?.fileQuantity || 0) ? complaint : max;
    }, null as ComplaintDto | null);

    // Distribución de denuncias por estado
    this.complaintsByState = this.complaintsData.reduce((acc: { [key: string]: number }, complaint) => {
      acc[complaint.complaintState] = (acc[complaint.complaintState] || 0) + 1;
      return acc;
    }, {});

    // Distribución de denuncias por razón
    this.complaintsByReason = this.complaintsData.reduce((acc: { [key: string]: number }, complaint) => {
      const reason = complaint.complaintReason || complaint.anotherReason;
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    // Distribución de denuncias por usuario
    this.complaintsByUser = this.complaintsData.reduce((acc: { [key: number]: number }, complaint) => {
      acc[complaint.userId] = (acc[complaint.userId] || 0) + 1;
      return acc;
    }, {});


    // Calcular porcentaje de denuncias por estado
    this.complaintsByStatePercentage = Object.entries(this.complaintsByState).map(([state, count]) => {
      const percentage = (count / this.totalComplaints) * 100;
      return { state, percentage };
    });

    // Encontrar el estado con el mayor porcentaje
    this.stateWithHighestPercentage = this.complaintsByStatePercentage.reduce((max, current) => {
      return current.percentage > max.percentage ? current : max;
    }, { state: '', percentage: 0 });

    // Encontrar el estado con el menor porcentaje
    this.stateWithLowestPercentage = this.complaintsByStatePercentage.reduce((min, current) => {
      return current.percentage < min.percentage ? current : min;
    }, { state: '', percentage: Infinity });

  }
  // getMostFrequentUser(): number {
  //   if (!this.complaintsByUser) return 0;
  //   return Object.entries(this.complaintsByUser)
  //     .reduce((a, b) => a[1] > b[1] ? a : b)[0] as unknown as number;
  // }
}


