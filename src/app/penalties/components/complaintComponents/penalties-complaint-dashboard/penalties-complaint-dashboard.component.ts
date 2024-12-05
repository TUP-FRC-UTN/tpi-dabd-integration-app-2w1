import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ComplaintService } from '../../../services/complaints.service';
import { ComplaintDto, EstadoDenuncia, TipoDenuncia, } from '../../../models/complaint';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { State } from '@popperjs/core';
import { ReportReason } from '../../../models/Dashboard-models';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';
import { textShadow } from 'html2canvas/dist/types/css/property-descriptors/text-shadow';
import { CustomKpiComponent } from '../../../../common/components/custom-kpi/custom-kpi.component';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

//declare let bootstrap: any;
@Component({
  selector: 'app-penalties-complaint-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule, CustomKpiComponent],
  templateUrl: './penalties-complaint-dashboard.component.html',
  styleUrl: './penalties-complaint-dashboard.component.scss',
})
export class PenaltiesComplaintDashboardComponent implements OnInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

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
  differenceInDaysResolution: number = 0;
  complaintsByStatePercentage: { state: string; percentage: number }[] = [];
  stateWithHighestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  stateWithLowestPercentage: { state: string; percentage: number } = { state: '', percentage: 0 };
  dayWithMostComplaints: { day: number; count: number; } = { day: 0, count: 0 }
  dayWithMostComplaintsName: string = "";
  dayWithLeastComplaints: { day: number; count: number; } = { day: 0, count: 0 }
  dayWithLeastComplaintsName: string = "";
  weekWithMostComplaints: { week: number; month: string; count: number } = { week: 0, month: '', count: 0 };
  /////////////////////////
  state = '';
  private _reportReason: string = '';
  get reportReason(): string {
    return this._reportReason;
  }
  set reportReason(value: string) {
    this._reportReason = value;
    this._reportReason2 = value;
    this.applyFilters();
  }

  private _reportReason2: string = '';
  get reportReason2(): string {
    return this._reportReason2;
  }
  set reportReason2(value: string) {
    this._reportReason2 = value;
    this._reportReason = value;
    this.applyFilters();
  }
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
    chartArea: { width: '100%', height: '100%' },
    sliceVisibilityThreshold: 0.01,
    textStyle: { fontSize: 11 },
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
    vAxis: { title: 'Cantidad', minValue: 0 },
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

  constructor(private renderer: Renderer2, private tutorialService: TutorialService
  ) {
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


  ngOnDestroy(): void {
    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  ngOnInit() {
    this.updateCharts();
    this.getReportReasons();
    this.getStates();

    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  checkChartData(): boolean {
    return this.lineChartData && this.lineChartData.length > 0 &&
      this.lineChartData.some(row => row.length > 0);
  }
  //Limpia los filtros
  eraseFilters() {
    this.periodFrom = this.getDefaultFromDate();
    this.periodTo = this.getCurrentYearMonth();
    this.state = '';
    this.reportReason = '';
    this.reportReason2 = '';
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
      const fromDate = new Date(this.periodFrom);
      const toDate = new Date(this.periodTo);
      toDate.setDate(toDate.getDate() + 1);
      const complaintsInRange = this.complaintsData.filter((complaint) => {
        const complaintDate = new Date(complaint.createdDate);
        return complaintDate >= fromDate && complaintDate < toDate;
      });
      const complaintsByMonth = complaintsInRange.reduce(
        (acc: any, complaint) => {
          const month = new Date(complaint.createdDate).toLocaleString('default', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {}
      );
      const lineChartData = [];
      let currentDate = new Date(fromDate);
      while (currentDate < toDate) {
        const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        lineChartData.push([monthLabel, complaintsByMonth[monthLabel] || 0]);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      this.lineChartData = lineChartData;
    } else {
      const fromDate = new Date(this.periodFrom);
      const toDate = new Date(this.periodTo);
      toDate.setDate(toDate.getDate() + 1);
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
          const month = new Date(complaint.createdDate).toLocaleString('default', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {}
      );
      const lineChartData = [];
      let currentDate = new Date(fromDate);
      while (currentDate < toDate) {
        const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
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
        const fromDate = new Date(this.periodFrom);
        const toDate = new Date(this.periodTo);
        toDate.setDate(toDate.getDate() + 1);
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
    // Filtrar datos según los filtros seleccionados

    var filteredComplaints;
    if (this.status == 3) {
      filteredComplaints = this.complaintsData.filter(complaint => {
        const matchesState = this.state ? complaint.complaintState === this.state : true;
        const matchesReason = this.reportReason2 ? complaint.complaintReason === this.reportReason2 : true;
        return matchesState && matchesReason;
      });
    } else {
      filteredComplaints = this.complaintsData.filter(complaint => {
        const matchesState = this.state ? complaint.complaintState === this.state : true;
        const matchesReason = this.reportReason ? complaint.complaintReason === this.reportReason : true;
        return matchesState && matchesReason;
      });
    }

    console.log('Filtro por state:', this.state, 'Filtro por reason:', this.reportReason);
    console.log('Denuncias filtradas:', filteredComplaints.length, filteredComplaints);
    // Total de denuncias realizadas
    this.totalComplaints = filteredComplaints.length;

    // Calcular denuncias por mes para obtener el promedio
    const complaintsByMonth: { [key: string]: number } = {};
    filteredComplaints.forEach(complaint => {
      const complaintDate = new Date(complaint.createdDate);
      const monthKey = complaintDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      complaintsByMonth[monthKey] = (complaintsByMonth[monthKey] || 0) + 1;
    });
    this.averageComplaintsPerMonth = this.totalComplaints / Object.keys(complaintsByMonth).length;

    // Denuncia con mayor cantidad de archivos adjuntos
    this.complaintWithMostFiles = filteredComplaints.reduce((max: ComplaintDto | null, complaint: ComplaintDto) => {
      return complaint.fileQuantity > (max?.fileQuantity || 0) ? complaint : max;
    }, null as ComplaintDto | null);

    // Distribución de denuncias por estado
    this.complaintsByState = filteredComplaints.reduce((acc: { [key: string]: number }, complaint) => {
      acc[complaint.complaintState] = (acc[complaint.complaintState] || 0) + 1;
      return acc;
    }, {});

    // Distribución de denuncias por razón
    this.complaintsByReason = filteredComplaints.reduce((acc: { [key: string]: number }, complaint) => {
      const reason = complaint.complaintReason || complaint.anotherReason;
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    // Distribución de denuncias por usuario
    this.complaintsByUser = filteredComplaints.reduce((acc: { [key: number]: number }, complaint) => {
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
    const totalDaysResolution = filteredComplaints.reduce((totalDays, complaint) => {
      // Obtener las fechas en formato de cadena
      const createdDateStr = complaint.createdDate as unknown as string;
      const lastUpdatedDateStr = complaint.lastUpdatedDate as unknown as string;

      // Verificar que ambas fechas no sean nulas o indefinidas
      if (createdDateStr && lastUpdatedDateStr) {
        // Reemplazar el espacio por 'T' para formar un formato ISO adecuado
        const createdDateFormatted = createdDateStr.replace(" ", "T");
        const lastUpdatedDateFormatted = lastUpdatedDateStr.replace(" ", "T");

        // Crear objetos Date
        const createdDate = new Date(createdDateFormatted);
        const lastUpdatedDate = new Date(lastUpdatedDateFormatted);

        // Verificar si las fechas son válidas
        if (isNaN(createdDate.getTime()) || isNaN(lastUpdatedDate.getTime())) {
          console.error('Fecha inválida:', createdDateFormatted, lastUpdatedDateFormatted);
          return totalDays;  // Si alguna de las fechas es inválida, retornamos el total sin cambios
        }

        // Calcular la diferencia en días
        const differenceInDays = (lastUpdatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

        // Depurar los valores
        console.log('Días de diferencia:', differenceInDays, createdDateFormatted, lastUpdatedDateFormatted);

        return totalDays + differenceInDays;
      } else {
        // Si alguna de las fechas es nula o indefinida, no calculamos la diferencia
        console.error('Datos de fecha inválidos:', createdDateStr, lastUpdatedDateStr);
        return totalDays;
      }
    }, 0);

    // Calcular el promedio de días de resolución
    this.differenceInDaysResolution = totalDaysResolution / this.totalComplaints;

    console.log('Promedio de días de resolución:', this.differenceInDaysResolution);

    // Calcular día de la semana con más denuncias
    const complaintsByDayOfWeek = filteredComplaints.reduce((acc: { [key: number]: number }, complaint) => {
      const createdDate = new Date((complaint.createdDate as unknown as string).replace(" ", "T"));
      const dayOfWeek = createdDate.getDay(); // Obtiene el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)

      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1; // Contar denuncias por día de la semana
      return acc;
    }, {});

    // Determinar el día con el mayor número de denuncias
    this.dayWithMostComplaints = Object.entries(complaintsByDayOfWeek).reduce((max, [day, count]) => {
      return count > max.count ? { day: Number(day), count } : max;
    }, { day: -1, count: 0 });

    // Determinar el día con el menor número de denuncias
    this.dayWithLeastComplaints = Object.entries(complaintsByDayOfWeek).reduce((min, [day, count]) => {
      return count < min.count ? { day: Number(day), count } : min;
    }, { day: -1, count: Infinity }); // Inicializamos con Infinity para asegurar que cualquier número será menor

    // Para mostrar el nombre del día con la menor cantidad de denuncias
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    this.dayWithMostComplaintsName = daysOfWeek[this.dayWithMostComplaints.day];
    this.dayWithLeastComplaintsName = daysOfWeek[this.dayWithLeastComplaints.day];

    // Calcular semana con más denuncias
    const complaintsByWeek = filteredComplaints.reduce((acc: { [key: string]: number }, complaint) => {
      const complaintDate = new Date((complaint.createdDate as unknown as string).replace(" ", "T"));
      const weekNumber = this.getWeekNumberInMonth(complaintDate);
      const month = complaintDate.toLocaleString('default', { month: 'long' });
      const key = `${month} - Semana ${weekNumber}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const maxWeek = Object.entries(complaintsByWeek).reduce((max, [week, count]) => {
      return count > max.count ? { week, count } : max;
    }, { week: '', count: 0 });

    const [month, week] = maxWeek.week.split(' - Semana ');
    this.weekWithMostComplaints = { week: Number(week), month, count: maxWeek.count };

  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeekNumberInMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const pastDaysOfMonth = (date.getTime() - firstDayOfMonth.getTime()) / 86400000;
    return Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay() + 1) / 7);
  }

  // getMostFrequentUser(): number {
  //   if (!this.complaintsByUser) return 0;
  //   return Object.entries(this.complaintsByUser)
  //     .reduce((a, b) => a[1] > b[1] ? a : b)[0] as unknown as number;
  // }

  @ViewChild('filterModal') filterModal!: ElementRef;

  openFilterModal() {
    const modalElement = this.filterModal.nativeElement;
    this.renderer.setStyle(modalElement, 'display', 'block');
    setTimeout(() => {
      this.renderer.addClass(modalElement, 'show');
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '0px');
    }, 10);
  }

  closeFilterModal() {
    const modalElement = this.filterModal.nativeElement;
    this.renderer.removeClass(modalElement, 'show');
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'padding-right');
    setTimeout(() => {
      this.renderer.setStyle(modalElement, 'display', 'none');
    }, 150);
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
      id: 'subject-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar por una fecha inicial y una fecha final. También puede clickear el botón de filtro para acceder a los filtros avanzados, y el botón de basurero para deshacer los filtros aplicados.', attachTo: {
        element: '#filters',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]

    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Denuncias por Estado',
      text: 'Este gráfico muestra las denuncias del período seleccionado ordenadas por su estado actual. Puede elegir expandirlo para ver información más detallada.', attachTo: {
        element: '#chartSanctionsByState',
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
      title: 'Denuncias por Motivo',
      text: 'Este gráfico muestra las denuncias del período seleccionado ordenadas por motivo. Puede elegir expandirlo para ver información más detallada.', attachTo: {
        element: '#chartSanctionsByReason',
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
      title: 'Comparación del Período',
      text: 'En este gráfico se muestra la comparación de la cantidad de denuncias recibidas por mes. Puede ver más información al expandir este gráfico.', attachTo: {
        element: '#chartCompare',
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
      title: 'KPIs',
      text: 'Estos KPIs muestran información sobre la cantidad de denuncias y el promedio recibido por día. ',
      attachTo: {
        element: '#kpis',
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

}


