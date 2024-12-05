import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { GoogleChartsModule, ChartType } from "angular-google-charts";
import { AllNotifications } from "../models/all-notifications";
import { Access } from "../models/access";
import { Fine } from "../models/fine";
import { Payments } from "../models/payments";
import { Inventory } from "../models/inventory";
import { General } from "../models/general";
import { NotificationRegisterService } from "../service/notification-register.service";
import { SelectMultipleComponent } from "../select-multiple/select-multiple.component";
import Shepherd from "shepherd.js";
import { Subscription } from "rxjs";
import { TutorialService } from "../../common/services/tutorial.service";

@Component({
  selector: 'app-notification-home',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule, ReactiveFormsModule, SelectMultipleComponent],
  templateUrl: './notification-home.component.html',
  styleUrl: './notification-home.component.scss'
})
export class NotificationHomeComponent implements OnInit{
    //output para mostrar el titulo de la pag
    @Output() sendTitle = new EventEmitter<string>();
  
    notificationTypes: any[] = [
      { value: "Multas", name: "Multas" },
      { value: "Accesos", name: "Accesos" },
      { value: "Pagos", name: "Pagos" },
      {value: "Inventario",name: "Inventario"}
    ];
  
    selectedNotificationType: string[] = [];
  
    dropdownSeleccionadas: any[] = [];
    kpiTotalRead = 0
    kpiTotalUnread = 0
    kpiGeneral = 0
    maxNotificationsDay: string = "";
    maxNotificationsType: string = "";
    maxNotificationsCount: number = 0;
    maxNotificationsTypeCount: number = 0;
    maxNotificationsHour: string = "";
    maxNotificationsHourCount: number = 0;
    maxNotificationsMonth: string = "";
    maxNotificationsMonthCount: number = 0;
    maxNotificationsRead: number = 0;
    maxNotificationsUnread: number = 0;
    column2ChartType: ChartType = ChartType.BarChart;
    columnChartType: ChartType = ChartType.ColumnChart;
    c3ChartType: ChartType = ChartType.PieChart;
    form: FormGroup;
    status: number = 0;
    columnChartData: any[] = [];
    columnChartData2: any[] = [];
    columnChartData3: any[] = [];
    columnChartData4: any[] = [];
    columnChartData5: any[] = [];
    columnChartData6: any[] = [];
    notificationsLunes: number = 0;
    notificationsMartes: number = 0;
    notificationsMiercoles: number = 0;
    notificationsJueves: number = 0;
    notificationsViernes: number = 0;
    notificationsSabado: number = 0;
    notificationsDomingo: number = 0;
    private tour: Shepherd.Tour;
    tutorialSubscription = new Subscription();
  
    allNotifications: AllNotifications = {
      fines: [],
      access: [],
      payments: [],
      generals: [],
      inventories: [],
    };
    //contador para mostrar en KPI de Total de notificaciones enviadas
    allNotificationsCounter = 0;
    
    accessList: Access[] = [];
    finesList: Fine[] = [];
    paymentsList: Payments[] = [];
    generalsList: General[] = [];
    inventoryList: Inventory[] = [];
    filterForm: FormGroup<{ startDate: FormControl<string | null>; endDate: FormControl<string | null>; readStatus: FormControl<string | null>; }>;
  
