import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SanctionService } from '../../../services/sanctions.service';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fine, ColumnChartKPIs, PieChartKPIs, TopExpenseKPIs } from '../../../models/Dashboard-models';
import { textShadow } from 'html2canvas/dist/types/css/property-descriptors/text-shadow';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PenaltiesModalFineComponent } from '../modals/penalties-get-fine-modal/penalties-get-fine-modal.component';
import { CustomKpiComponent } from '../../../../common/components/custom-kpi/custom-kpi.component';
import { fontWeight } from 'html2canvas/dist/types/css/property-descriptors/font-weight';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';



@Component({
  selector: 'app-penalties-fine-dashboard',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule, CustomKpiComponent],
  templateUrl: './penalties-fine-dashboard.component.html',
  styleUrl: './penalties-fine-dashboard.component.scss',
})
export class PenaltiesFineDashboardComponent implements OnInit, OnDestroy {

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;


  private sanctionsService: SanctionService = inject(SanctionService);
  finesData: Fine[] = [];
  status: number = 0;
  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentDate();
  constructor(
    private _modal: NgbModal,
    private renderer: Renderer2, private tutorialService: TutorialService
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


  //Filtros avanzados
  states: any[] = [];
  reportsReasons: ReportReasonDto[] = [];
  state = ''
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
  dayWithMostComplaints: { day: number; count: number; } = { day: 0, count: 0 }
  dayWithMostComplaintsName: string = "";
  dayWithLeastComplaints: { day: number; count: number; } = { day: 0, count: 0 }
  dayWithLeastComplaintsName: string = "";
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
    chartArea: { width: '100%', height: '100%' },
    sliceVisibilityThreshold: 0.01,
    textStyle: { fontSize: 9 },
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
    vAxis: { title: 'Cantidad', minValue: 0 },
    chartArea: { width: '70%', height: '55%' },
    legend: { position: 'right' },
    colors: ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#FF5733', '#C70039', '#900C3F', '#581845'],
    //tooltip: { isHtml: true }
  };

  //Limpia los filtros
  eraseFilters() {
    this.periodFrom = this.getDefaultFromDate();
    this.periodTo = this.getCurrentDate();
    this.state = '';
    this.reportReason = '';
    this.reportReason2 = '';
    this.updateCharts();
    this.states = [];
    this.reportsReasons = [];
    this.getReportsReasons();
    this.getStates();
  }


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

  openModalPreview(nro: number) {
    if (nro === 5 && this.highestFine) {
      this.openFineModal(this.highestFine.id);
    } else if (nro === 6 && this.lowestFine) {
      this.openFineModal(this.lowestFine.id);
    }
  }

  ngOnInit() {
    this.updateCharts();
    this.getReportsReasons();
    this.getStates();

    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
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
      title: 'Multas por Estado',
      text: 'Este gráfico muestra las multas del período seleccionado ordenadas por su estado actual. Puede elegir expandirlo para ver información más detallada.', attachTo: {
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
      title: 'Multas por Motivo',
      text: 'Este gráfico muestra las multas del período seleccionado ordenadas por motivo. Puede elegir expandirlo para ver información más detallada.', attachTo: {
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
      text: 'En este gráfico se muestra la comparación de la cantidad de multas recibidas por mes. Puede ver más información al expandir este gráfico.', attachTo: {
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
      text: 'Estos KPIs muestran información sobre la cantidad de multas, el promedio recibido por día y las estadísticas de la multa más alta y más baja. Al interactuar con estas últimas dos, puede ver información sobre la multa en cuestión.',
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

  // get currentYearMonth(): string {
  //   return this.getCurrentYearMonth();
  // }

  getCurrentDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // Cambiar a 6 meses atrás
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private updateCharts() {
    this.sanctionsService.getAllFines().subscribe({
      next: (fines: Fine[]) => {
        const fromDate = new Date(this.periodFrom);
        const toDate = new Date(this.periodTo);
        toDate.setDate(toDate.getDate() + 1);

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
    if (this.state == "") {
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
    } else {
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
    if (this.reportReason2 == "") {
      const fromDate = new Date(this.periodFrom);
      const toDate = new Date(this.periodTo);
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
    else {
      const fromDate = new Date(this.periodFrom);
      const toDate = new Date(this.periodTo);
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
    if (this.reportReason == "") {
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
    else {
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

    // Filtrar datos según los filtros seleccionados
    var filteredFines;
    if (this.status == 3) {
      filteredFines = this.finesData.filter(fine => {
        const matchesState = this.state ? fine.fineState === this.state : true;
        const matchesReason = this.reportReason2 ? fine.report.reportReason.reportReason === this.reportReason2 : true;
        return matchesState && matchesReason;
      });
    } else {
      filteredFines = this.finesData.filter(fine => {
        const matchesState = this.state ? fine.fineState === this.state : true;
        const matchesReason = this.reportReason ? fine.report.reportReason.reportReason === this.reportReason : true;
        return matchesState && matchesReason;
      });
    }

    // Total de multas realizadas
    this.totalFines = filteredFines.length;

    // Calcular multas por mes para obtener el promedio
    const finesByMonth: { [key: string]: number } = {};
    filteredFines.forEach(fine => {
      const fineDate = new Date(fine.createdDate);
      const monthKey = fineDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      finesByMonth[monthKey] = (finesByMonth[monthKey] || 0) + 1;
    });
    this.averageFinesPerMonth = this.totalFines / Object.keys(finesByMonth).length;

    // Multa de mayor monto
    this.highestFine = filteredFines.reduce((max: Fine | null, fine: Fine) => {
      return fine.amount > (max?.amount || 0) ? fine : max;
    }, null as Fine | null);

    // Distribución de multas por estado
    this.finesByState = filteredFines.reduce((acc: { [key: string]: number }, fine) => {
      acc[fine.fineState] = (acc[fine.fineState] || 0) + 1;
      return acc;
    }, {});

    // Calcular el total de multas en estado "Pagada" y "Pendiente de Pago"
    this.paidFinesCount = filteredFines.filter(fine => fine.fineState === 'Pagada').length;
    this.pendingFinesCount = filteredFines.filter(fine => fine.fineState === 'Pendiente de pago').length;

    // Distribución de multas por razón
    this.finesByReason = filteredFines.reduce((acc: { [key: string]: number }, fine) => {
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
    this.lowestFine = filteredFines.reduce((min: Fine | null, fine: Fine) => {
      return fine.amount < (min?.amount || Infinity) ? fine : min;
    }, null as Fine | null);
    const complaintsByDayOfWeek = filteredFines.reduce((acc: { [key: number]: number }, complaint) => {
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
  }



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
}



