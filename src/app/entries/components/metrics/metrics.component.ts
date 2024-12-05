import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { AccessMetricsService } from '../../services/access-metric/access-metrics.service';
import { AccessUserReportService } from '../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import { MetricUser, RedirectKpis, UtilizationRate } from '../../models/access-metric/metris';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../common/services/tutorial.service';


@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [GoogleChartsModule, NgIf, CommonModule, FormsModule, NgSelectModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})

export class MetricsComponent implements OnInit, OnDestroy {
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;
  //metodos para mejorar estetica
  //mostrar mes actual
  showCurrentMonth(): string {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const today = new Date();
    const currentMonth = today.getMonth(); // Devuelve un nro de 0 (enero) a 11 (diciembre)

    return months[currentMonth];
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return text; // Verifica que el texto no este vacio

    if (text === 'total') {
      return 'Movimientos';
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  //FIN metodos para mejorar estetica

  constructor(private metricsService: AccessMetricsService, private userService: AccessUserReportService, private router: Router, private cdr: ChangeDetectorRef, private tutorialService: TutorialService
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
    const now = new Date();
    this.periodTo = this.formatYearMonth(now);

    // Fecha inicial por defecto (3 meses atrás)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    this.periodFrom = this.formatYearMonth(threeMonthsAgo);

    // Fecha mínima permitida (por ejemplo, 1 año atrás)
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    this.minDateFrom = this.formatYearMonth(oneYearAgo);
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


  topUser: any[] = []
  status: number = 0;



  roleTranslations: { [key: string]: string } = {
    'Employeed': 'Empleado',
    'Tenant': 'Inquilino',
    'Supplied': 'Proveedor',
    'Visitor': 'Visitante',
    'Owner': 'Vecino',
    'Gardener': 'Jardinero',
    'Service': 'Servicios',
    'Cleaning': 'Limpieza',
    'Worker': 'Trabajador',
    'Emergency': 'Emergencia',

  };

  translateRole(role: string): string {
    return this.roleTranslations[role] || role;
  }

  applyFilters(): void {
    // Obtener los valores de año y mes de los filtros
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    this.metricsService.getNeighborWithMostAuthorizations(
      fromDate.year,
      fromDate.month,
      toDate.year,
      toDate.month).subscribe(data => {
        this.userService.getUserById(data?.[0]).subscribe(userData => {
          this.redirectKpis.neighborAuthorizations = {
            name: userData,
            id: data?.[0] ?? null,
            count: data?.[1] ?? 0
          }
        });
      });

    this.metricsService.getGuardWithMostEntries(
      fromDate.year,
      fromDate.month,
      toDate.year,
      toDate.month).subscribe(data => {
        this.userService.getUserById(data?.[0]).subscribe(userData => {
          this.redirectKpis.guardEntries = {
            name: userData,
            id: data?.[0] ?? null,
            count: data?.[1] ?? 0
          }
        });
      });

    this.metricsService.getGuardWithMostExits(
      fromDate.year,
      fromDate.month,
      toDate.year,
      toDate.month).subscribe(data => {
        this.userService.getUserById(data?.[0]).subscribe(userData => {
          this.redirectKpis.guardExits = {
            name: userData,
            id: data?.[0] ?? null,
            count: data?.[1] ?? 0
          }
        });
      });


    // Aplicar el filtro de movimiento (ingresos, egresos o total) y mantener el tipo seleccionado
    this.metricsService.getMovementCountsFilter(
      fromDate.year,
      fromDate.month,
      toDate.month,
      this.chartType // 'ingresos' o 'egresos' o 'total'
    ).subscribe(data => {
      console.log("Data recibida de la API:", data);

      // Lógica para crear los datos del gráfico
      this.createChartData(data, fromDate, toDate);
    });

    // Obtener los datos de los usuarios top
    this.metricsService.getTopUsers(fromDate.month, toDate.month, fromDate.year).subscribe(topUsers => {
      console.log('Top 5 usuarios:', topUsers);

      // Filtrar usuarios para excluir los tipos "Visitor", "Tenant" y "Neighbor"
      const filteredTopUsers = topUsers.filter((user: any) =>
        user[1] !== 'Visitor' && user[1] !== 'Tenant' && user[1] !== 'Owner'
      );

      // Limitar a los primeros 5 usuarios después del filtrado
      this.topUser = filteredTopUsers.slice(0, 5);

      console.log('TOP USUARIO FILTRADO', this.topUser);
    });

    // Cargar los datos de utilización dependiendo de si es ingresos, egresos o total
    if (this.chartType === 'ingresos') {
      this.loadUtilizationData(fromDate.year, fromDate.month, toDate.month);
    } else if (this.chartType === 'egresos') {
      this.loadUtilizationExitData(fromDate.year, fromDate.month, toDate.month);
    } else if (this.chartType === 'total') {
      this.loadUtilizationTotalData(fromDate.year, fromDate.month, toDate.month);
    }
    this.onUserTypeChange()

    this.loadData();
    this.loadAccessCounts();

  }

  private createChartData(data: any, fromDate: any, toDate: any) {
    const diasOrdenados = [
      'Lunes', 'Martes', 'Miércoles', 'Jueves',
      'Viernes', 'Sábado', 'Domingo'
    ];

    if (this.chartType === 'ingresos') {
      // Mostrar solo ingresos
      this.columnChartOptions.series[0].labelInLegend = "Ingresos";
      this.columnChartOptions.colors[0] = '#4caf50';
      this.columnChartData = diasOrdenados.map((dia, index) => {
        const dayIndex = index === 6 ? 7 : index + 1;
        const ingresos = data[dayIndex]?.entries || 0;
        return [dia, ingresos];
      });
    } else if (this.chartType === 'egresos') {
      // Mostrar solo egresos
      this.columnChartOptions.series[0].labelInLegend = "Egresos";
      this.columnChartOptions.colors[0] = '#f44336';
      this.columnChartData = diasOrdenados.map((dia, index) => {
        const dayIndex = index === 6 ? 7 : index + 1;
        const egresos = data[dayIndex]?.exits || 0;
        return [dia, egresos];
      });
    } else {
      // Mostrar ingresos y egresos juntos
      this.columnChartOptions.series[0].labelInLegend = "Ingresos";
      this.columnChartOptions.series[1].labelInLegend = "Egresos";
      this.columnChartOptions.colors[0] = '#4caf50';
      this.columnChartOptions.colors[1] = '#f44336';
      this.columnChartData = diasOrdenados.map((dia, index) => {
        const dayIndex = index === 6 ? 7 : index + 1;
        const ingresos = data[dayIndex]?.entries || 0;
        const egresos = data[dayIndex]?.exits || 0;
        return [dia, ingresos, egresos];
      });
    }

    console.log('Datos del gráfico formateados:', this.columnChartData);
  }




  private formatYearMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  // Convierte string YYYY-MM a objeto con año y mes
  private parseYearMonth(yearMonth: string): { year: number, month: number } {
    const [year, month] = yearMonth.split('-').map(num => parseInt(num));
    return { year, month };
  }


  dailyAccessCount: number = 0;
  dailyExitCount: number = 0;

  totalAccesCount: number = 0;
  totalExitCount: number = 0;

  redirectKpis: RedirectKpis = {
    neighborAuthorizations: {
      name: null,
      id: null,
      count: 0
    },
    guardEntries: {
      name: null,
      id: null,
      count: 0
    },
    guardExits: {
      name: null,
      id: null,
      count: 0
    }
  };

  today = new Date();

  dayWithMostAccesses: string = '';
  accessCount = 0;

  dayWithMostExits: string = '';
  exitsCountPeak = 0;

  currentMonthAccessCount: number = 0;
  currentMonthExitCount: number = 0;



  //public accessData: DayOfWeekMetricDTO[] = [];

  monthEntry: string = '';
  monthExit: string = '';
  entriesCount: number = 0;
  exitCount: number = 0;

  periodFrom: string = this.getDefaultFromDate();
  periodTo: string = this.getCurrentYearMonth();
  thisPeriod: string = new Date().getFullYear().toString();
  minDateFrom: string = '2020-01';
  topMethodName: string = "";

  ngOnInit() {
    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );

    this.fetchTodayAccessCount();
    this.loadAccessCounts();
    this.getPeakDayAccess();
    this.getThisMonthCount()
    this.loadEntryExit()
    this.getTotalEntries()
    this.getTotalExits();
    this.getMostEntriesByMonth();
    this.getMostExitsByMonth();
    this.fetchTodayExitCount();
    this.getThisMonthCountExit();
    this.getPeakDayExit();
    this.applyFilters()
  }

  private getMonthsRange(start: number, end: number): number[] {
    const months = [];
    for (let i = start; i <= end; i++) {
      months.push(i);
    }
    return months;
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }





  getPeakDayExit(): void {
    this.metricsService.getExitCountByWeekAndDayOfWeek().subscribe((data) => {
      console.log(data, 'DATOS DE EGRESOS PICO');  // Verifica la estructura de la respuesta
      if (data) {
        this.dayWithMostExits = data.dayOfWeek;
        this.exitsCountPeak = data.exitsCountPeak;
        console.log('Día de egreso pico:', this.dayWithMostExits);
        console.log('Cantidad de egresos:', this.exitsCountPeak);
      }
    });
  }




  getPeakDayAccess(): void {
    this.metricsService.getAccessCountByWeekAndDayOfWeek().subscribe((data) => {

      if (data) {
        this.dayWithMostAccesses = data.dayOfWeek;
        this.accessCount = data.accessCount;
        console.log('Día de acceso pico:', this.dayWithMostAccesses);
        console.log('Cantidad de accesos:', this.accessCount);
      }
    });
  }


  private fetchTodayAccessCount(): void {
    this.metricsService.getDailyAccessData().subscribe(data => {
      let today = new Date();
      let todayString = today.getFullYear() + '-' +
        (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
        today.getDate().toString().padStart(2, '0');
      console.log('Fecha calculada en frontend (todayString):', todayString);
      console.log('Fechas recibidas desde el backend:', data.map(item => item.date));

      let todayData = data.find(item => item.date === todayString);
      console.log('Datos encontrados para hoy:', todayData);

      this.dailyAccessCount = todayData ? todayData.count : 0;
      console.log('Cantidad de accesos hoy:', this.dailyAccessCount);
    });
  }


  private fetchTodayExitCount(): void {
    this.metricsService.getDailyExitData().subscribe(data => {
      let today = new Date();
      let todayString = today.getFullYear() + '-' +
        (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
        today.getDate().toString().padStart(2, '0');
      console.log('Fecha calculada en frontend (todayString):', todayString);
      console.log('Fechas recibidas desde el backend:', data.map(item => item.date));

      let todayData = data.find(item => item.date === todayString);
      console.log('Datos encontrados para hoy:', todayData);

      this.dailyExitCount = todayData ? todayData.count : 0;
      console.log('Cantidad de accesos hoy:', this.dailyExitCount);
    });
  }

  getMostEntriesByMonth() {
    this.metricsService.getMonthWithMostEntries().subscribe(
      (data) => {
        this.monthEntry = data.month;
        this.entriesCount = data.entriesCount;
      },
      (error) => {
        console.error('Error fetching data', error);
      })
  }

  getMostExitsByMonth() {
    this.metricsService.getMonthWithMostExitss().subscribe(
      (data) => {
        this.monthExit = data.month;
        this.exitCount = data.exitsCount;
      },
      (error) => {
        console.error('Error fetching data', error);
      })
  }


  getTotalExits() {
    this.metricsService.getTotalExitsForCurrentYear().subscribe((data) => {
      this.totalExitCount = data
      console.log(data, 'Cantidad totaaaal');
    })
  }



  getTotalEntries() {
    this.metricsService.getTotalEntriesForCurrentYear().subscribe((data) => {
      this.totalAccesCount = data
      console.log(data, 'Cantidad totaaaal');
    })
  }

  getThisMonthCount(): void {
    this.metricsService.getThisMonthlyAccessCount().subscribe(data => {
      console.log("Data", data);
      this.currentMonthAccessCount = data;

    })
  }

  getThisMonthCountExit(): void {
    this.metricsService.getThisMonthlyExitCount().subscribe(data => {
      console.log("Data", data);
      this.currentMonthExitCount = data;

    })
  }

  utilizationData: any;
  loading = true;
  error: string | null = null;

  loadUtilizationData(year: number, startMonth: number, endMonth: number): void {
    this.loading = true;
    this.error = null;

    this.metricsService.getAccessCountByUserTypeFilter(year, startMonth, endMonth)
      .subscribe({
        next: (response) => {
          this.utilizationData = response;
          this.calculatePercentages(this.utilizationData, 'ingresos');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de ingresos';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }



  loadUtilizationExitData(year: number, startMonth: number, endMonth: number): void {
    this.loading = true;
    this.error = null;

    this.metricsService.getExitCountByUserTypeFilter(year, startMonth, endMonth)
      .subscribe({
        next: (response) => {
          this.utilizationData = response;
          this.calculatePercentages(this.utilizationData, 'egresos');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de egresos';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }

  loadUtilizationTotalData(year: number, startMonth: number, endMonth: number): void {
    this.loading = true;
    this.error = null;

    this.metricsService.getTotalCountsMovementsByFilter(year, startMonth, endMonth)
      .subscribe({
        next: (response) => {
          const mappedData = response.map(item => ({
            ...item,
            count: item.total
          }));

          this.utilizationData = mappedData;
          console.log('Response total (mapped)', this.utilizationData);

          this.calculatePercentages(this.utilizationData, 'total');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de egresos';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }


  uniqueData: UtilizationRate[] = [];

  calculatePercentages(data: UtilizationRate[], type: 'ingresos' | 'egresos' | 'total'): void {
    const groupedData = data.reduce<{ [key: string]: UtilizationRate }>((acc, item) => {
      if (acc[item.userType]) {
        acc[item.userType].count += item.count || 0;
      } else {
        acc[item.userType] = { userType: item.userType, count: item.count || 0 };
      }
      return acc;
    }, {});

    const uniqueData = Object.values(groupedData);
    const totalCount = uniqueData.reduce((sum, item) => sum + item.count, 0);

    if (totalCount > 0) {
      uniqueData.forEach(item => {
        item.percentage = parseFloat(((item.count / totalCount) * 100).toFixed(2));
      });
    } else {
      uniqueData.forEach(item => {
        item.percentage = 0;
      });
    }

    this.uniqueData = uniqueData;
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} por usuario:`, uniqueData);
  }

  redirect(metricUser: MetricUser, redirectType: string) {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);
    this.router.navigate(['main', 'entries', 'reports'], {
      state: {
        data: metricUser,
        type: redirectType,
        startMonth: fromDate.month,
        startYear: fromDate.year,
        endMonth: toDate.month,
        endYear: toDate.year
      }
    });
  }
  groupByUserType(data: any[]): any[] {
    const groupedData: { [key: string]: { userType: string, accessCount: number, utilizationPercentage: number } } = {};

    // Agrupar los datos por "userType"
    data.forEach(item => {
      if (groupedData[item.userType]) {
        // Si el tipo de usuario ya existe, sumamos los accesos
        groupedData[item.userType].accessCount += item.accessCount;
      } else {
        // Si es un tipo de usuario nuevo, lo agregamos
        groupedData[item.userType] = {
          userType: item.userType,
          accessCount: item.accessCount,
          utilizationPercentage: item.utilizationPercentage
        };
      }
    });

    // Convertimos el objeto agrupado de vuelta a un array
    return Object.values(groupedData);
  }




  private loadAccessCounts(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    this.metricsService.getAccessCountByUserTypeFilter(
      fromDate.year,
      fromDate.month,
      toDate.month
    ).subscribe(data => {
      console.log(data, "DATA FILTRADA DE GRAFICO DE COLUMNAS");

      const chartData: any[] = [];

      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      const userTypesData: { [key: string]: number[] } = {};
      const userTypes: string[] = [];
      const tooltips: string[][] = [];

      data.forEach(item => {
        const month = item.month - 1;
        const userType = item.userType;

        if (!userTypesData[userType]) {
          userTypesData[userType] = new Array(12).fill(0);
          userTypes.push(userType);
        }

        userTypesData[userType][month] = item.count;
      });

      const filteredMonths = months.slice(fromDate.month - 1, toDate.month);
      filteredMonths.forEach((month, i) => {
        const row: (string | number)[] = [month];

        userTypes.forEach(userType => {
          const count = userTypesData[userType][fromDate.month - 1 + i] || 0;
          row.push(count);
        });

        chartData.push(row);
      });

      this.barChartData = chartData;

      console.log('Datos del gráfico de columnas:', this.barChartData);

      const series: { [key: number]: { labelInLegend: string, type: string } } = userTypes.reduce((acc: { [key: number]: { labelInLegend: string, type: string } }, userType, index) => {
        acc[index] = {
          labelInLegend: this.translateRole(userType),
          type: 'column',
        };
        return acc;
      }, {} as { [key: number]: { labelInLegend: string, type: string } });

      this.barChartOptions = {
        // title: 'Comparación de Ingresos por Tipo de Usuario',
        legend: {
          position: 'top',
          textStyle: { color: '#6c757d', fontSize: 14 },
          maxLines: 3,
          alignment: 'center'
        },
        colors: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'],
        hAxis: {
          title: 'Meses',
          textStyle: { color: '#6c757d' },
          slantedText: true,
        },
        vAxis: {
          title: 'Cantidad de Ingresos',
          textStyle: { color: '#6c757d' },
          minValue: 0,
          format: '',
        },
        animation: {
          duration: 1000,
          easing: 'out',
          startup: true
        },
        series,

      };
    });
  }

  chartType: 'ingresos' | 'egresos' | 'total' = 'total';
  barChartType = ChartType.ColumnChart;
  barChartData: any[] = [];
  barChartOptions: any = {};
  selectedUserTypes: string[] = [];
  availableUserTypes = [
    { label: 'Empleado', value: 'Employeed' },
    { label: 'Proveedor', value: 'Supplied' },
    { label: 'Vecino', value: 'Owner' },
    { label: 'Inquilino', value: 'Tenant' },
    { label: 'Visitante', value: 'Visitor' },
    { label: 'Jardinero', value: 'Gardener' },
    { label: 'Servicios', value: 'Service' },
    { label: 'Limpieza', value: 'Cleaning' },
    { label: 'Trabajador', value: 'Worker' }
  ];

  onChartTypeChange() {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);
    this.loadEntryExit()
    if (this.chartType === 'ingresos') {
      this.onUserTypeChange()
      this.loadUtilizationData(fromDate.year, fromDate.month, toDate.month);
    } else if (this.chartType === 'egresos') {
      this.onUserTypeChange()
      this.loadUtilizationExitData(fromDate.year, fromDate.month, toDate.month);
    } else if (this.chartType === 'total') {
      this.onUserTypeChange()
      this.loadUtilizationTotalData(fromDate.year, fromDate.month, toDate.month);
    }
    this.loadEntryExit()
  }


  private loadData(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    const service = this.chartType === 'ingresos'
      ? this.metricsService.getAccessCountByUserTypeFilter(fromDate.year, fromDate.month, toDate.month)
      : this.chartType === 'egresos'
        ? this.metricsService.getExitCountByUserTypeFilter(fromDate.year, fromDate.month, toDate.month)
        : this.metricsService.getTotalCountsMovementsByFilter(fromDate.year, fromDate.month, toDate.month);

    service.subscribe(data => {
      // Filtrar por los tipos seleccionados o mostrar todos si no hay selección
      const filteredData = this.selectedUserTypes.length > 0
        ? data.filter(item => this.selectedUserTypes.includes(item.userType))
        : data;

      console.log('Datos filtrados:', filteredData);

      const userTypesData: { [key: string]: number[] } = {};
      const userTypes: string[] = [];

      filteredData.forEach(item => {
        const month = parseInt(item.month) - 1; // Convertimos a número por si viene como string
        const userType = item.userType;
        // Usamos item.total si existe, sino usamos item.count
        const value = item.total !== undefined ? item.total : item.count;

        if (!userTypesData[userType]) {
          userTypesData[userType] = new Array(12).fill(0);
          userTypes.push(userType);
        }

        userTypesData[userType][month] = value;
      });

      this.updateChartData(userTypesData, userTypes, fromDate, toDate);
    });
  }


  private updateChartData(userTypesData: any, userTypes: string[], fromDate: any, toDate: any): void {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const chartData: any[] = [];
    const filteredMonths = months.slice(fromDate.month - 1, toDate.month);

    filteredMonths.forEach((month, i) => {
      const row: (string | number)[] = [month];
      userTypes.forEach(userType => {
        const count = userTypesData[userType][fromDate.month - 1 + i] || 0;
        row.push(count);
      });
      chartData.push(row);
    });

    this.barChartData = chartData;
    this.updateChartOptions(userTypes);
  }


  private updateChartOptions(userTypes: string[]): void {



    this.barChartOptions = {
      // title: `${
      //   this.chartType === 'ingresos' 
      //     ? 'Ingresos' 
      //     : this.chartType === 'egresos' 
      //       ? 'Egresos'
      //       : 'Total de Movimientos'
      // } por Tipo de Usuario`,
      legend: { position: 'top', textStyle: { color: '#6c757d', fontSize: 14 }, maxLines: 3, alignment: 'left' },
      colors: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#808080', '#B5651D', '#FF0000'],
      hAxis: { title: 'Meses', textStyle: { color: '#6c757d' }, slantedText: true },
      vAxis: { title: `Cantidad de ${this.chartType === 'ingresos' ? 'Ingresos' : 'Egresos'}`, textStyle: { color: '#6c757d' }, minValue: 0, format: '' },
      animation: { duration: 1000, easing: 'out', startup: true },
      series: userTypes.reduce((acc: any, userType: string, index: number) => {
        acc[index] = { labelInLegend: this.translateRole(userType), type: 'column' };
        return acc;
      }, {})
    };
  }

  onUserTypeChange(): void {
    console.log('Tipos seleccionados:', this.selectedUserTypes);
    this.loadData();

    const filteredData = this.selectedUserTypes.length > 0
      ? this.utilizationData.filter((item: any) => this.selectedUserTypes.includes(item.userType))
      : this.utilizationData;

    this.calculatePercentages(filteredData, 'total');
  }



  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
  }

  columnChartType = ChartType.ColumnChart;
  columnChartData: any[] = [];
  columnChartOptions = {
    title: '',
    legend: {
      position: 'top',
      textStyle: { color: '#6c757d', fontSize: 14 },
      alignment: 'center',
      maxLines: 2
    },

    bar: { groupWidth: '100%' },
    hAxis: {
      title: 'Días de la semana',
      textStyle: { color: '#6c757d' }
    },
    vAxis: {
      title: 'Cantidad',
      textStyle: { color: '#6c757d' },
      minValue: 0,
      format: ''
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    series: {
      0: { labelInLegend: '' },
      1: { labelInLegend: '' },

    },
    colors: ['', '']
  };


  private loadEntryExit(): void {
    const fromDate = this.parseYearMonth(this.periodFrom);
    const toDate = this.parseYearMonth(this.periodTo);

    this.metricsService.getMovementCountsFilter(
      fromDate.year,
      fromDate.month,
      toDate.month,
      this.chartType // 'ingresos' o 'egresos'
    ).subscribe(data => {
      console.log("Data recibida de la API:", data);

      const diasOrdenados = [
        'Lunes', 'Martes', 'Miércoles', 'Jueves',
        'Viernes', 'Sábado', 'Domingo'
      ];

      // Crear el array de datos para el gráfico con cabeceras
      if (this.chartType === 'ingresos') {
        // Mostrar solo ingresos
        this.columnChartOptions.series[0].labelInLegend = "Ingresos"
        this.columnChartOptions.colors[0] = '#4caf50'
        this.columnChartData = [
          ...diasOrdenados.map((dia, index) => {
            const dayIndex = index === 6 ? 7 : index + 1;
            const ingresos = data[dayIndex]?.entries || 0;

            return [
              dia,            // Día de la semana
              ingresos        // Solo ingresos
            ];
          })
        ];
      } else if (this.chartType === 'egresos') {
        // Mostrar solo egresos
        this.columnChartOptions.series[0].labelInLegend = "Egresos"
        this.columnChartOptions.colors[0] = '#f44336'

        this.columnChartData = [
          ...diasOrdenados.map((dia, index) => {
            const dayIndex = index === 6 ? 7 : index + 1;
            const egresos = data[dayIndex]?.exits || 0;

            return [
              dia,            // Día de la semana
              egresos         // Solo egresos
            ];
          })
        ];
      } else {

        this.columnChartOptions.series[0].labelInLegend = "Egresos"
        this.columnChartOptions.series[1].labelInLegend = "Ingresos"

        this.columnChartOptions.colors[0] = '#f44336'
        this.columnChartOptions.colors[1] = '#4caf50'

        this.columnChartData = [
          ...diasOrdenados.map((dia, index) => {
            const dayIndex = index === 6 ? 7 : index + 1;

            const ingresos = data[dayIndex]?.entries || 0;
            const egresos = data[dayIndex]?.exits || 0;

            return [
              dia,        // Nombre del día
              ingresos,   // Ingresos
              egresos     // Egresos
            ];
          })
        ];
      }


      console.log('Datos del gráfico formateados:', this.columnChartData);
    });
  }


  resetFilters(): void {
    this.selectedUserTypes = [];

    this.chartType = 'total';

    this.periodFrom = this.getDefaultFromDate();
    this.periodTo = this.getCurrentYearMonth();

    this.applyFilters();
  }


  makeBig(nro: number) {
    this.status = nro;
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
      title: 'Comparación de Movimientos',
      text: 'Este gráfico compara la cantidad de movimientos por día, separando entre ingresos y egresos. Puede expandirlo para ver más información.', attachTo: {
        element: '#chartMovementComparison',
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
      title: 'Top 5 Ingresantes con más Movimientos',
      text: 'Acá puede ver el top 5 ingresantes con más movimientos dentro del período seleccionado. Puede expandirlo para ver más información.', attachTo: {
        element: '#chartTop5',
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
      title: 'Cantidad de Movimientos',
      text: 'En este gráfico se muestra la cantidad de accesos, separado según el tipo de visitante y dividido por temporada. Puede expandirlo para ver más información.', attachTo: {
        element: '#chartMovementAmount',
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
