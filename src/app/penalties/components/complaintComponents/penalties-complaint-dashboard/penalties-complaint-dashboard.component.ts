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
import { PenaltiesKpiComponent } from '../penalties-kpi/penalties-kpi.component';

@Component({
  selector: 'app-penalties-complaint-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule, PenaltiesKpiComponent],
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
  differenceInDaysResolution : number=0;
  complaintsByStatePercentage: { state: string; percentage: number }[] = [];
  stateWithHighestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  stateWithLowestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  dayWithMostComplaints: { day: number; count: number; } = { day: 0, count: 0 }
  dayWithMostComplaintsName: string = "";
  dayWithLeastComplaints: { day: number; count: number; } = { day: 0, count: 0 }
  dayWithLeastComplaintsName: string = "";
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
    vAxis: { title: 'Cantidad', minValue: 0 },
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

// Calcular promedio de días de resolución de denuncias
const totalDaysResolution = this.complaintsData.reduce((totalDays, complaint) => {
  const createdDate = new Date((complaint.createdDate as unknown as string).replace(" ", "T"));
  const lastUpdatedDate = new Date((complaint.lastUpdatedDate as unknown as string).replace(" ", "T"));
  
  const differenceInDays = (lastUpdatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return totalDays + differenceInDays;
}, 0);

this.differenceInDaysResolution = totalDaysResolution / this.totalComplaints;


// Calcular día de la semana con más denuncias
const complaintsByDayOfWeek = this.complaintsData.reduce((acc: { [key: number]: number }, complaint) => {
  const createdDate = new Date((complaint.createdDate as unknown as string).replace(" ", "T"));
  const dayOfWeek = createdDate.getDay(); // Obtiene el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)

  acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1; // Contar denuncias por día de la semana
  return acc;
}, {});

// Determinar el día con el mayor número de denuncias
this.dayWithMostComplaints = Object.entries(complaintsByDayOfWeek).reduce((max, [day, count]) => {
  return count > max.count ? { day: Number(day), count } : max;
}, { day: -1, count: 0 });

// Para mostrar el nombre del día
const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
this.dayWithMostComplaintsName = daysOfWeek[this.dayWithMostComplaints.day];
    
// Determinar el día con el menor número de denuncias
this.dayWithLeastComplaints = Object.entries(complaintsByDayOfWeek).reduce((min, [day, count]) => {
  return count < min.count ? { day: Number(day), count } : min;
}, { day: -1, count: Infinity }); // Inicializamos con Infinity para asegurar que cualquier número será menor

// Para mostrar el nombre del día con la menor cantidad de denuncias
this.dayWithLeastComplaintsName = daysOfWeek[this.dayWithLeastComplaints.day];

  }

  // getMostFrequentUser(): number {
  //   if (!this.complaintsByUser) return 0;
  //   return Object.entries(this.complaintsByUser)
  //     .reduce((a, b) => a[1] > b[1] ? a : b)[0] as unknown as number;
  // }
}


