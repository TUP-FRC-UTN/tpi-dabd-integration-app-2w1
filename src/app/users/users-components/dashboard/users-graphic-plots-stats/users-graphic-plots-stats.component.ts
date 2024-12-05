import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../users-servicies/dashboard.service';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import {
  OwnersPlotsDistribution,
  PlotsByBlock,
  PlotsStats,
} from '../../../users-models/dashboard/plots-stats';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../../common/components/custom-select/custom-select.component';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { PlotService } from '../../../users-servicies/plot.service';
import { UsersKpiComponent } from '../users-kpi/users-kpi.component';
import { Router } from '@angular/router';
import { RoutingService } from '../../../../common/services/routing.service';

@Component({
  selector: 'app-users-graphic-plots-stats',
  standalone: true,
  imports: [
    GoogleChartsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    CustomSelectComponent,
    UsersKpiComponent,
  ],
  templateUrl: './users-graphic-plots-stats.component.html',
  styleUrls: ['./users-graphic-plots-stats.component.css'],
})
export class UsersGraphicPlotsStatsComponent implements OnInit {
  private readonly apiService = inject(DashboardService);
  private readonly plotService = inject(PlotService);
  private readonly routerService = inject(RoutingService);

  plotsByBlock: PlotsByBlock[] = [];
  ownerDistribution: OwnersPlotsDistribution[] = [];
  plotsStats: PlotsStats = new PlotsStats();

  startDate = new FormControl('');
  endDate = new FormControl('');

  filterForm: FormGroup = new FormGroup({
    block: new FormControl([]),
    type: new FormControl(''),
    status: new FormControl(''),
  });
  isSelecteDisabled = false;

  filteredPlotsStats: PlotsStats | null = null;
  filteredPlotsByBlock: PlotsByBlock[] = [];
  filteredOwnerDistribution: OwnersPlotsDistribution[] = [];

  blocksNumber: any[] = [];
  plotsTypes: PlotTypeModel[] = [];
  plotsStatus: PlotStateModel[] = [];

  isSelectDisabled = false;

  loadingPieChart = false;
  loadingBarChart = false;
  errorPieChart: string | null = null;
  errorBarChart: string | null = null;
  errorRangeDate: string | null = null;

  columnChart = ChartType.ColumnChart;
  barChartData: any[] = [];