    constructor(
      private chartDataService: NotificationRegisterService,
      private fb: FormBuilder,
      private tutorialService: TutorialService
    ) {
      this.filterForm = this.fb.group({
        startDate: [''],
        endDate: [''],
        readStatus: ['Todas']
      });
    
      this.form = new FormGroup({
        startDate: new FormControl(new Date()),
        endDate: new FormControl(new Date()),
      });

      this.tour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: {
            enabled: true,
          },
          arrow: false,
  
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
  
    columnChartOptions = {
      //title: "Notificaciones Enviadas por Día de la Semana",
      legend: { position: "right" },
      chartArea: { width: "93%", height: "80%" },
      animation: {
        startup: true,
        duration: 500,
        easing: 'out',
      },
      vAxis: {format:'0'},
      colors: [
        "#4285F4",
        "#34A853",
        "#FBBC05",
        "#EA4335",
        "#FF6D01",
        "#46BDC6",
        "#B080D6",
      ],
    };
  
    columnChartOptions2 = {
      //title:"Notificaciones Enviadas por Tipo (Accesos, Pagos, Multas, Inventario)",
      hAxis: {
        title: "Cantidad de Notificaciones",
        textStyle: {
          fontSize: 14,
        },
      },
      vAxis: {
        textStyle: {
          fontSize: 14,
        },
      },
      legend: { position: "none" },
      chartArea: { width: "80%", height: "70%" },
      colors: ["purple"],
    };
  
    columnChartOptions5 = {
      title: "Notificaciones Leidas y No Leidas por Semana",
      legend: { position: "right" },
      chartArea: { width: "80%", height: "100%" },
      pieHole: 0.4, //Esto es un semi-donut del pie
      colors: ["red", "green"],
    };
  
    ngOnInit(): void {
      this.loadKpiData();
  
  
      this.formatDate(new Date());
      this.initializeDates();
  
      this.filterForm.valueChanges.subscribe(() => {
        console.log(this.dropdownSeleccionadas)
        this.filterListByDate();
        this.filterListByStatus();
        console.log("testest")
      });
  
      this.filterListByDate();
      
      this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
        () => {
          this.startTutorial();
        }
      );
    }

    ngOnDestroy(): void {
      this.tutorialSubscription.unsubscribe();
      if (this.tour) {
        this.tour.complete();
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
        id: 'filter-step',
        title: 'Filtros',
        text: 'Desde acá podrá filtrar los gráficos por fecha. También puede agregar filtros avanzados clickeando en el boton azul de filtros, o borrar los filtros aplicados con el botón de basura.',      attachTo: {
          element: '#filtros',
          on: 'auto'
        },
        buttons: [
          {
            text: 'Siguiente',
            action: this.tour.next,
          }
        ]
        
      });
      
      this.tour.addStep({
        id: 'charts-step',
        title: 'Gráficos',
        text: 'Acá puede ver gráficos y KPIs con información resumida sobre el total de notificaciones enviadas, según los filtros aplicados.',
        attachTo: {
          element: '#charts',
          on: 'top-start'
        },
        buttons: [
          {
            text: 'Anterior',
            action: this.tour.back
          },
          {
            text: 'Siguiente',
            action: this.tour.next,
          }
        ]
        
      });
  
      this.tour.addStep({
        id: 'perDayChart-step',
        title: 'Notificaciones por Día',
        text: 'Este gráfico muestra el número de notificaciones enviadas por día de la semana.',
        attachTo: {
          element: '#chartPerDay',
          on: 'auto'
        },
        buttons: [
          {
            text: 'Anterior',
            action: this.tour.back
          },
          {
            text: 'Siguiente',
            action: this.tour.next,
          }
        ]
        
      });
  
      this.tour.addStep({
        id: 'perTypeChart-step',
        title: 'Notificaciones por tipo',
        text: 'Este gráfico muestra el número de notificaciones enviadas por tipo.',
        attachTo: {
          element: '#chartPerType',
          on: 'auto'
        },
        buttons: [
          {
            text: 'Anterior',
            action: this.tour.back
          },
          {
            text: 'Siguiente',
            action: this.tour.next,
          }
        ]
        
      });
  
