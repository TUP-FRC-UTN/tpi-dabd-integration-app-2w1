import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule, NgIf, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseReportService } from '../../services/expenseReportServices/expense-report.service';
import { ExpenseData } from '../../models/ExpenseData';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { ExpensesKpiComponent } from '../expenses-kpi/expenses-kpi.component';
import moment from 'moment';
import { kpiExpense } from '../../models/kpiExpense';
import { LastBillRecord } from '../../models/LastBillRecord';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  mergeMap,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Category } from '../../models/category';
import { ExpensesFiltersComponent } from '../expenses-filters/expenses-filters.component';
import { Provider } from '../../models/provider';
import { ExpenseType } from '../../models/expenseType';
import { ProviderService } from '../../services/providerServices/provider.service';
import localeEsAr from '@angular/common/locales/es-AR';
import { ExpensesYearNgSelectComponent } from "../expenses-year-ngSelect/expenses-year-ngSelect.component";
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../common/services/tutorial.service';
registerLocaleData(localeEsAr, 'es-AR');
@Component({
  standalone: true,
  selector: 'app-report-expense',
  imports: [
    CommonModule,
    FormsModule,
    ExpensesKpiComponent,
    GoogleChartsModule,
    ExpensesFiltersComponent,
    ExpensesYearNgSelectComponent
],
  providers: [{ provide: 'LOCALE_ID', useValue: 'es-AR' }],
  templateUrl: './expenses-report.component.html',
  styleUrls: ['./expenses-report.component.scss'],
})
export class ReportExpenseComponent implements OnInit, OnDestroy {
  private dateChangeSubject = new Subject<{ from: string; to: string }>();
  private yearChangeSubject = new Subject<{from: number; to: number}>();
  private unsubscribe$ = new Subject<void>();
  selectedCategories: Category[] = [];
  selectedProviders: Provider[] = [];
  selectedType: ExpenseType[] = [];
  isLoading = false;
  dateFrom: string = '';
  dateTo: string = '';
  maxDateTo: string = '';
  expenseKpis: kpiExpense[] = [];
  lastBillRecord: LastBillRecord | null = null;
  comparateYearMonth: ExpenseData[] = [];
  expenseKpiFiltered: kpiExpense[] = [];
  lastBillRecordFiltered: kpiExpense[] = [];
  comparateYearMonthFiltered: ExpenseData[] = [];
  providersList: Provider[] = [];
  cardView: Number = 0;

  amountCommon: number = 0;
  amountExtraordinary: number = 0;
  amountIndividual: number = 0;
  amountNoteCredit: number = 0;

  lastBillCommon: number = 0;
  lastBillExtraordinary: number = 0;
  lastBillIndividual: number = 0;
  lastBillNoteCredit: number = 0;

  amountLastYear: number = 0;
  amountThisYear: number = 0;