  barChartOptions = {
    title: 'Distribución de Lotes por Manzana',
    titleTextStyle: { fontSize: 14 },
    isStacked: true,
    legend: { position: 'top', alignment: 'center' },
    series: {
      0: { labelInLegend: 'Disponibles', color: '#4CAF50' },
      1: { labelInLegend: 'Ocupados', color: '#2196F3' },
      2: { labelInLegend: 'En Construcción', color: '#FF9800' },
    },
    backgroundColor: 'trasparent',
    colors: ['#F4B400', '#DB4437', '#4285F4'],
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out',
    },
    hAxis: {
      title: 'Manzanas',
      titleTextStyle: { color: '#6c757d', fontSize: 14, bold: true },
      textStyle: { color: '#495057', fontSize: 12 },
      slantedText: true,
      slantedTextAngle: 45, // Rotar etiquetas para mejor legibilidad
      showTextEvery: 1,
    },
    vAxis: {
      title: 'Cantidad de Lotes',
      format: '0',
      minValue: 0,
      titleTextStyle: { color: '#6c757d', fontSize: 14, bold: true },
      textStyle: { color: '#495057', fontSize: 12 },
    },
    bar: { groupWidth: '80%' },
    tooltip: {
      showColorCode: true,
      trigger: 'both',
    },
  };

  pieChart = ChartType.PieChart;
  pieChartData: any[] = [];
  pieChartOptions = {
    title: 'Distribución de Lotes por Propietario',
    titleTextStyle: { fontSize: 14 },
    pieSliceText: 'percentage',
    series: {
      0: { color: '#FF9900' },
      1: { color: '#4285F4' },
    },
    colors: ['#FF9900', '#4285F4', '#34A853', '#EA4335', '#9334E6', '#FBBC05'],
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
      text: 'percentage',
    },
  };

  ngOnInit() {
    this.loadData();
    this.setFilterListeners();

    this.plotService.getAllTypes().subscribe({
      next: (data: PlotTypeModel[]) => {
        this.plotsTypes = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de lote:', err);
      },
    });

    this.plotService.getAllStates().subscribe({
      next: (data: PlotStateModel[]) => {
        this.plotsStatus = data;
      },
      error: (err) => {
        console.error('Error al cargar los estados de lote:', err);
      },
    });
  }

  private setFilterListeners() {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters() {
    this.errorBarChart = null;
    this.errorPieChart = null;

    this.filteredPlotsStats = { ...this.plotsStats };
    this.filteredPlotsByBlock = [...this.plotsByBlock];
    this.filteredOwnerDistribution = [...this.ownerDistribution];

    const { block, type, status } = this.filterForm.value;

    if (block && block.length > 0) {
      this.filteredPlotsByBlock = this.plotsByBlock.filter((item) =>
        block.includes(item.blockNumber)
      );
    }

    if (type || status) {
      this.apiService
        .getOwnersPlotsDistribution('', '', type, status)
        .subscribe({
          next: (data: OwnersPlotsDistribution[]) => {
            if (!data.length) {
              this.filteredOwnerDistribution = [];
              this.processPieChartData();
              return;
            }
            this.filteredOwnerDistribution = data;
            this.processPieChartData();
            this.loadingPieChart = false;
          },
          error: () => {
            this.errorPieChart =
              'Error al cargar la distribución de propietarios';
          },
        });

      this.apiService.getPlotsStats('', '', type, status).subscribe({
        next: (data: PlotsStats) => {
          this.filteredPlotsStats = data;
          this.updateKPIs(data);
        },
        error: (error) => {
          console.error('Error al cargar la estadísticas:', error);
        },
      });
    } else {
      this.filteredPlotsStats = { ...this.plotsStats };
      this.filteredOwnerDistribution = [...this.ownerDistribution];
    }

    this.processData();
  }

  private updateKPIs(stats: PlotsStats) {
    this.filteredPlotsStats = stats;
  }

  private processFilterOptions() {
    let blocks: any[] = [
      ...new Set(this.filteredPlotsByBlock.map((item) => item.blockNumber)),
    ];

    this.blocksNumber = blocks.map((block) => ({
      value: block,
      name: `Nro. Manzana: ${block}`,
    }));
  }

  private loadData() {
    this.loadingBarChart = true;
    this.loadingPieChart = true;
    this.loadStats();
    this.loadBarChart();
    this.loadPieChart();
    this.processFilterOptions();
  }

  loadStats() {
    this.apiService.getPlotsStats().subscribe({
      next: (data: PlotsStats) => {
        this.plotsStats = data;
        this.filteredPlotsStats = { ...this.plotsStats };
      },
      error: () => {
        console.error('Error al cargar las estadísticas');
      },
    });
  }

  loadBarChart() {
    this.apiService.getPlotsByBlock().subscribe({
      next: (data: PlotsByBlock[]) => {
        this.plotsByBlock = data;
        this.filteredPlotsByBlock = [...this.plotsByBlock];
        this.processData();
        this.processFilterOptions();
        this.loadingBarChart = false;
      },
      error: () => {
        this.errorBarChart = 'Error al cargar los datos de las manzanas';
      },
    });
  }

  loadPieChart() {
    this.apiService.getOwnersPlotsDistribution().subscribe({
      next: (data: OwnersPlotsDistribution[]) => {
        this.ownerDistribution = data;
        this.filteredOwnerDistribution = [...this.ownerDistribution];
        this.processPieChartData();
        this.loadingPieChart = false;
      },
      error: () => {
        this.errorPieChart = 'Error al cargar la distribución de propietarios';
      },
    });
  }

  private processData() {
    if (this.filteredPlotsByBlock.length === 0) {
      this.errorBarChart =
        'No se encontraron datos para los filtros seleccionados';
    }

    this.filteredPlotsByBlock.sort((a, b) => a.blockNumber - b.blockNumber);

    // Tomar solo las 10 primeras manzanas
    const displayData = this.filteredPlotsByBlock.slice(0, 10);

    this.barChartData = [
      ...displayData.map((item: PlotsByBlock) => [
        {
          v: item.blockNumber.toString(),
          f: `Mzna: ${item.blockNumber}`,
        },
        {
          v: item.available,
          f: `Lotes disponibles: ${item.available}`,
        },
        {
          v: item.occupied,
          f: `Lotes ocupados: ${item.occupied}`,
        },
        {
          v: item.inConstruction,
          f: `Lotes en construcción: ${item.inConstruction}`,
        },
      ]),
    ];
  }

  private processPieChartData() {
    if (!this.filteredOwnerDistribution?.length) {
      this.errorPieChart =
        'No se encontraron datos para los filtros seleccionados';
    }

    const sortedOwners = [...this.filteredOwnerDistribution].sort(
      (a, b) => b.plotCount - a.plotCount
    );

    const topOwners = sortedOwners.slice(0, 6);
    const othersCount = sortedOwners
      .slice(6)
      .reduce((sum, owner) => sum + owner.plotCount, 0);

    const totalPlots = this.filteredOwnerDistribution.reduce(
      (sum, owner) => sum + owner.plotCount,
      0
    );

    this.pieChartData = [
      ...topOwners.map((owner) => [
        {
          v: owner.ownerName,
          f: `${owner.ownerName} (${(
            (owner.plotCount / totalPlots) *
            100
          ).toFixed(1)}%)`,
        },
        {
          v: owner.plotCount,
          f: `Lotes: ${owner.plotCount}\nPorcentaje: ${(
            (owner.plotCount / totalPlots) *
            100
          ).toFixed(1)}%`,
        },
      ]),
    ];

    if (othersCount > 0) {
      const othersPercentage = (othersCount / totalPlots) * 100;
      this.pieChartData.push([
        {
          v: 'Otros',
          f: `Otros (${othersPercentage.toFixed(1)}%)`,
        },
        {
          v: othersCount,
          f: `Lotes: ${othersCount}\nPorcentaje: ${othersPercentage.toFixed(
            1
          )}%\nPropietarios: ${sortedOwners.length - 8}`,
        },
      ]);
    }

    this.pieChartOptions = {
      ...this.pieChartOptions,
      colors: [
        '#FF9900',
        '#4285F4',
        '#34A853',
        '#EA4335',
        '#9334E6',
        '#FBBC05',
        '#808080',
      ],
    };
  }

  filterByDate() {
    this.errorRangeDate = null;

    const startDateValue = this.startDate.value;
    const endDateValue = this.endDate.value;

    if (startDateValue && endDateValue) {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);

      if (start > end) {
        this.errorRangeDate =
          'La fecha de inicio no puede ser mayor a la fecha de fin';
        return;
      }

      const formattedStartDate = this.formatDate(start);
      const formattedEndDate = this.formatDate(end);

      this.updateDashboardData(formattedStartDate, formattedEndDate);
    }
  }

  private updateDashboardData(startDate: string, endDate: string) {
    const currentFilters = this.filterForm.value;
    this.errorBarChart = null;
    this.errorPieChart = null;

    this.loadingBarChart = true;
    this.loadingPieChart = true;

    this.apiService
      .getPlotsStats(
        startDate,
        endDate,
        currentFilters.type,
        currentFilters.status
      )
      .subscribe({
        next: (stats) => {
          this.filteredPlotsStats = stats;
          this.updateKPIs(stats);
          this.processFilterOptions();
        },
        error: (error) => {
          console.error('Error al obtener estadísticas:', error);
        },
      });

    this.apiService.getPlotsByBlock(startDate, endDate).subscribe({
      next: (plotsByBlock) => {
        this.filteredPlotsByBlock = plotsByBlock;
        this.processData();
        this.loadingBarChart = false;
      },
      error: (error) => {
        console.error('Error al obtener datos por bloque:', error);
      },
    });

    this.apiService
      .getOwnersPlotsDistribution(
        startDate,
        endDate,
        currentFilters.type,
        currentFilters.status
      )
      .subscribe({
        next: (distribution) => {
          this.filteredOwnerDistribution = distribution;
          this.processPieChartData();
          this.loadingPieChart = false;
        },
        error: (error) => {
          console.error('Error al obtener distribución:', error);
        },
      });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  resetAll() {
    this.filterForm.reset();
    this.startDate.reset();
    this.endDate.reset();
    this.loadData();
  }

  changeView() {
    this.routerService.redirect('main/users/dashboard');
  }

  maxBlocksValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedBlocks = control.value;
      if (selectedBlocks && selectedBlocks.length >= max) {
        return {
          customsErrors: {
            message: `Se alcanzó el máximo de ${max} manzanas seleccionadas`,
          },
        };
      }
      return null;
    };
  }
  

  onSelectedOptionsChange(event: any[]) {
    const blockControl = this.filterForm.get('block');
    
    if (event.length > 10) {
      event = event.slice(0, 10);
    }
    
    blockControl?.setValue(event);

    this.isSelectDisabled = event.length >= 10;
    
    if (event.length === 10) {
      blockControl?.setErrors({
        'customsErrors': {
          message: 'Se alcanzó el máximo de 10 manzanas seleccionadas'
        }
      });
    }
  }

  clearFilters() {
    this.startDate.reset();
    this.endDate.reset();
    this.filterForm.reset();
    const blockControl = this.filterForm.get('block');
    blockControl?.setValue([]);
    blockControl?.setErrors(null); 
    this.isSelectDisabled = false;
    this.errorRangeDate = null;
    this.errorBarChart = null;
    this.errorPieChart = null;
    this.loadData();
  }
}