      this.tour.addStep({
        id: 'kpis-step',
        title: 'KPIs',
        text: 'Estos KPIs muestran la cantidad total y el estado de las notificaciones enviadas, mostrando las generales por separado.',
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

  
    loadKpiData(): void {
      this.chartDataService.getData().subscribe((data: AllNotifications) => {
        this.allNotifications = data;
        this.accessList = [...data.access];
        this.finesList = [...data.fines];
        this.paymentsList = [...data.payments];
        this.generalsList = [...data.generals];
        this.inventoryList = [...data.inventories];
        
        this.loadChartData();
        this.calculatePercentages()
        this.allNotificationsCounter = this.calculateTotalNotifications();
  
        const allNotifications = this.flattenNotifications(data);
        const groupedByDay = this.groupByDay(allNotifications);
        const groupedByDayOfWeek = this.groupByDayOfWeek(allNotifications);
        const maxDay = this.findMaxNotificationsDay(groupedByDay);
        const groupedByType = this.groupByType(allNotifications);
        const maxType = this.findMaxNotificationsType(groupedByType);
        const groupedByHour = this.groupByHour(allNotifications);
        const maxHour = this.findMaxNotificationsHour(groupedByHour);
        const groupedByMonth = this.groupByMonth(allNotifications);
        const maxMonth = this.findMaxNotificationsMonth(groupedByMonth);
        const groupedByReadStatus = this.groupByReadStatus(allNotifications);
        const readNotificationsRate =
          this.getReadNotificationsRate(groupedByReadStatus);
        this.maxNotificationsRead = parseFloat(readNotificationsRate.toFixed(2));
        this.maxNotificationsUnread = parseFloat(
          (100 - readNotificationsRate).toFixed(2)
        );
  
        this.maxNotificationsDay = maxDay.day;
        this.maxNotificationsCount = maxDay.count;
        this.notificationsLunes = groupedByDayOfWeek["Lunes"] || 0;
        this.notificationsMartes = groupedByDayOfWeek["Martes"] || 0;
        this.notificationsMiercoles = groupedByDayOfWeek["Miércoles"] || 0;
        this.notificationsJueves = groupedByDayOfWeek["Jueves"] || 0;
        this.notificationsViernes = groupedByDayOfWeek["Viernes"] || 0;
        this.notificationsSabado = groupedByDayOfWeek["Sábado"] || 0;
        this.notificationsDomingo = groupedByDayOfWeek["Domingo"] || 0;
        this.maxNotificationsType = maxType.type;
        this.maxNotificationsTypeCount = maxType.count;
        this.maxNotificationsHour = maxHour.hour;
        this.maxNotificationsHourCount = maxHour.count;
        this.maxNotificationsMonth = maxMonth.month;
        this.maxNotificationsMonthCount = maxMonth.count;
      console.log(this.columnChartData5);
      })
    }
  
    flattenNotifications(
      data: AllNotifications
    ): { type: string; date: string; read: boolean }[] {
      const all = [
        ...data.fines.map((x) => ({
          type: "Fine",
          date: x.created_datetime.toString(),
          read: x.markedRead || false,
        })),
        ...data.access.map((x) => ({
          type: "Access",
          date: x.created_datetime.toString(),
          read: x.markedRead || false,
        })),
        ...data.payments.map((x) => ({
          type: "Payment",
          date: x.created_datetime.toString(),
          read: x.markedRead || false,
        })),
        ...data.inventories.map((x) => ({
          type: "Inventory",
          date: x.created_datetime.toString(),
          read: x.markedRead || false,
        })),
      ];
      return all;
    }
  
    groupByDay(notifications: { date: string }[]): { [key: string]: number } {
      return notifications.reduce((acc, curr) => {
        const date = new Date(curr.date).toISOString().split("T")[0]; // Formato YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    }
  
    groupByType(notifications: { type: string }[]): { [key: string]: number } {
      return notifications.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    }
  
    groupByHour(notifications: { date: string }[]): { [key: string]: number } {
      return notifications.reduce((acc, curr) => {
        const hour = new Date(curr.date).getHours();
        const formattedHour = `${hour < 10 ? "0" : ""}${hour}:00`;
        acc[formattedHour] = (acc[formattedHour] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    }
  
    groupByMonth(notifications: { date: string }[]): { [key: string]: number } {
      return notifications.reduce((acc, curr) => {
        const month = new Date(curr.date).getMonth(); // Obtenemos el mes (0-11)
        const months = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];
        acc[months[month]] = (acc[months[month]] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    }
  
    groupByReadStatus(
      notifications: { type: string; date: string; read: boolean }[]
    ): { [key: string]: { read: number; unread: number } } {
      return notifications.reduce((acc, curr) => {
        const week = this.getWeekFromDate(curr.date);
        if (!acc[week]) {
          acc[week] = { read: 0, unread: 0 };
        }
        if (curr.read) {
          acc[week].read += 1;
        } else {
          acc[week].unread += 1;
        }
        return acc;
      }, {} as { [key: string]: { read: number; unread: number } });
    }
  
    getReadNotificationsRate(groupedData: {
      [key: string]: { read: number; unread: number };
    }): number {
      let totalNotifications = 0;
      let readNotifications = 0;
  
      for (const week in groupedData) {
        totalNotifications += groupedData[week].read + groupedData[week].unread;
        readNotifications += groupedData[week].read;
      }
  
      return totalNotifications > 0
        ? (readNotifications / totalNotifications) * 100
        : 0;
    }
  
    getWeeklyReadNotifications(groupedData: {
      [key: string]: { read: number; unread: number };
    }): number[] {
      return Object.values(groupedData).map((week) => week.read);
    }
  
    getWeeklyUnreadNotifications(groupedData: {
      [key: string]: { read: number; unread: number };
    }): number[] {
      return Object.values(groupedData).map((week) => week.unread);
    }
  
    getWeekFromDate(date: string): string {
      const d = new Date(date);
      const weekNumber = Math.floor((d.getDate() - 1) / 7) + 1;
      return `${d.getFullYear()}-W${weekNumber}`;
    }
  
    groupByDayOfWeek(notifications: { date: string }[]): {
      [key: string]: number;
    } {
      const daysOfWeek = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
  
      return notifications.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const dayName = daysOfWeek[date.getDay()]; // Obtenemos el nombre del día de la semana
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    }
  
    findMaxNotificationsDay(groupedData: { [key: string]: number }): {
      day: string;
      count: number;
    } {
      let maxDay = "";
      let maxCount = 0;
  
      for (const [day, count] of Object.entries(groupedData)) {
        if (count > maxCount) {
          maxDay = day;
          maxCount = count;
        }
      }
  
      return { day: maxDay, count: maxCount };
    }
  
    findMaxNotificationsType(groupedData: { [key: string]: number }): {
      type: string;
      count: number;
    } {
      let maxType = "";
      let maxCount = 0;
  
      for (const [type, count] of Object.entries(groupedData)) {
        if (count > maxCount) {
          maxType = type;
          maxCount = count;
        }
      }
  
      return { type: maxType, count: maxCount };
    }
  
    findMaxNotificationsHour(groupedData: { [key: string]: number }): {
      hour: string;
      count: number;
    } {
      let maxHour = "";
      let maxCount = 0;
  
      for (const [hour, count] of Object.entries(groupedData)) {
        if (count > maxCount) {
          maxHour = hour;
          maxCount = count;
        }
      }
  
      return { hour: maxHour, count: maxCount };
    }
  
    findMaxNotificationsMonth(groupedData: { [key: string]: number }): {
      month: string;
      count: number;
    } {
      let maxMonth = "";
      let maxCount = 0;
  
      for (const [month, count] of Object.entries(groupedData)) {
        if (count > maxCount) {
          maxMonth = month;
          maxCount = count;
        }
      }
  
      return { month: maxMonth, count: maxCount };
    }
    

    
    filterData(){
      if (this.dropdownSeleccionadas.length === 0) {

        this.allNotifications.access = this.accessList
        this.allNotifications.fines = this.finesList
        this.allNotifications.payments = this.paymentsList
        this.allNotifications.generals = this.generalsList
        this.allNotifications.inventories = this.inventoryList
        
      } else {
        this.dropdownSeleccionadas.forEach((e) => {
          this.allNotifications.access = []
          this.allNotifications.fines = []
          this.allNotifications.payments = []
          this.allNotifications.generals = []
          this.allNotifications.inventories = []
          if (e === "Accesos"){
            this.allNotifications.access = this.accessList
          }
          if (e === "Multas"){
            this.allNotifications.fines = this.finesList
          }
          if (e === "Pagos"){
            this.allNotifications.payments = this.paymentsList
          }
          if (e === "Generales"){
            this.allNotifications.generals = this.generalsList
          }
          if (e=== "Inventario"){
            this.allNotifications.inventories = this.inventoryList
          }
        });
      }        
    }
  
    loadChartData(): void {
      console.log("Chart Data:", this.allNotifications);
      const counterOfBools = ["No Leido", "Leido"];
      const daysOfWeek = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ];
      const monthsOfYear = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const hoursOfDay = [
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
        "00:00",
      ];
      const getDayOfWeek = (date: Date) => daysOfWeek[date.getDay() - 1]; // Ajuste del día de la semana (domingo es 0)
      const getMonthOfYear = (date: Date) => monthsOfYear[date.getMonth()]; // Ajuste del mes del año (diciembre es 0)
      const getHourOfDay = (date: Date) => hoursOfDay[date.getHours() - 1]; // Ajuste de la hora del dia (las 12 es 0)
      const getCounterOfBools = (count: Number) =>
        counterOfBools[count.valueOf()];
  
      // Inicializamos las variables para cada día de la semana
      const notificationsPerDay: { [key: string]: number } = {
        Lunes: 0,
        Martes: 0,
        Miércoles: 0,
        Jueves: 0,
        Viernes: 0,
      };
  
      // Inicializamos las variables para cada mes del año
      const notificationsPerMonth: { [key: string]: number } = {
        Enero: 0,
        Febrero: 0,
        Marzo: 0,
        Abril: 0,
        Mayo: 0,
        Junio: 0,
        Julio: 0,
        Agosto: 0,
        Septiembre: 0,
        Octubre: 0,
        Noviembre: 0,
        Diciembre: 0,
      };
  
      const notificationsPerHour: { [key: string]: number } = {
        "01:00": 0,
        "02:00": 0,
        "03:00": 0,
        "04:00": 0,
        "05:00": 0,
        "06:00": 0,
        "07:00": 0,
        "08:00": 0,
        "09:00": 0,
        "10:00": 0,
        "11:00": 0,
        "12:00": 0,
        "13:00": 0,
        "14:00": 0,
        "15:00": 0,
        "16:00": 0,
        "17:00": 0,
        "18:00": 0,
        "19:00": 0,
        "20:00": 0,
        "21:00": 0,
        "22:00": 0,
        "23:00": 0,
        "00:00": 0,
      };
  
      const flatNotifications = this.flattenNotifications(this.allNotifications);
      const notificationsByDayOfWeek = this.groupByDayOfWeek(flatNotifications);
      console.log(
        "Datos agrupados por día de la semana:",
        notificationsByDayOfWeek
      );
      //para chart 1: si no hay datos, en vez de mostrar "table has no entries" muestra un mensaje en vez del error de Google charts
      if (Object.keys(notificationsByDayOfWeek).length == 0){
         this.columnChartData = [["No hay datos para mostrar",0]]
      }
      else {
        console.log(notificationsByDayOfWeek);
        this.columnChartData = daysOfWeek.map(day => [
          day,
          notificationsByDayOfWeek[day] || 0, // Use 0 if the day key is missing
        ]);
    
      }
      
      // Contamos las notificaciones por tipo por dia
      this.allNotifications.access.forEach((a) => {
        const dayOfWeek = getDayOfWeek(new Date(a.created_datetime));
        notificationsPerDay[dayOfWeek] += 1;
      });
  
      this.allNotifications.access.forEach((a) => {
        const dayOfWeek = getDayOfWeek(new Date(a.created_datetime));
        notificationsPerDay[dayOfWeek] += 1;
      });
  
      this.allNotifications.payments.forEach((p) => {
        const dayOfWeek = getDayOfWeek(new Date(p.dateFrom));
        notificationsPerDay[dayOfWeek] += 1;
      });
  
      this.allNotifications.fines.forEach((f) => {
        const dayOfWeek = getDayOfWeek(new Date(f.created_datetime));
        notificationsPerDay[dayOfWeek] += 1;
      });
  
      this.allNotifications.inventories.forEach((f) => {
        const dayOfWeek = getDayOfWeek(new Date(f.created_datetime));
        notificationsPerMonth[dayOfWeek] += 1;
      });
  
      this.allNotifications.access.forEach((a) => {
        const monthsOfYear = getMonthOfYear(new Date(a.created_datetime));
        notificationsPerMonth[monthsOfYear] += 1;
      });
  
      this.allNotifications.payments.forEach((p) => {
        const monthsOfYear = getMonthOfYear(new Date(p.created_datetime));
        notificationsPerMonth[monthsOfYear] += 1;
      });
  
      this.allNotifications.fines.forEach((f) => {
        const monthsOfYear = getMonthOfYear(new Date(f.created_datetime));
        notificationsPerMonth[monthsOfYear] += 1;
      });
  
      this.allNotifications.inventories.forEach((f) => {
        const monthsOfYear = getMonthOfYear(new Date(f.created_datetime));
        notificationsPerMonth[monthsOfYear] += 1;
      });
  
      // Contamos las notificaciones por hora del dia
      this.allNotifications.access.forEach((a) => {
        const hoursOfDay = getHourOfDay(new Date(a.created_datetime));
        notificationsPerHour[hoursOfDay] += 1;
      });
  
      this.allNotifications.payments.forEach((p) => {
        const hoursOfDay = getHourOfDay(new Date(p.created_datetime));
        notificationsPerHour[hoursOfDay] += 1;
      });
  
      this.allNotifications.fines.forEach((f) => {
        const hoursOfDay = getHourOfDay(new Date(f.created_datetime));
        notificationsPerHour[hoursOfDay] += 1;
      });
  
      this.allNotifications.inventories.forEach((f) => {
        const hoursOfDay = getHourOfDay(new Date(f.created_datetime));
        notificationsPerHour[hoursOfDay] += 1;
      });
  
  
      // Actualizamos el columnChartData sumando todas las notificaciones por mes
      this.columnChartData6 = monthsOfYear.map((month) => [
        month,
        notificationsPerMonth[month],
      ]);
  
      // Datos para el segundo gráfico: Notificaciones por Tipo (Access, Payment, Fine, Inventory)
  
  
      this.columnChartData2 = [
        ["Acc", this.allNotifications.access.length],
        ["Pag", this.allNotifications.payments.length],
        ["Mult", this.allNotifications.fines.length],
        ["Inv", this.allNotifications.inventories.length],
      ];
      
      // Datos para el tercer gráfico: Notificaciones por Día y Tipo de Notificación
      this.columnChartData3 = daysOfWeek.map((day) => [
        day,
        this.allNotifications.access.filter(
          (a) => getDayOfWeek(new Date(a.created_datetime)) === day
        ).length,
        this.allNotifications.payments.filter(
          (p) => getDayOfWeek(new Date(p.created_datetime)) === day
        ).length,
        this.allNotifications.fines.filter(
          (f) => getDayOfWeek(new Date(f.created_datetime)) === day
        ).length,
        this.allNotifications.inventories.filter(
          (f) => getDayOfWeek(new Date(f.created_datetime)) === day
        ).length,
      ]);
  
      // Datos para el cuarto gráfico
      this.columnChartData4 = hoursOfDay.map((hour) => [
        hour,
        notificationsPerHour[hour],
      ]);
  
      // Datos para el quinto gráfico
      this.columnChartData5 = counterOfBools.map((count) => [
        count,
        this.allNotifications.access.filter(
          (a) => getCounterOfBools(new Number(a.markedRead)) === count
        ).length +
          this.allNotifications.payments.filter(
            (a) => getCounterOfBools(new Number(a.markedRead)) === count
          ).length +
          this.allNotifications.inventories.filter(
            (a) => getCounterOfBools(new Number(a.markedRead)) === count
          ).length +
          this.allNotifications.fines.filter(
            (a) => getCounterOfBools(new Number(a.markedRead)) === count
          ).length,
      ]);
  
      // Datos para el sexto gráfico
      this.columnChartData6 = monthsOfYear.map((day) => [
        day,
        this.allNotifications.access.filter(
          (a) => getMonthOfYear(new Date(a.created_datetime)) === day
        ).length,
        this.allNotifications.payments.filter(
          (p) => getMonthOfYear(new Date(p.created_datetime)) === day
        ).length,
        this.allNotifications.fines.filter(
          (f) => getMonthOfYear(new Date(f.created_datetime)) === day
        ).length,
        this.allNotifications.inventories.filter(
          (f) => getMonthOfYear(new Date(f.created_datetime)) === day
        ).length,
      ]);
    }
  
    makeBig(status: number) {
      this.status = status;
    }
  
    formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes debe ser 1-12
      const day = date.getDate().toString().padStart(2, "0"); // Día debe ser 1-31
      return `${year}-${month}-${day}`; // Retornar en formato yyyy-MM-dd
    }
  
    initializeDates() {
      const today = new Date();
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );
  
      this.filterForm.patchValue({
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
      });
    }
  
    filterListByDate() {
      const filterByDate = (
        list: any[],
        startDate: Date,
        endDate: Date
      ): any[] => {
        return list.filter((e) => {
          const createdDate = new Date(e.created_datetime);
          const createdDateStr = createdDate.toISOString().split("T")[0];
          const startDateStr = startDate.toISOString().split("T")[0];
          const endDateStr = endDate.toISOString().split("T")[0];
          return createdDateStr >= startDateStr && createdDateStr <= endDateStr;
        });
      };
  
      const startDate = new Date(
        this.filterForm.get("startDate")?.value ?? new Date()
      );
      const endDate = new Date(
        this.filterForm.get("endDate")?.value ?? new Date()
      );
  
      this.allNotifications.access = filterByDate(
        this.accessList,
        startDate,
        endDate
      );
      this.allNotifications.fines = filterByDate(
        this.finesList,
        startDate,
        endDate
      );
      this.allNotifications.payments = filterByDate(
        this.paymentsList,
        startDate,
        endDate
      );
      this.allNotifications.generals = filterByDate(
        this.generalsList,
        startDate,
        endDate
      );
      this.allNotifications.inventories = filterByDate(
        this.inventoryList,
        startDate,
        endDate
      );
      console.log("Filtered Data:", this.allNotifications);
      this.loadChartData();
    }
  
    filterListByStatus() {
      //no actualizar KPIs, mantener valor actual
      let currentReadAmount = this.columnChartData5[1][1]
      let currentUnreadAmount = this.columnChartData5[0][1]
  
      if (this.filterForm.get("readStatus")?.value === "Todas") {
      } else if (this.filterForm.get("readStatus")?.value === "Leídas") {
        this.allNotifications.access = this.allNotifications.access.filter(
          (a) => a.markedRead === true
        );
        this.allNotifications.payments = this.allNotifications.payments.filter(
          (p) => p.markedRead === true
        );
        this.allNotifications.inventories =
          this.allNotifications.inventories.filter((i) => i.markedRead === true);
        this.allNotifications.fines = this.allNotifications.fines.filter(
          (f) => f.markedRead === true
        );
        console.log("LEIDAS", this.allNotifications);
      } else if (this.filterForm.get("readStatus")?.value === "No Leídas") {
        this.allNotifications.access = this.allNotifications.access.filter(
          (a) => a.markedRead === false
        );
        this.allNotifications.payments = this.allNotifications.payments.filter(
          (p) => p.markedRead === false
        );
        this.allNotifications.inventories =
          this.allNotifications.inventories.filter((i) => i.markedRead === false);
        this.allNotifications.fines = this.allNotifications.fines.filter(
          (f) => f.markedRead === false
        );
        console.log("no LEIDAS", this.allNotifications);
      }
      
      this.loadChartData();
      this.columnChartData5[0][1] = currentUnreadAmount
      this.columnChartData5[1][1] = currentReadAmount
      return this.allNotifications;
    }
    //calcula el total de notificaciones enviadas para mostrar en el KPI
    calculateTotalNotifications(){
      return Object.values(this.allNotifications).reduce((sum, arr) => sum + arr.length, 0);
    }
    recibirSeleccionadas(node: any) {
      this.dropdownSeleccionadas = node;
      this.filterData();
      this.loadChartData();
      console.log(node);
    }
    @ViewChild(SelectMultipleComponent)
    selectMultipleComponent!: SelectMultipleComponent;
    clearFiltered() {
      this.selectedNotificationType = [],
      this.initializeDates()
      if (this.selectMultipleComponent) {
        this.selectMultipleComponent.clearSelection();
      }
      this.filterForm.patchValue({
        readStatus: "Todas"
      })
    }
    calculatePercentages() {
      let currentReadAmount = this.columnChartData5[1][1]
      let currentUnreadAmount = this.columnChartData5[0][1]
  
      let total = currentReadAmount + currentUnreadAmount
  
      const readPercentage = (currentReadAmount / total) * 100;
      const unreadPercentage = (currentUnreadAmount / total) * 100;
  
      this.kpiTotalRead = parseFloat(readPercentage.toFixed(2))
      this.kpiTotalUnread = parseFloat(unreadPercentage.toFixed(2))
      this.kpiGeneral = this.generalsList.length
    }
  
    
  
}
