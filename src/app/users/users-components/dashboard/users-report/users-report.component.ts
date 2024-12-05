import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { PlotStateCount } from '../../../users-models/dashboard/PlotStateCount';
import { DashboardService } from '../../../users-servicies/dashboard.service';
import { BehaviorSubject, combineLatest, map, Subscription } from 'rxjs';
import { PlotTypeCount } from '../../../users-models/dashboard/PlotTypeCount';
import { UsersKpiComponent } from '../users-kpi/users-kpi.component';
import { BlockData } from '../../../users-models/dashboard/BlockData';
import { Router } from '@angular/router';
import { AgeDistributionResponse } from '../../../users-models/dashboard/age-distribution';
import { RoutingService } from '../../../../common/services/routing.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-users-report',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule, ReactiveFormsModule, UsersKpiComponent],
  templateUrl: './users-report.component.html',
  styleUrl: './users-report.component.css'
})
export class UsersReportComponent implements OnInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  //Datos comunes a todos los graficos
  private readonly dashboardService = inject(DashboardService);
  private readonly routerService = inject(RoutingService);
  constructor(private tutorialService: TutorialService
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

  subscriptions = new Subscription();
  cardView: number = 0;
  errorRange: string | null = null;

  //Filtros comunes a todos los graficos
  startDate = new FormControl('');
  endDate = new FormControl('');
  plotTypes = new FormControl('');

  //-------------Grafico de torta para mostrar la cantidad de lotes por estado-------------
  loadingPieChart = true;
  errorPieChart: string | null = null;

  // Filtros para el gráfico de torta
  selectedPlotType: number | undefined = undefined;

  // Datos para el gráfico circular
  plotStateData: any[] = [];

  pieChart = ChartType.PieChart;
  pieChartOptions = {
    titleTextStyle: {
      color: '#495057',
      fontSize: 18,
      bold: true
    },
    pieHole: 0.4,
    backgroundColor: 'transparent',
    colors: ['#2196F3', '#4CAF50', '#F44336'],
    legend: {
      position: 'right',
      textStyle: { color: '#495057', fontSize: 12 },
      alignment: 'center'
    },
    chartArea: { width: '100%', height: '90%' },
    tooltip: {
      textStyle: { fontSize: 14, color: '#495057' },
      showColorCode: true,
      trigger: 'both'
    }
  };

  // Datos para los kpis 
  totalLots: number = 0;
  residentialLots: number = 0;
  commercialLots: number = 0;
  emptyLots: number = 0;

  ngOnInit() {
    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );

    //Grafico de torta de estado de los lotes
    this.loadPlotStateData();
    this.loadPlotTypeData();
    this.setupFilters();

    //Grafico de barras para comparar dos manzanas
    this.loadDataBlocks();
    this.setupSubscriptionsBlocks();
    this.setupSelectFiltersBlocks();

    //Grafico de barras para la distribución de edades
    this.loadDataAgeRange();
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
      text: 'Desde acá podrá filtrar por una fecha inicial y una fecha final. También puede clickear el botón de filtro para acceder a los filtros avanzados, y el botón de basura para deshacer los filtros aplicados.', attachTo: {
        element: '#filtros',
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
      title: 'Estado de los Lotes',
      text: 'Este gráfico muestra la distribción de los lotes según su estado actual. También puede interactuar con él para ver información más detallada.', attachTo: {
        element: '#chartPlotState',
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
      title: 'Último Período Facturado',
      text: 'Este gráfico muestra la distribución de usuarios por edad. También puede interactuar con él para ver información más detallada.', attachTo: {
        element: '#chartAgeRange',
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
      title: 'Comparación Interanual',
      text: 'Este gráfico muestra una comparación entre las manzanas según el área construida versus el área total. También puede interactuar con él para ver información más detallada.', attachTo: {
        element: '#chartBlocks',
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
      text: 'Estos KPIs muestran información sobre los lotes y usuarios. Al interactuar con ellos, puede ver información más detallada.', attachTo: {
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


  private setupFilters() {
    // Suscribirse a cambios en los filtros y actualizar los datos en consecuencia

    this.subscriptions.add(
      this.plotTypes.valueChanges.subscribe(value => {
        this.selectedPlotType = value ? Number(value) : undefined;
        this.applyFilters();
      })
    );
  }

  private applyFilters() {
    const startDate = this.startDate.value ? this.formatDate(new Date(this.startDate.value)) : undefined;
    const endDate = this.endDate.value ? this.formatDate(new Date(this.endDate.value)) : undefined;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.errorPieChart = 'La fecha inicial no puede ser mayor a la fecha final';
      return;
    }

    this.errorPieChart = null;
    this.loadPlotStateData(startDate, endDate, this.selectedPlotType);
    this.loadPlotTypeData(startDate, endDate);
  }
  private loadPlotStateData(startDate?: string, endDate?: string, plotType?: number) {
    this.loadingPieChart = true;
    this.errorPieChart = null;

    this.subscriptions.add(
      this.dashboardService.getPlotsByState(startDate, endDate, plotType).subscribe({
        next: (data: PlotStateCount[]) => {
          this.loadingPieChart = false;
          this.processPlotStateData(data);
          this.updateTotalLots(data);

          if (data.length === 0) {
            this.errorPieChart = 'No se encontraron datos para los filtros seleccionados';
          }
        },
        error: () => {
          this.errorPieChart = 'Error al cargar los datos de estado de los lotes';
          this.loadingPieChart = false;
        }
      })
    );
  }

  private loadPlotTypeData(startDate?: string, endDate?: string, plotType?: number) {

    this.subscriptions.add(
      this.dashboardService.getPlotsByType(startDate, endDate).subscribe({
        next: (data: PlotTypeCount[]) => {
          this.updateTypeCounts(data);
        },
        error: () => {
          console.error('Error al cargar los datos de tipo de lote');
        }
      })
    );

  }

  private processPlotStateData(data: PlotStateCount[]) {
    this.plotStateData = data.map(item => [
      `${item.state} (${item.count})`, item.count
    ]);
  }

  private updateTypeCounts(data: PlotTypeCount[]) {
    this.residentialLots = 0;
    this.commercialLots = 0;
    this.emptyLots = 0;
    data.forEach(item => {
      switch (item.type) {
        case 'Residencial':
          this.residentialLots = item.count;
          break;
        case 'Comercial':
          this.commercialLots = item.count;
          break;
        case 'Baldio':
          this.emptyLots = item.count;
          break;
      }
    });
  }

  private updateTotalLots(data: PlotStateCount[]) {
    this.totalLots = data.reduce((acc, curr) => acc + curr.count, 0);
  }


  //-------------Grafico de torta para mostrar la cantidad de lotes por estado-------------

  //-------------Grafico de barras para mostrar la coparativa entre dos manzanas-------------

  //Controles para los filtros
  blockControl1 = new FormControl(0);
  blockControl2 = new FormControl(0);


  blocksNumber: number[] = []; // números de las manzanas
  availableBlocksForSelect1: number[] = [];
  availableBlocksForSelect2: number[] = [];
  blocks: BlockData[] = [];
  private blocksSubject = new BehaviorSubject<BlockData[]>([]);

  loadingBlocksChart = true;
  errorBlocksChart: string | null = null;

  //Datos para renderizar el gráfico
  chartType: ChartType = ChartType.ColumnChart;
  chartData: any[] = [];

  chartOptions = {
    backgroundColor: 'transparent',
    chartArea: { width: '70%', height: '50%' },
    hAxis: { title: 'Métricas', titleTextStyle: { color: '#7f8c8d' } },
    vAxes: {
      0: { // Eje izquierdo para áreas
        title: 'Área (m²)',
        titleTextStyle: { color: '#7f8c8d' },
        gridlines: { color: '#f1f1f1' },
        minValue: 0
      },
      1: { // Eje derecho para porcentajes
        title: 'Porcentaje (%)',
        titleTextStyle: { color: '#7f8c8d' },
        gridlines: { color: '#f1f1f1' },
        minValue: 0,
        maxValue: 100,
        format: '#\'%\''
      }
    },
    seriesType: 'bars',
    series: {
      0: { color: '#5dade2', targetAxisIndex: 0, label: 'Área Total', labelInLegend: 'Mzna 1' },       // Área Total - Eje izquierdo
      1: { color: '#48c9b0', targetAxisIndex: 0, label: 'Área Construida', labelInLegend: 'Mzna 2' },  // Área Construida - Eje izquierdo
      2: { color: '#4f46e5', targetAxisIndex: 1, label: 'Área Construida', labelInLegend: 'Mzna 1' },  // % Construido - Eje derecho
      3: { color: '#f97316', targetAxisIndex: 1, label: 'Área Construida', labelInLegend: 'Mzna 2' }   // % No Construido - Eje derecho
    },
    legend: {
      position: 'right',
      alignment: 'center',
      textStyle: { color: '#7f8c8d', fontSize: 12 }
    },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    },
    tooltip: {
      trigger: 'both',
      showColorCode: true
    }
  };

  loadDataBlocks(): void {
    this.loadingBlocksChart = true;
    this.errorBlocksChart = null;

    this.dashboardService.getBlockStats().subscribe({
      next: (data) => {
        this.blocks = data;
        this.blocksNumber = data.map(block => block.blockNumber).sort((a, b) => a - b);
        this.blocksSubject.next(data);

        this.availableBlocksForSelect1 = [...this.blocksNumber];
        this.availableBlocksForSelect2 = [...this.blocksNumber];

        if (this.blocksNumber.length >= 2) {
          this.blockControl1.setValue(this.blocksNumber[0]);
          this.blockControl2.setValue(this.blocksNumber[1]);
        }
        this.loadingBlocksChart = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.errorBlocksChart = 'Ha ocurrido un error al cargar los datos. Por favor, intente nuevamente.';
        this.loadingBlocksChart = false;
      }
    });
  }

  private setupSubscriptionsBlocks(): void {
    combineLatest([
      this.blockControl1.valueChanges,
      this.blockControl2.valueChanges,
      this.blocksSubject
    ]).pipe(
      map(([block1, block2, blocks]) => {
        if (block1 && block2) {
          this.updateChartDataBlocks(Number(block1), Number(block2), blocks);
          this.updateSelectedBlocksKPIs(blocks);
          //Number(block1), Number(block2),
        }
      })
    ).subscribe();
  }

  private setupSelectFiltersBlocks(): void {
    this.blockControl1.valueChanges.subscribe(value => {
      if (value) {
        this.availableBlocksForSelect2 = this.blocksNumber.filter(block => block !== Number(value));
      } else {
        this.availableBlocksForSelect2 = [...this.blocksNumber];
      }
    });

    this.blockControl2.valueChanges.subscribe(value => {
      if (value) {
        this.availableBlocksForSelect1 = this.blocksNumber.filter(block => block !== Number(value));
      } else {
        this.availableBlocksForSelect1 = [...this.blocksNumber];
      }
    });
  }

  private updateChartDataBlocks(block1: number, block2: number, blocks: BlockData[]): void {

    const b1 = blocks.find(b => b.blockNumber === block1);
    const b2 = blocks.find(b => b.blockNumber === block2);

    this.chartOptions.series[0].labelInLegend = `Mzna ${block1}`;
    this.chartOptions.series[1].labelInLegend = `Mzna ${block2}`;
    this.chartOptions.series[2].labelInLegend = `Mzna ${block1}`;
    this.chartOptions.series[3].labelInLegend = `Mzna ${block2}`;

    if (!b1 || !b2) return;

    const b1PercentBuilt = Number(((b1.builtArea / b1.totalArea) * 100).toFixed(1));
    const b2PercentBuilt = Number(((b2.builtArea / b2.totalArea) * 100).toFixed(1));
    const b1PercentNotBuilt = Number((100 - b1PercentBuilt).toFixed(1));
    const b2PercentNotBuilt = Number((100 - b2PercentBuilt).toFixed(1));

    this.chartData = [
      ['Área Total',
        {
          v: b1.totalArea,
          f: `Manzana ${block1}: ${b1.totalArea.toLocaleString()} m²`
        },
        {
          v: b2.totalArea,
          f: `Manzana ${block2}: ${b2.totalArea.toLocaleString()} m²`
        },
        null,
        null
      ],
      ['Área Construida',
        {
          v: b1.builtArea,
          f: `Manzana ${block1}: ${b1.builtArea.toLocaleString()} m²`
        },
        {
          v: b2.builtArea,
          f: `Manzana ${block2}: ${b2.builtArea.toLocaleString()} m²`
        },
        null,
        null
      ],
      ['Porcentaje Construido',
        null,
        null,
        {
          v: b1PercentBuilt,
          f: `Manzana ${block1}: ${b1PercentBuilt}%`
        },
        {
          v: b2PercentBuilt,
          f: `Manzana ${block2}: ${b2PercentBuilt}%`
        }
      ],
      ['Porcentaje No Construido',
        null,
        null,
        {
          v: b1PercentNotBuilt,
          f: `Manzana ${block1}: ${b1PercentNotBuilt}%`
        },
        {
          v: b2PercentNotBuilt,
          f: `Manzana ${block2}: ${b2PercentNotBuilt}%`
        }
      ]
    ];
  }

  selectedBlockskPIs = {
    totalArea: 0,
    totalBuiltArea: 0,
    utilizationPercentage: 0,
    notUtilizationPercentage: 0
  };

  private updateSelectedBlocksKPIs(blocks: BlockData[]): void {
    //block1: number, block2: number,
    //const b1 = blocks.find(b => b.blockNumber === block1);
    //const b2 = blocks.find(b => b.blockNumber === block2);

    //if (!b1 || !b2) return;

    /*this.selectedBlockskPIs = {
      totalArea: b1.totalArea + b2.totalArea,
      totalBuiltArea: b1.builtArea + b2.builtArea,
      utilizationPercentage: ((b1.builtArea + b2.builtArea) / (b1.totalArea + b2.totalArea)) * 100,
      notUtilizationPercentage: 100 - (((b1.builtArea + b2.builtArea) / (b1.totalArea + b2.totalArea)) * 100)
    };*/
    this.selectedBlockskPIs = {
      totalArea: blocks.reduce((acc, b) => acc + b.totalArea, 0),
      totalBuiltArea: blocks.reduce((acc, b) => acc + b.builtArea, 0),
      utilizationPercentage: (blocks.reduce((acc, b) => acc + b.builtArea, 0) / blocks.reduce((acc, b) => acc + b.totalArea, 0)) * 100,
      notUtilizationPercentage: 100 - ((blocks.reduce((acc, b) => acc + b.builtArea, 0) / blocks.reduce((acc, b) => acc + b.totalArea, 0)) * 100)
    }
  }


  private updateDashboardBlocks(startDate: string, endDate: string) {

    this.loadingBlocksChart = true;
    this.errorBlocksChart = null;

    this.dashboardService
      .getBlockStats(
        startDate,
        endDate
      )
      .subscribe({
        next: (stats) => {
          this.blocks = stats;
          this.blocksNumber = stats.map(block => block.blockNumber).sort((a, b) => a - b);

          if (this.blocksNumber.length === 0) {
            this.errorBlocksChart = 'No se encontraron datos para los filtros seleccionados';
          }
          this.blocksSubject.next(stats);

          this.availableBlocksForSelect1 = [...this.blocksNumber];
          this.availableBlocksForSelect2 = [...this.blocksNumber];

          if (this.blocksNumber.length >= 2) {
            this.blockControl1.setValue(this.blocksNumber[0]);
            this.blockControl2.setValue(this.blocksNumber[1]);
          }
          this.loadingBlocksChart = false;
        },
        error: (error) => {
          console.error('Error al obtener estadísticas:', error);
          this.errorBlocksChart = 'Ha ocurrido un error al obtener las estadísticas. Por favor, intente nuevamente.';
          this.loadingBlocksChart = false;
        },
      });

  }


  loadPage() {
    this.loadDataBlocks();
    this.startDate.reset();
    this.endDate.reset();
  }
  //-------------Grafico de barras para mostrar la coparativa entre dos manzanas-------------

  //-------------Grafico de barras para la distribución de edades-------------

  private readonly apiService = inject(DashboardService);

  ageDistribution: AgeDistributionResponse = new AgeDistributionResponse();

  loadingAgeRange = true;
  errorAgeRange: string | null = null;


  columnChart = ChartType.ColumnChart;
  barChartData: any[] = [];

  barChartOptions = {
    legend: { position: 'right', alignment: 'center' },
    chartArea: { width: '70%', height: '50%' },
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

  pieChartAgeRange = ChartType.PieChart;
  pieChartData: any[] = [];
  pieChartAgeRangeOptions = {
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


  loadDataAgeRange() {
    this.loadingAgeRange = true;
    this.errorAgeRange = null;

    this.apiService.getAgeDistribution().subscribe({
      next: (data: AgeDistributionResponse) => {
        this.ageDistribution = data;
        this.loadingAgeRange = false;
        this.processDataAgeRange();
      },
      error: () => {
        this.errorAgeRange = 'Error al cargar las estadísticas';
        this.loadingAgeRange = false;
      },
    });
  }

  private processDataAgeRange() {

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

      this.updateDashboardBlocks(formattedStartDate, formattedEndDate);
      this.updateDashboardDataAge(formattedStartDate, formattedEndDate);
      this.updateDashboardData(formattedStartDate, formattedEndDate);
    }
  }
  private updateDashboardData(startDate: string, endDate: string) {
    const plotType = this.selectedPlotType;
    this.loadPlotStateData(startDate, endDate, plotType);
    this.loadPlotTypeData(startDate, endDate, plotType);
  }

  private updateDashboardDataAge(startDate: string, endDate: string) {

    this.errorAgeRange = null;
    this.apiService.getAgeDistribution(startDate, endDate).subscribe({
      next: (stats) => {
        this.ageDistribution = stats;
        this.loadingAgeRange = false;
        this.processDataAgeRange();
      },
      error: (error) => {
        console.error('Error al obtener estadísticas:', error);
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  clearFilters() {
    this.startDate.reset();
    this.endDate.reset();
    this.plotTypes.reset();
    this.selectedPlotType = undefined;
    this.loadPlotStateData();
    this.loadPlotTypeData();
    this.loadDataAgeRange();
    this.loadDataBlocks();
    this.errorRange = null;
    this.errorAgeRange = null;
    this.errorPieChart = null;
    this.errorBlocksChart = null;
  }

  //-------------Grafico de barras para la distribución de edades-------------


  redirect(url: string) {
    this.routerService.redirect('/main' + url);
  }
}
