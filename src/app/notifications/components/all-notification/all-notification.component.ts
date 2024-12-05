import { Component, OnInit, ViewChild } from "@angular/core";
import { NotificationRegisterService } from "../../service/notification-register.service";
import { Notifications } from "../../models/notifications";
import { Access } from "../../models/access";
import { Fine } from "../../models/fine";
import { Payments } from "../../models/payments";
import { General } from "../../models/general";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-select";
import { DatePipe } from "@angular/common";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RouterModule } from "@angular/router";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DateValidator } from "../../validators/date.validators";
import { MockUserService } from "../../service/mockUser.service";
import { AllNotifications } from "../../models/all-notifications";
import { Inventory } from "../../models/inventory";
import { SelectMultipleComponent } from "../../select-multiple/select-multiple.component";
import { Subscription } from "rxjs";
import { TutorialService } from "../../../common/services/tutorial.service";
import Shepherd from "shepherd.js";

declare var bootstrap: any;

@Component({
  selector: "app-all-notification",
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    ReactiveFormsModule,
    SelectMultipleComponent,
  ],
  providers: [DatePipe],
  templateUrl: "./all-notification.component.html",
  styleUrl: "./all-notification.component.css",
})
export class AllNotificationComponent implements OnInit {
  //propiedades
  selected: string = "Todas";
  originalAccessList: Access[] = [];
  originalFinesList: Fine[] = [];
  originalPaymentsList: Payments[] = [];
  originalGeneralsList: General[] = [];
  originalInventoryList: Inventory[] = [];
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;
  form: FormGroup;
  table: any;
  data: AllNotifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
    inventories: [],
  };
  subscription = new Subscription()
  notificationTypes: any[] = [
    { value: "Multas", name: "Multas" },
    { value: "Accesos", name: "Accesos" },
    { value: "Pagos", name: "Pagos" },
    { value: "Generales", name: "Generales" },
    { value: "Inventario", name: "Inventario" },
  ];

  selectedNotificationType: string[] = [];

  dropdownSeleccionadas: any[] = [];

  allNotificationsArray: any[] = [];

  recibirSeleccionadas(node: any) {
    this.dropdownSeleccionadas = node;
    this.fillTable();
    console.log(node);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe()
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }

  }
  //onInit y onDestroy
  ngOnInit(): void {

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );


    this.table = $("#myTable").DataTable({
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
      columns: [
        { width: "13%" },
        { width: "20%" },
        { width: "7%" },
        { width: "10%" },
        { width: "20%" },
        { width: "30%" },
      ],
      columnDefs: [
        { targets: 3, className: "text-center align-middle" },
      ],

      paging: true,
      select: { style: "single" },
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      order: [[0, "desc"]],
      language: {
        emptyTable: "Cargando...",
        search: "Buscar",
        loadingRecords: "Cargando...",
        zeroRecords: "No se han encontrado registros",
        lengthMenu: "_MENU_",
        info: " ",
      },
    });

    // Connect external search input to DataTables
    $("#searchTerm").on("keyup", function () {
      $("#myTable")
        .DataTable()
        .search($(this).val() as string)
        .draw();
    });

    this.llenarData();
    this.initialzeDates();

    this.form.get("startDate")?.valueChanges.subscribe((value) => {
      this.updatedList();
    });
    this.form.get("endDate")?.valueChanges.subscribe((value) => {
      this.updatedList();
    });
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
      id: 'table-step',
      title: 'Tabla de Notificaciones',
      text: 'Acá puede ver todas las notificaciones que se enviaron en general. Puede hacer click en una notificación particular para ver más información de la misma.',
      attachTo: {
        element: '#myTable',
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
      id: 'subject-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar las notificaciones por fecha y tipo. También puede exportar las notificaciones a Excel o PDF, o borrar los filtros aplicados con el botón de basura.',      attachTo: {
        element: '#filtros',
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




  //injecciones
  constructor(
    private service: NotificationRegisterService,
    private datePipe: DatePipe,
    private tutorialService: TutorialService,
  ) {
    this.form = new FormGroup({
      startDate: new FormControl(new Date(), [
        Validators.required,
        DateValidator.greatherThanToday,
      ]),
      endDate: new FormControl(new Date(), [
        Validators.required,
        DateValidator.greatherThanToday,
      ]),
    });

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
        canClickTarget: false,
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      keyboardNavigation: false,
      
      useModalOverlay: true,
    });

  }
  //metodos
  llenarData() {
    const getSubscription = this.service.getData().subscribe({
      next: (value: AllNotifications) => {
        this.data = value;
        this.originalAccessList = [...value.access];
        this.originalFinesList = [...value.fines];
        this.originalPaymentsList = [...value.payments];
        this.originalGeneralsList = [...value.generals];
        this.originalInventoryList = [...value.inventories];
        console.log(this.data);
        this.updatedList();
        this.fillTable();
      },
      error: () => {
        console.log("error al cargar las notifications");
      },
    });
    this.subscription.add(getSubscription)
  }
  formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd/MM/yyyy hh:mm:ss") || "";
  }

  fillTable() {
    const table = $("#myTable").DataTable();

    table.on("select", (e, dt, type, indexes,$element) => {

      if (type === "row") {
        const rowData = table.row(indexes[0]).data();
        let rowIndex = indexes[0];
        let selectedNotificationObject = this.allNotificationsArray[rowIndex];
        let status = "No leida";
        if (selectedNotificationObject.markedRead == true) {
          status = "Leida";
        }
        this.setNotification(rowData, status);
        this.openModal(this.selectedNotification)
      }
    });

    this.table.clear().draw();

    const AddRow = (notification: any, tipo: string) => {
      //Setear color de Pill
      const getBadgeClass = (tipo: string) => {
        switch (tipo) {
          case "Generales":
            return "bg-warning";
          case "Accesos":
            return "bg-success";
          case "Multas":
            return "bg-danger";
          case "Pagos":
            return "text-bg-indigo";
          case "Inventario":
            return "text-bg-primary";
          default:
            return "bg-secondary";
        }
      };

      const badgeClass = getBadgeClass(tipo);
      const tipoPill = `<span class=" badge rounded-pill ${badgeClass}">${tipo}</span>`;
      
        const row = this.table.row
          .add([
            this.formatDate(notification.created_datetime),
            notification.nombre + " " + notification.apellido,
            notification.dni,
            tipoPill,
            notification.subject,
            notification.message,
          ])
          .draw(false);

          // $(row).on('click', () => this.openModal(this.selectedNotification));
      
    };

    if (this.dropdownSeleccionadas.length === 0) {
      this.data.access.forEach((notification) => {
        AddRow(notification, "Accesos");
        this.allNotificationsArray.push(notification);
      });
      this.data.fines.forEach((notification) => {
        AddRow(notification, "Multas");
         this.allNotificationsArray.push(notification);
      });
      this.data.payments.forEach((notification) => {
        AddRow(notification, "Pagos");
         this.allNotificationsArray.push(notification);
      });
      this.data.generals.forEach((notification) => {
        AddRow(notification, "Generales");
         this.allNotificationsArray.push(notification);
      });
      this.data.inventories.forEach((notification) => {
        AddRow(notification, "Inventario");
         this.allNotificationsArray.push(notification);
      });
    } else {
      this.dropdownSeleccionadas.forEach((e) => {
        if (e === "Accesos")
          this.data.access.forEach((notification) => {
            AddRow(notification, "Accesos");
            this.allNotificationsArray.push(notification);
          });
        if (e === "Multas")
          this.data.fines.forEach((notification) => {
            AddRow(notification, "Multas");
            this.allNotificationsArray.push(notification);
          });
        if (e === "Pagos")
          this.data.payments.forEach((notification) => {
            AddRow(notification, "Pagos");
            this.allNotificationsArray.push(notification);
          });
        if (e === "Generales")
          this.data.generals.forEach((notification) => {
            AddRow(notification, "Generales");
            this.allNotificationsArray.push(notification);
          });
        if (e === "Inventario")
          this.data.inventories.forEach((notification) => {
            AddRow(notification, "Inventario");
            this.allNotificationsArray.push(notification);
          });
      });
    }

    console.log("filleando");
  }

  selectedNotification: any = {
    subject: "placeholder",
    message: "placeholder",
    date: "placeholder",
    type: "placeholder",
    status: "placeholder"
  };

  // Otros métodos y propiedades

  openModal(notification: any) {
    console.log(notification);
    const modal = new bootstrap.Modal(document.getElementById('idMODAL')!);
    modal.show();
  }

  setNotification(data: any, status: string) {
    this.selectedNotification = {
      subject: data[4],
      message: data[5],
      date: data[0],
      type: data[3],
      status: status
    };
  } 

  exportarAExcel() {
    const tabla = this.table;
    const filteredData = tabla.rows({ search: "applied" }).data().toArray();
    filteredData.forEach((arr: any) => {
      arr[3] = this.getTextContent(arr[3]);
    });
    // Obtener los nombres de las columnas
    const headers = tabla
      .columns()
      .header()
      .toArray()
      .map((th: any) => $(th).text());

    // Crear la hoja con los datos
    const worksheet = XLSX.utils.json_to_sheet(filteredData, {});

    // Insertar headers manualmente
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    // Configurar ancho de columnas (150px ≈ 20 caracteres en Excel)
    worksheet["!cols"] = headers.map(() => ({
      width: 20,
      wch: 20, // ancho en caracteres
      wpx: 150, // ancho en píxeles
    }));

    // Configurar que el texto se ajuste automáticamente
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) continue;

        if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
        worksheet[cellRef].s.alignment = {
          wrapText: true, // Permitir ajuste de texto
          vertical: "top",
        };

        // Aplicar negrita y centrado a la primera fila (headers)
        if (R === 0) {
          worksheet[cellRef].s.font = { bold: true };
          worksheet[cellRef].s.alignment = {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          };
        }
      }
    }

    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, worksheet, "Notificaciones");

    XLSX.writeFile(
      workBook,
      this.formatDate(new Date()) + " Registro de Notificaciones.xlsx"
    );
  }

  exportarAPDF() {
    const tabla = this.table;
    const filteredData = tabla.rows({ search: "applied" }).data().toArray();
    const dateFrom = this.formatDateFromString(
      this.form.controls["startDate"].value
    );
    const dateTo= this.formatDateFromString(
      this.form.controls["endDate"].value
    );
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Notificaciones", 14, 22);
    doc.text("Fechas: Desde " + dateFrom + " hasta " + dateTo + "", 14, 33);

    autoTable(doc, {
      head: [["Fecha", "Destinatario", "DNI", "Tipo", "Asunto", "Descripción"]],
      body: filteredData.map((item: any) => [
        item[0] || "N/A",
        item[1] || "N/A",
        item[2] || "N/A",
        this.getTextContent(item[3]) || "N/A",
        item[4] || "N/A",
        item[5] || "N/A",
      ]),
      startY: 44,
      theme: "grid",
    });

    doc.save(this.formatDate(new Date()) + " Registro de Notificaciones.pdf");
  }

  //filtro de tipo de notificacion
  cambiar(value: string) {
    switch (value) {
      case "Todas":
        this.selected = "Todas";
        this.fillTable();
        break;

      case "Multas":
        this.selected = "Multas";
        this.fillTable();
        break;

      case "Accesos":
        this.selected = "Accesos";
        this.fillTable();
        break;

      case "Pagos":
        this.selected = "Pagos";
        this.fillTable();
        break;

      case "Generales":
        this.selected = "Generales";
        this.fillTable();
        break;

      case "Inventory":
        this.selected = "Inventory";
        this.fillTable();
        break;
    }
  }
  //filtro por fechas
  updatedList() {
    const filterListByDate = (
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

    const startDate = new Date(this.form.get("startDate")?.value ?? new Date());
    const endDate = new Date(this.form.get("endDate")?.value ?? new Date());

    this.data.access = filterListByDate(
      this.originalAccessList,
      startDate,
      endDate
    );
    this.data.fines = filterListByDate(
      this.originalFinesList,
      startDate,
      endDate
    );
    this.data.payments = filterListByDate(
      this.originalPaymentsList,
      startDate,
      endDate
    );
    this.data.generals = filterListByDate(
      this.originalGeneralsList,
      startDate,
      endDate
    );
    this.data.inventories = filterListByDate(
      this.originalInventoryList,
      startDate,
      endDate
    );

    this.fillTable();
    console.log(this.data);
  }

  initialzeDates() {
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    
    console.log(today.toISOString(), "startDate", today.getDate(), today.getMonth(), today.getFullYear());
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() +1
    );

    this.form.patchValue({
      startDate: this.formatDate2(startDate),
      endDate: this.formatDate2(endDate),
    });
  }

  formatDate2(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes debe ser 1-12
    const day = date.getDate().toString().padStart(2, "0"); // Día debe ser 1-31
    return `${year}-${month}-${day}`; // Retornar en formato yyyy-MM-dd
  }

  @ViewChild(SelectMultipleComponent)
  selectMultipleComponent!: SelectMultipleComponent;

  borrar() {
    this.form.reset();
    const searchInput = document.getElementById(
      "searchTerm"
    ) as HTMLInputElement;

    this.selectedNotificationType = [];
    this.dropdownSeleccionadas = [];

    // Limpiar la selección en el componente hijo ng-select
    if (this.selectMultipleComponent) {
      this.selectMultipleComponent.clearSelection();
    }

    if (searchInput) {
      searchInput.value = "";
    }

    this.selected = "Todas";
    this.initialzeDates();
    this.fillTable();
  }

  formatDateFromString(date: string) {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }

  getTextContent(cellData: any): string {
    // Check if cellData is an HTML element or text
    if (typeof cellData === "string") {
      // If it's a string, strip out any HTML tags using a regex
      return cellData.replace(/<[^>]*>?/gm, "");
    }
    return cellData;
  }

  closeModal() {
    $(".modal-backdrop").remove();
  }
}
