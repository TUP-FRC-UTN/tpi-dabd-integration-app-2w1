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
  form: FormGroup;
  table: any;
  data: AllNotifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
    inventories: [],
  };
  notificationTypes: any[] = [
    { value: "Multas", name: "Multas" },
    { value: "Accesos", name: "Accesos" },
    { value: "Pagos", name: "Pagos" },
    { value: "Generales", name: "Generales" },
    { value: "Inventario", name: "Inventario" },
  ];

  selectedNotificationType: string[] = [];

  dropdownSeleccionadas: any[] = [];

  recibirSeleccionadas(node: any) {
    this.dropdownSeleccionadas = node;
    this.fillTable();
    console.log(node);
  }

  //onInit y onDestroy
  ngOnInit(): void {
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
  //injecciones
  constructor(
    private service: NotificationRegisterService,
    private serviceUser: MockUserService,
    private datePipe: DatePipe
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
        alert("error al cargar las notifications");
      },
    });
  }
  formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd/MM/yyyy hh:mm:ss") || "";
  }

  fillTable() {
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
      if (tipo === "Inventario") {
        this.table.row
          .add([
            this.formatDate(notification.created_datetime),
            "Alice Jhonson",
            "12345678",
            tipoPill,
            notification.subject,
            notification.message,
          ])
          .draw(false);
      } else {
        this.table.row
          .add([
            this.formatDate(notification.created_datetime),
            notification.nombre + " " + notification.apellido,
            notification.dni,
            tipoPill,
            notification.subject,
            notification.message,
          ])
          .draw(false);
      }
    };

    if (this.dropdownSeleccionadas.length === 0) {
      this.data.access.forEach((notification) => {
        AddRow(notification, "Accesos");
      });
      this.data.fines.forEach((notification) => {
        AddRow(notification, "Multas");
      });
      this.data.payments.forEach((notification) => {
        AddRow(notification, "Pagos");
      });
      this.data.generals.forEach((notification) => {
        AddRow(notification, "Generales");
      });
      this.data.inventories.forEach((notification) => {
        AddRow(notification, "Inventario");
      });
    } else {
      this.dropdownSeleccionadas.forEach((e) => {
        if (e === "Accesos")
          this.data.access.forEach((notification) => {
            AddRow(notification, "Accesos");
          });
        if (e === "Multas")
          this.data.fines.forEach((notification) => {
            AddRow(notification, "Multas");
          });
        if (e === "Pagos")
          this.data.payments.forEach((notification) => {
            AddRow(notification, "Pagos");
          });
        if (e === "Generales")
          this.data.generals.forEach((notification) => {
            AddRow(notification, "Generales");
          });
        if (e === "Inventario")
          this.data.inventories.forEach((notification) => {
            AddRow(notification, "Inventario");
          });
      });
    }

    console.log("filleando");
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
}