  yearFrom: number =0;
  yearTo:number=0;
  currentYear: number = new Date().getFullYear();
  yearsFromList:number[]=[];
  yearsToList:number[]=[];

  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(
    private expenseReportService: ExpenseReportService,
    private providerService: ProviderService,
    private cdRef: ChangeDetectorRef,
    private tutorialService: TutorialService
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

  chartExpensesPeriod = {
    type: 'PieChart' as ChartType,
    data: [] as [string, number][],
    options: {
      //title: 'Distribución de Gastos por Categoría',
      pieHole: 0.4,
      chartArea: { width: '100%', height: '90%' },
      sliceVisibilityThreshold: 0.01,
    },
  };
  chartLastBill = {
    type: 'PieChart' as ChartType,
    data: [] as [string, number][],
    options: {
      //title: 'Distribución de Gastos por Categoría',
      pieHole: 0.4,
      chartArea: { width: '100%', height: '90%' },
      sliceVisibilityThreshold: 0.01,
    },
  };
  chartCompareYearMonth = {
    type: 'ColumnChart' as ChartType,
    columns: ['Meses'],
    data: [] as (string | number)[][],
    options: {
      hAxis: {
        title: 'Meses',
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 1,
        textStyle: { fontSize: 12 },
        minValue: 0,
      },
      vAxis: { 
        title: 'Monto ($)', 
        minValue: 0, 
        format: 'currency',
        viewWindow: {
          min: 0.00, // Fuerza el inicio en 0, incluso si no hay datos
        },
        viewWindowMode: 'explicit',
        baseline: 0,
      },
      chartArea: { width: '70%', height: '55%' },
      legend: { position: 'right' },
      colors: ['#4285F4', '#EA4335', '#34A853', '#FBBC05'],
      //tooltip: { isHtml: true }
    },
  };
  chartExpensesPeriodProviderOri = {
    type: 'BarChart' as ChartType,
    data: [] as [string, number][],
    options: {
      title: 'Gastos por Proveedor',
      chartArea: { width: '50%' },
      hAxis: {
        title: 'Monto',
        minValue: 0,
        format: 'currency',
      },
      vAxis: {
        title: 'Proveedor',
      },
      legend: { position: 'none' },
      colors: ['#1b9e77'],
    },
  };
  chartExpensesPeriodProvider = {
    type: 'BarChart' as ChartType,
    data: [] as [string, { v: number; f: string }][],
    options: {
      title: 'Gastos por Proveedor',
      chartArea: { width: '50%' },
      hAxis: {
        title: 'Monto',
        minValue: 0,
        format: 'currency',
      },
      vAxis: {
        title: 'Proveedor',
      },
      legend: { position: 'none' },
      colors: ['#1b9e77'],
    },
  };
  chartExpensesPeriodProviderLastYear = {
    type: 'BarChart' as ChartType,
    data: [] as [string, { v: number; f: string }][],
    options: {
      chartArea: { width: '50%' },
      hAxis: {
        title: 'Monto',
        minValue: 0,
        format: 'currency',
      },
      vAxis: {
        title: 'Proveedor',
      },
      legend: { position: 'none' },
      colors: ['#1b9e77'],
    },
  };
  chartExpensesPeriodProviderThisYear = {
    type: 'BarChart' as ChartType,
    data: [] as [string, { v: number; f: string }][],
    options: {
      chartArea: { width: '50%' },
      hAxis: {
        title: 'Monto',
        minValue: 0,
        format: 'currency',
      },
      vAxis: {
        title: 'Proveedor',
      },
      legend: { position: 'none' },
      colors: ['#1b9e77'],
    },
  };

  ngOnInit() {
    this.loadProviders();
    console.log('ngOnInit called');
    this.loadDates();
    this.setupDateChangeObservable();
    this.setupYearChangeObservable();
    this.initialKpis();
    this.initialLastBillRecord();
    this.initialcomparateYearMonth();

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

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
      title: 'Gastos del Período',
      text: 'En este gráfico se muestran los gastos del período seleccionado, con información resumida. También puede interactuar con él para ver información más detallada.', attachTo: {
        element: '#chartPeriod',
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
      text: 'Este gráfico muestra los gastos del último período facturado, con información resumida. También puede interactuar con él para ver información más detallada.', attachTo: {
        element: '#chartLastBill',
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
      text: 'Este gráfico muestra la comparación de gastos entre los meses del año, comparando también con los meses del año anterior. También puede interactuar con él para ver información más detallada.', attachTo: {
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
      text: 'Estos KPIs muestran en orden el total de gastos del período seleccionado, el total del último período facturado y el índice de variación. También puede interactuar con ellos para ver información más detallada.', attachTo: {
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

  loadProviders() {
    this.providerService.getProviders().subscribe({
      next: (data: Provider[]) => {
        this.providersList = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  
  loadDates() {
    const today = moment();
    this.dateTo = today.format('YYYY-MM-DD');
    this.maxDateTo = this.dateTo;
    this.dateFrom = today.subtract(1, 'month').format('YYYY-MM-DD');

    this.yearFrom = this.currentYear - 1;
    this.yearTo = this.currentYear;
    this.yearsFromList= this.generateYearRange(2000,this.yearFrom);
    this.yearsToList= this.generateYearRange(2001,this.yearTo);

  }
  private setupDateChangeObservable() {
    this.dateChangeSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(
          (prev, curr) => prev.from === curr.from && prev.to === curr.to
        ),
        tap(() => (this.isLoading = true)),
        switchMap(({ from, to }) =>
          this.expenseReportService
            .getKpiData(from, to)
            .pipe(finalize(() => (this.isLoading = false)))
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (kpiExpenses: kpiExpense[]) => {
          this.expenseKpis = kpiExpenses;
          //this.updateKpi();
          this.filteredCharts();
        },
        error: (error) => {
          console.error('Error fetching bills:', error);
        },
      });
  }
  private setupYearChangeObservable() {
    this.yearChangeSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(
          (prev, curr) => prev.from === curr.from && prev.to === curr.to
        ),
        tap(() => (this.isLoading = true)),
        switchMap(({ from, to }) =>
          this.expenseReportService
            .getExpenseData(from, to)
            .pipe(finalize(() => (this.isLoading = false)))
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (expenseData: ExpenseData[]) => {
          this.comparateYearMonth = expenseData;
          //this.updateKpi();
          this.filteredCharts();
        },
        error: (error) => {
          console.error('Error fetching bills:', error);
        },
      });
  }

  initialKpis() {
    this.expenseReportService
      .getKpiData(this.dateFrom, this.dateTo)
      .pipe(take(1))
      .subscribe({
        next: (kpiExpenses: kpiExpense[]) => {
          this.expenseKpis = kpiExpenses;
          this.updateKpi();
        },
        error(error) {
          console.log(error);
        },
      });
  }
  updateKpi() {
    this.expenseKpiFiltered = this.filterTypeKpi(this.expenseKpis.slice());
    this.expenseKpiFiltered = this.filterCategoryKpi(this.expenseKpiFiltered);
    this.expenseKpiFiltered = this.filterProviderKpi(this.expenseKpiFiltered);
    this.amountCommon = this.sumAmounts('COMUN', this.expenseKpiFiltered);
    this.amountExtraordinary = this.sumAmounts(
      'EXTRAORDINARIO',
      this.expenseKpiFiltered
    );
    this.amountIndividual = this.sumAmounts(
      'INDIVIDUAL',
      this.expenseKpiFiltered
    );
    this.amountNoteCredit = this.sumAmounts(
      'NOTE_OF_CREDIT',
      this.expenseKpiFiltered
    );
    const aggregatedData = this.sumAmountByCategory(this.expenseKpiFiltered);
    if (this.cardView == 1) {
      const providerData = this.sumAmountByProviders(this.expenseKpiFiltered);
      this.chartExpensesPeriodProvider.data = providerData;
    }

    this.chartExpensesPeriod.data = aggregatedData;
  }

  filterCategoryKpi(list: kpiExpense[]): kpiExpense[] {
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(
        (category) => category.id as number
      ); // Extraer los ids de las categorías seleccionadas
      return list.filter((expense) =>
        selectedCategoryIds.includes(expense.categoryId)
      ); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }
  filterTypeKpi(list: kpiExpense[]): kpiExpense[] {
    if (this.selectedType && this.selectedType.length > 0) {
      const selectedTypeIds = this.selectedType.map((type) => type.id); // Extraer los ids de las categorías seleccionadas
      return list.filter((expense) =>
        selectedTypeIds.includes(expense.expenseType)
      ); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }
  filterProviderKpi(list: kpiExpense[]): kpiExpense[] {
    if (this.selectedProviders && this.selectedProviders.length > 0) {
      const selectedProviderIds = this.selectedProviders.map(
        (provider) => provider.id
      ); // Extraer los ids de las categorías seleccionadas
      return list.filter((expense) =>
        selectedProviderIds.includes(expense.providerId)
      ); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }

  initialLastBillRecord() {
    this.expenseReportService
      .getLastBillRecord()
      .pipe(take(1))
      .subscribe({
        next: (lastBillRecord: LastBillRecord) => {
          this.lastBillRecord = lastBillRecord;
          this.updateLastBillRecord();
        },
        error(error) {
          console.log(error);
        },
      });
  }
  updateLastBillRecord() {
    if (this.lastBillRecord) {
      this.lastBillRecordFiltered = this.filterTypeKpi(
        this.lastBillRecord.bills.slice()
      );
      this.lastBillRecordFiltered = this.filterCategoryKpi(
        this.lastBillRecordFiltered
      );
      this.lastBillRecordFiltered = this.filterProviderKpi(
        this.lastBillRecordFiltered
      );
      this.lastBillCommon = this.sumAmounts(
        'COMUN',
        this.lastBillRecordFiltered
      );
      this.lastBillExtraordinary = this.sumAmounts(
        'EXTRAORDINARIO',
        this.lastBillRecordFiltered
      );
      this.lastBillIndividual = this.sumAmounts(
        'INDIVIDUAL',
        this.lastBillRecordFiltered
      );
      this.lastBillNoteCredit = this.sumAmounts(
        'NOTE_OF_CREDIT',
        this.lastBillRecordFiltered
      );
      const aggregatedData = this.sumAmountByCategory(
        this.lastBillRecordFiltered
      );
      if (this.cardView == 2) {
        const providerData = this.sumAmountByProviders(
          this.lastBillRecordFiltered
        );
        this.chartExpensesPeriodProvider.data = providerData;
      }
      this.chartLastBill.data = aggregatedData;
    }
  }

  initialcomparateYearMonth() {
    this.expenseReportService
      .getExpenseData(this.yearFrom,this.yearTo)
      .pipe(take(1))
      .subscribe({
        next: (expenseData: ExpenseData[]) => {
          this.comparateYearMonth = expenseData;
          this.updatecomparateYearMonth();
        },
        error(error) {
          console.log(error);
        },
      });
  }
  updatecomparateYearMonth() {
    this.comparateYearMonthFiltered = this.filerTypecomparateYearMonth(
      this.comparateYearMonth.slice()
    );
    this.comparateYearMonthFiltered = this.filerCategorycomparateYearMonth(
      this.comparateYearMonthFiltered
    );
    this.comparateYearMonthFiltered = this.filerProvidercomparateYearMonth(
      this.comparateYearMonthFiltered
    );
    this.amountLastYear = this.sumAmountByYear(
      this.yearFrom,
      this.comparateYearMonthFiltered
    );
    this.amountThisYear = this.sumAmountByYear(
      this.yearTo,
      this.comparateYearMonthFiltered
    );
    const data = this.sumAmountByYearMonth(this.comparateYearMonthFiltered);
    if (this.cardView == 3) {
      this.chartExpensesPeriodProviderLastYear.data =
        this.sumAmountByProvidersYear(
          this.comparateYearMonthFiltered,
          this.yearFrom,
          this.chartExpensesPeriodProviderLastYear
        );
      this.chartExpensesPeriodProviderThisYear.data =
        this.sumAmountByProvidersYear(
          this.comparateYearMonthFiltered,
          this.yearTo,
          this.chartExpensesPeriodProviderThisYear
        );
    }
    this.chartCompareYearMonth.data = data;
  }

  filerCategorycomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(
        (category) => category.id
      );
      return list.filter((expense) =>
        selectedCategoryIds.includes(expense.categoryId)
      );
    }
    return list;
  }
  filerTypecomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedType && this.selectedType.length > 0) {
      const selectedTypeIds = this.selectedType.map((type) => type.id);
      return list.filter((expense) =>
        selectedTypeIds.includes(expense.expense_type)
      );
    }
    return list;
  }
  filerProvidercomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedProviders && this.selectedProviders.length > 0) {
      const selectedProviderIds = this.selectedProviders.map(
        (provider) => provider.id
      );
      return list.filter((expense) =>
        selectedProviderIds.includes(expense.providerId)
      );
    }
    return list;
  }

  sumAmounts(expenseType: string, list: any[]): number {
    const amountCommon = list
      .filter((m) => m.expenseType == expenseType)
      .reduce((sum, current) => sum + current.amount, 0);
    return amountCommon;
  }
  sumAmountByCategoryOri(list: kpiExpense[]): any {
    const aggregatedData = list.reduce((acc: [string, number][], exp) => {
      const category = exp.description || 'Sin Categoría'; // Asignar un valor por defecto en caso de que `description` esté indefinido
      const amount =
        typeof exp.amount === 'number'
          ? exp.amount
          : parseFloat(exp.amount as string); // Convertir `amount` si es necesario

      const existing = acc.find((item) => item[0] === category);
      if (existing) {
        existing[1] += amount;
      } else {
        acc.push([category, amount]);
      }
      return acc;
    }, []);

    const result = aggregatedData.map(([category, amount]) => [
      category,
      amount < 0 ? 0 : amount,
    ]);

    return result;
  }
  sumAmountByCategory(list: kpiExpense[]): any {
    const aggregatedData = list.reduce((acc: [string, number][], exp) => {
      const category = exp.description || 'Sin Categoría';
      const amount =
        typeof exp.amount === 'number'
          ? exp.amount
          : parseFloat(exp.amount as string);

      const existing = acc.find((item) => item[0] === category);
      if (existing) {
        existing[1] += amount;
      } else {
        acc.push([category, amount]);
      }
      return acc;
    }, []);

    // Formatea los montos para el tooltip y elimina valores negativos
    const result = aggregatedData.map(([category, amount]) => [
      category,
      {
        v: amount < 0 ? 0 : amount, // valor real para el gráfico
        f: (amount < 0 ? 0 : amount).toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }), // valor formateado para el tooltip
      },
    ]);

    return result;
  }
  sumAmountByProviders(list: kpiExpense[]): any {
    console.log('entrando a filtrar y los proveedores son', this.providersList);

    // Agrupar y sumar montos por proveedor
    const aggregatedData = list.reduce((acc: [string, number][], exp) => {
      const providerId = exp.providerId || null; // Id del proveedor
      const amount =
        typeof exp.amount === 'number'
          ? exp.amount
          : parseFloat(exp.amount as string);
      let providerName = '';

      if (providerId) {
        const provider = this.providersList.find((m) => m.id == providerId);
        if (provider) providerName = provider.description;
      }

      const existing = acc.find((item) => item[0] === providerName);
      if (existing) {
        existing[1] += amount;
      } else {
        acc.push([providerName, amount]);
      }
      return acc;
    }, []);

    // Calcular el monto máximo para determinar la escala
    const maxAmount = Math.max(...aggregatedData.map((item) => item[1]));
    let scale = 1;
    let scaleLabel = 'Monto ($)';

    if (maxAmount >= 1_000_000) {
      scale = 1_000_000;
      scaleLabel = 'Montos en millones de pesos';
    } else if (maxAmount >= 100_000) {
      scale = 1_000;
      scaleLabel = 'Montos en miles de pesos';
    }

    // Generar datos escalados para visualización y tooltip
    const result = aggregatedData
      .map(([providerName, amount]) => [
        providerName,
        {
          v: amount < 0 ? 0 : amount / scale, // Valor escalado para el gráfico
          f: (amount < 0 ? 0 : amount).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }), // Valor original para tooltip
        },
      ])
      .sort((a, b) => (b[1] as { v: number }).v - (a[1] as { v: number }).v).slice(0,5);

    // Actualizar la etiqueta del eje horizontal (hAxis)
    this.chartExpensesPeriodProvider.options.hAxis.title = scaleLabel;

    return result;
  }
  sumAmountByProvidersYear(list: ExpenseData[], year: number, chart: any): any {
    console.log('entrando a filtrar y los proveedores son', this.providersList);
    list = list.filter((m) => m.year == year);
    // Agrupar y sumar montos por proveedor
    const aggregatedData = list.reduce((acc: [string, number][], exp) => {
      const providerId = exp.providerId || null; // Id del proveedor
      const amount =
        typeof exp.amount === 'number'
          ? exp.amount
          : parseFloat(exp.amount as string);
      let providerName = '';

      if (providerId) {
        const provider = this.providersList.find((m) => m.id == providerId);
        if (provider) providerName = provider.description;
      }

      const existing = acc.find((item) => item[0] === providerName);
      if (existing) {
        existing[1] += amount;
      } else {
        acc.push([providerName, amount]);
      }
      return acc;
    }, []);

    // Calcular el monto máximo para determinar la escala
    const maxAmount = Math.max(...aggregatedData.map((item) => item[1]));
    let scale = 1;
    let scaleLabel = 'Monto ($)';

    if (maxAmount >= 1_000_000) {
      scale = 1_000_000;
      scaleLabel = 'Montos en millones de pesos';
    } else if (maxAmount >= 100_000) {
      scale = 1_000;
      scaleLabel = 'Montos en miles de pesos';
    }

    // Generar datos escalados para visualización y tooltip
    const result = aggregatedData
      .map(([providerName, amount]) => [
        providerName,
        {
          v: amount < 0 ? 0 : amount / scale, // Valor escalado para el gráfico
          f: (amount < 0 ? 0 : amount).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }), // Valor original para tooltip
        },
      ])
      .sort((a, b) => (b[1] as { v: number }).v - (a[1] as { v: number }).v).slice(0,5);

    // Actualizar la etiqueta del eje horizontal (hAxis)
    chart.options.hAxis.title = scaleLabel;
    return result;
  }
  sumAmountByYearMonth(list: ExpenseData[]): any {
    const years:number[]=[];
    years.push(this.yearFrom);
    years.push(this.yearTo);

    // Define las columnas para el gráfico
    this.chartCompareYearMonth.columns = [
      'Meses',
      ...years.map((year) => year.toString()),
    ];

    // Crear objeto para almacenar la suma acumulada por mes y año
    const aggregatedData = list.reduce((acc, d) => {
      const key = `${d.year}-${d.month}`;
      if (!acc[key]) acc[key] = 0;
      acc[key] += d.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calcular el monto máximo para ajustar la escala
    const maxAmount = Math.max(...Object.values(aggregatedData));
    let scale = 1;
    let scaleLabel = 'Monto ($)';

    if (maxAmount >= 1_000_000) {
      scale = 1_000_000;
      scaleLabel = 'Montos en millones de pesos';
    } else if (maxAmount >= 100_000) {
      scale = 1_000;
      scaleLabel = 'Montos en miles de pesos';
    }

    // Generar datos mensuales, aplicando la escala solo para visualización
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyData = months.map((month) => {
      const monthName = new Date(0, month - 1).toLocaleString('es', {
        month: 'short',
      });
      const row = [
        monthName,
        ...years.map((year) => {
          const key = `${year}-${month}`;
          return {
            v: (aggregatedData[key] || 0) / scale, // Valor escalado para el gráfico
            f: `${(aggregatedData[key] || 0).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}`, // Formato original para tooltip
          };
        }),
      ];
      return row;
    });

    // Actualizar la etiqueta del eje vertical
    this.chartCompareYearMonth.options.vAxis.title = scaleLabel;

    return monthlyData;
  }
  sumAmountByYear(year: number, list: any[]): number {
    const amount = list
      .filter((m) => m.year == year)
      .reduce((sum, current) => sum + current.amount, 0);
    return amount;
  }

  get titleLAstYear() {
    return 'Total ' + this.yearFrom.toString();
  }
  get titleThisYear() {
    return 'Total ' + this.yearTo.toString();;
  }
  get percentageVariation() {
    if (this.amountLastYear == 0) return 0;

    return (this.amountThisYear - this.amountLastYear) / this.amountLastYear;
  }

  get totalLastBillRecord() {
    let amount =
      this.lastBillCommon +
      this.lastBillExtraordinary +
      this.lastBillIndividual +
      this.lastBillNoteCredit;
    if (this.lastBillRecord && this.lastBillRecord.id > 0) {
      amount = amount + this.lastBillRecord.fineAmount;
    }
    return amount;
  }

  filteredCharts() {
    this.updateKpi();
    this.updateLastBillRecord();
    this.updatecomparateYearMonth();
    this.cdRef.detectChanges();
  }

  filterDataOnChange() {
    this.dateChangeSubject.next({ from: this.dateFrom, to: this.dateTo });
    this.yearChangeSubject.next({ from: this.yearFrom, to: this.yearTo });
  }
  clearFiltered() {
    this.selectedCategories = [];
    this.selectedProviders = [];
    this.selectedType = [];
    this.loadDates();
    this.filterDataOnChange();

    this.filteredCharts();
  }
  changeView(view: number) {
    this.cardView = view;
    if (view == 1) {
      this.updateKpi();
    }
    if (view == 2) {
      this.updateLastBillRecord();
    }
    if (view == 3) {
      this.updatecomparateYearMonth();
    }
    this.cdRef.detectChanges()
  }

  updateYear(input: 'from' | 'to') {
    // Asegura que el valor ingresado esté en el rango permitido y tenga 4 dígitos
    if (this.yearFrom.toString().length != 4) {
      return
    }
    if (this.yearTo.toString().length != 4) {
      return
    }
  
    // Ajuste automático de yearTo o yearFrom para mantener diferencia de un año
    if (input === 'from') {
      this.yearTo = this.yearFrom + 1;
    } else if (input === 'to') {
      this.yearFrom = this.yearTo - 1;
    }
    // Llamada a la API cuando el rango cambia
    this.filterDataOnChange();
  }

  generateYearRange(startYear: number, endYear: number): number[] {
    const years: number[] = [];
       
    const minYear = Math.min(startYear, endYear);
    const maxYear = Math.max(startYear, endYear);
  
    for (let year = minYear; year <= maxYear; year++) {
      years.push(year);
    }
  
    return years;
  }
}
