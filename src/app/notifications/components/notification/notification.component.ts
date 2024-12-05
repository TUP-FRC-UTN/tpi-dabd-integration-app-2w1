import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Fine } from '../../models/fine';
import { Access } from '../../models/access';
import { Payments } from '../../models/payments';
import { General } from '../../models/general';
import { Notifications } from '../../models/notifications';
import { NotificationService } from '../../service/notification.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockUserService } from '../../service/mockUser.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Inventory } from '../../models/inventory';
import { NgSelectComponent } from '@ng-select/ng-select';
import { single, Subscription } from 'rxjs';
import { SelectMultipleComponent } from '../../select-multiple/select-multiple.component';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { TutorialService } from '../../../common/services/tutorial.service';
import Shepherd from 'shepherd.js';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    DatePipe,
    FormsModule,
    JsonPipe,
    NgSelectComponent,
    SelectMultipleComponent,
  ],
  providers: [DatePipe],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  //Titulo de la pagina
  @Output() sendTitle = new EventEmitter<string>();
  userId: number = 0;
  rolactual: string = '';
  accessList: Access[] = [];
  finesList: Fine[] = [];
  paymentsList: Payments[] = [];
  generalsList: General[] = [];
  inventoryList: Inventory[] = [];

  selectedNotification: any = {
    subject: 'placeholder',
    message: 'placeholder',
    date: 'placeholder',
    type: 'placeholder',
  };
  selectedNotificationObject: any;

  allNotifications: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
    inventories: [],
  };
  subscription = new Subscription();
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  allNotificationsArray: any[] = [];

  dateFilterForm: FormGroup;
  notificationTypes: any[] = [
    { value: 'Multas', name: 'Multas' },
    { value: 'Accesos', name: 'Accesos' },
    { value: 'Pagos', name: 'Pagos' },
    { value: 'Generales', name: 'Generales' },
    { value: 'Inventario', name: 'Inventario' },
  ];

  selectedNotificationType: string[] = [];

  dropdownSeleccionadas: any[] = [];

  recibirSeleccionadas(node: any) {
    this.dropdownSeleccionadas = node;
    this.fillTable();
    console.log(node);
  }
  constructor(
    private service: NotificationService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private authservice: AuthService,
    private tutorialService: TutorialService
  ) {
    this.dateFilterForm = new FormGroup({
      startDate: new FormControl(new Date(), [Validators.required]),
      endDate: new FormControl(new Date(), [Validators.required]),
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
  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.userId = this.authservice.getUser().id;
    this.getNotificationsFromAPI(this.userId);

    $(document).on('click', '.mark-read-btn', (event) => {
      console.log('CLICK EN MARCAR LEIDA');
      if (this.selectedNotificationObject) {
        let selectedNotificationId = this.selectedNotificationObject.id;
        let selectedNotificationTableName =
          this.selectedNotificationObject.tableName.toUpperCase();
        let notification;

        const putNotification = this.service
          .putData(selectedNotificationId, selectedNotificationTableName)
          .subscribe({
            next: () => {
              this.fillTable();
            },
            error: (error) => console.log(error),
          });
        this.subscription.add(putNotification);

        switch (this.selectedNotificationObject.tableName.toUpperCase()) {
          case 'ACCESS':
            notification = this.allNotifications.access.find(
              (n) => n.id == this.selectedNotificationObject.id
            );
            if (notification) notification.markedRead = true;
            break;
          case 'GENERAL':
            notification = this.allNotifications.generals.find(
              (n) => n.id == this.selectedNotificationObject.id
            );
            if (notification) notification.markedRead = true;
            break;

          case 'INVENTORY':
            notification = this.allNotifications.inventories.find(
              (n) => n.id == this.selectedNotificationObject.id
            );
            if (notification) notification.markedRead = true;
            break;
          case 'PAYMENTS':
            notification = this.allNotifications.payments.find(
              (n) => n.id == this.selectedNotificationObject.id
            );
            if (notification) notification.markedRead = true;
            break;
          case 'FINES':
            notification = this.allNotifications.fines.find(
              (n) => n.id == this.selectedNotificationObject.id
            );
            if (notification) notification.markedRead = true;
            break;
        }
        this.fillTable();
      }
    });

    // Configure DataTables with search functionality
    $('#myTable').DataTable({
      columns: [
        { width: '14%' },
        { width: '12%' },
        { width: '20%' },
        { width: '40%' },
        { width: '16%' },
      ],

      columnDefs: [
        { targets: 0, className: 'text-center align-middle' },
        { targets: 4, className: 'text-center' },
        {
          // Truncar la descripción (columna 3, índice 3)
          targets: 3,
          render: function (data: string) {
            const maxLength = 80; // Máxima longitud de caracteres
            if (data && data.length > maxLength) {
              return data.substring(0, maxLength) + '...'; // Truncar y añadir '...'
            }
            return data; // Si el texto no es largo, devolverlo tal cual
          },
        },
      ],
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
      select: { style: 'os' },
      paging: true,
      searching: true,
      ordering: true,
      order: [[0, 'desc']],
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        emptyTable: 'No hay notificaciones para mostrar',
        search: 'Buscar',
        loadingRecords: 'Cargando...',
        zeroRecords: 'No se han encontrado registros',
        lengthMenu: '_MENU_',
        info: '',
      },
    });

    // Connect external search input to DataTables
    $('#searchTerm').on('keyup', function () {
      const searchTerm = $(this).val() as string;

      // Si el campo está vacío, resetear la búsqueda
      if (searchTerm === '') {
        $('#myTable').DataTable().search('').draw();
      } else {
        $('#myTable').DataTable().search(searchTerm).draw();
      }
    });

    this.initializeDates();
    this.dateFilterForm.valueChanges.subscribe(() => {
      this.filterListByDate();
    });

    this.rolactual = this.activatedRoute.snapshot.params['rol'];

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
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
    
    console.log('EMPEZANDO TUTORIAL');
    this.tour.addStep({
      id: 'table-step',
      title: 'Tabla de Notificaciones',
      text: 'Acá puede ver todas las notificaciones que se le han enviado. Aquellas que no hayan sido marcadas como leídas aparecerán en negrita.',

      attachTo: {
        element: '#myTable',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'filter-step',
      title: 'Filtros',
      text: 'Desde acá podrá filtrar las notificaciones por fecha y tipo. También puede exportar las notificaciones a Excel o PDF, o borrar los filtros aplicados con el botón de basura.',
      attachTo: {
        element: '#filtros',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: () => {
            // Codigo para seleccionar el radio button "Solamente a"
            const viewDetails = document.getElementById(
              'viewDetailsBtn'
            ) as HTMLInputElement;
            viewDetails.click();
            this.tour.next();
          },        },
      ],
    });

    this.tour.addStep({
      id: 'options-step',
      title: 'Opciones de notificación',
      text: 'Acá puede ver las opciones de una notificacioón. Puede marcarla como leída o, de ser necesario, abrirla para ver más detalles.',
      attachTo: {
        element: '#viewDetailsBtn',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Finalizar',
          action: this.tour.complete,
        },
      ],
    });



    this.tour.start();
  }

  setNotification(data: any, index: number) {
    this.selectedNotification = {
      subject: this.getTextContent(data[2]),
      message: this.getTextContent(data[3]),
      date: this.getTextContent(data[0]),
      type: data[1].toUpperCase(),
      index: index,
    };
  }

  getNotificationsFromAPI(userId: number) {
    const getNotifications = this.service.getData(userId).subscribe({
      next: (value: Notifications) => {
        // value.access.forEach(
        //   (notification) =>
        //     (notification.markedRead = notification.markedRead || false)
        // );
        // value.fines.forEach(
        //   (notification) =>
        //     (notification.markedRead = notification.markedRead || false)
        // );
        // value.payments.forEach(
        //   (notification) =>
        //     (notification.markedRead = notification.markedRead || false)
        // );
        // value.generals.forEach(
        //   (notification) =>
        //     (notification.markedRead = notification.markedRead || false)
        // );

        this.allNotifications = value;
        this.accessList = [...value.access];
        this.finesList = [...value.fines];
        this.paymentsList = [...value.payments];
        this.generalsList = [...value.generals];
        this.inventoryList = [...value.inventories];

        console.log(this.allNotifications);

        this.fillTable();
      },
      error: () => {
        console.log('Error al obtener las notificaciones del back-end');
      },
    });
    this.subscription.add(getNotifications);
  }
  fillTable() {
    const table = $('#myTable').DataTable();
    table.clear().draw();

    table.on('select', (e, dt, type, indexes, $element) => {
      if (type === 'row') {
        const rowData = table.row(indexes[0]).data();
        let rowIndex = indexes[0];
        this.selectedNotificationObject = this.allNotificationsArray[rowIndex];
        this.setNotification(rowData, rowIndex);
      }
    });

    const addRow = (notification: any, tipo: string) => {
      const getBadgeClass = (tipo: string) => {
        switch (tipo) {
          case 'Generales':
            return 'text-bg-warning';
          case 'Accesos':
            return 'text-bg-success';
          case 'Multas':
            return 'text-bg-danger';
          case 'Pagos':
            return 'text-bg-indigo';
          case 'Inventario':
            return 'text-bg-primary';
          default:
            return '';
        }
      };

      const badgeClass = getBadgeClass(tipo);

      // Aplicar clase fw-bold si no está leída
      const boldClass = !notification.markedRead ? 'fw-bold' : '';

      table.row
        .add([
          `<div class="${boldClass}">${this.getTodayDateFormatted(
            notification.created_datetime
          )}</div>`,
          `<div class="text-center"><span class="badge rounded-pill ${badgeClass}">${tipo}</span></div>`,
          `<div class="${boldClass}">${notification.subject}</div>`,
          `<div class="${boldClass}">${notification.message}</div>`,
          `<a id="viewDetailsBtn" class="btn btn-light align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
              style="width:40px; height:40px; font-size:1.2rem; padding-top:0.2rem;">
              &#8942;
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item consultar-btn" href="#" data-bs-toggle="modal"
              data-bs-target="#idMODAL">Ver más</a></li>
              <li><a class="dropdown-item consultar-btn mark-read-btn"
              >Marcar como leida</a></li>
            </ul>`,
        ])
        .draw();
    };
    this.allNotificationsArray = [];
    if (this.dropdownSeleccionadas.length === 0) {
      this.allNotifications.access.forEach((notification) => {
        addRow(notification, 'Accesos'),
          this.allNotificationsArray.push(notification);
      });
      this.allNotifications.fines.forEach((notification) => {
        addRow(notification, 'Multas'),
          this.allNotificationsArray.push(notification);
      });
      this.allNotifications.payments.forEach((notification) => {
        addRow(notification, 'Pagos'),
          this.allNotificationsArray.push(notification);
      });
      this.allNotifications.generals.forEach((notification) => {
        addRow(notification, 'Generales'),
          this.allNotificationsArray.push(notification);
      });
      this.allNotifications.inventories.forEach((notification) => {
        addRow(notification, 'Inventario');
        this.allNotificationsArray.push(notification);
      });
    } else {
      this.dropdownSeleccionadas.forEach((e) => {
        if (e === 'Accesos')
          this.allNotifications.access.forEach((notification) => {
            addRow(notification, 'Accesos'),
              this.allNotificationsArray.push(notification);
          });
        if (e === 'Multas')
          this.allNotifications.fines.forEach((notification) => {
            addRow(notification, 'Multas'),
              this.allNotificationsArray.push(notification);
          });
        if (e === 'Pagos')
          this.allNotifications.payments.forEach((notification) => {
            addRow(notification, 'Pagos'),
              this.allNotificationsArray.push(notification);
          });
        if (e === 'Generales')
          this.allNotifications.generals.forEach((notification) => {
            addRow(notification, 'Generales'),
              this.allNotificationsArray.push(notification);
          });
        if (e === 'Inventario') {
          this.allNotifications.inventories.forEach((notification) => {
            addRow(notification, 'Inventario');
            this.allNotificationsArray.push(notification);
          });
        }
      });
    }

    console.log('filleando');
  }

  formatDateForInput(date: string | null): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    return this.datePipe.transform(parsedDate, 'yyyy-MM-dd') || '';
  }

  exportarAExcel() {
    const tabla = $('#myTable').DataTable();
    const filteredData = tabla.rows({ search: 'applied' }).data().toArray();

    const headers = tabla
      .columns()
      .header()
      .toArray()
      .slice(0, -1)
      .map((th) => $(th).text());

    const excelData = filteredData.map((row) =>
      row.slice(0, -1).reduce((obj: any, value: any, index: number) => {
        obj[headers[index]] = this.getTextContent(value);
        return obj;
      }, {})
    );

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Insertar headers manualmente
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    // Configurar ancho de columnas
    worksheet['!cols'] = headers.map(() => ({ width: 20 }));

    // Aplicar estilos a la primera fila
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!worksheet[cellRef]) continue;

      worksheet[cellRef].s = {
        font: {
          bold: true,
          name: 'Arial',
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    }

    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, worksheet, 'Notificaciones');

    const today = new Date();
    const formattedDate = this.datePipe.transform(today, 'dd-MM-yyyy');

    // Usar writeFileXLSX en lugar de writeFile para mantener los estilos
    XLSX.writeFileXLSX(workBook, `${formattedDate}_Notificaciones.xlsx`);
  }

  exportarAPDF() {
    const tabla = $('#myTable').DataTable();
    const filteredData = tabla.rows({ search: 'applied' }).data().toArray();
    const dateFrom = this.formatDateFromString(
      this.dateFilterForm.controls['startDate'].value
    );
    const dateTo = this.formatDateFromString(
      this.dateFilterForm.controls['endDate'].value
    );

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte de Notificaciones', 14, 22);
    doc.text('Fechas: Desde ' + dateFrom + ' hasta ' + dateTo + '', 14, 33);

    autoTable(doc, {
      head: [['Fecha', 'Tipo', 'Asunto', 'Descripción']],
      body: filteredData.map((item: any) => [
        this.getTextContent(item[0]) || 'N/A',
        this.getTextContent(item[1]) || 'N/A',
        this.getTextContent(item[2]) || 'N/A',
        this.getTextContent(item[3]) || 'N/A',
      ]),
      startY: 44,
      theme: 'grid',
    });

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    doc.save(`${formattedDate} Notificaciones.pdf`);
  }

  @ViewChild(SelectMultipleComponent)
  selectMultipleComponent!: SelectMultipleComponent;
  borrar() {
    this.selectedNotificationType = [];
    this.dropdownSeleccionadas = [];

    // Limpiar la selección en el componente hijo ng-select
    if (this.selectMultipleComponent) {
      this.selectMultipleComponent.clearSelection();
    }

    const searchInput = document.getElementById(
      'searchTerm'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.initializeDates();
  }
  getTodayDateFormatted(date: Date): string {
    const formattedDate = new Date(date);
    return this.datePipe.transform(formattedDate, 'dd/MM/yyyy HH:mm:ss') || '';
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

    this.dateFilterForm.patchValue({
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    });
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes debe ser 1-12
    const day = date.getDate().toString().padStart(2, '0'); // Día debe ser 1-31
    return `${year}-${month}-${day}`; // Retornar en formato yyyy-MM-dd
  }

  filterListByDate() {
    const filterByDate = (
      list: any[],
      startDate: Date,
      endDate: Date
    ): any[] => {
      return list.filter((e) => {
        const createdDate = new Date(e.created_datetime);
        const createdDateStr = createdDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        return createdDateStr >= startDateStr && createdDateStr <= endDateStr;
      });
    };

    const startDate = new Date(
      this.dateFilterForm.get('startDate')?.value ?? new Date()
    );
    const endDate = new Date(
      this.dateFilterForm.get('endDate')?.value ?? new Date()
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

    this.fillTable();
  }

  leida(notification: any) {
    // Marcar la notificación como leída
    notification.markedRead = true;
    // Actualizar la tabla o la lista de notificaciones
    //this.updatedList();
  }

  formatDateFromString(date: string) {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getTextContent(cellData: any): string {
    // Check if cellData is an HTML element or text
    if (typeof cellData === 'string') {
      // If it's a string, strip out any HTML tags using a regex
      return cellData.replace(/<[^>]*>?/gm, '');
    }
    return cellData;
  }
}
