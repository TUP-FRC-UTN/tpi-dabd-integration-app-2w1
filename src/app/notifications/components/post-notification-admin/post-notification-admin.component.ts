import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NotificationService } from '../../service/notification.service';
import { UserApiDTO } from '../../models/DTOs/UserApiDTO';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import 'datatables.net-select';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationGeneralDTO } from '../../models/DTOs/NotificationGeneralDTO';
import { UserDTO } from '../../models/DTOs/UserDTO';
import Swal from 'sweetalert2';
import {
  ReactiveFormsModule,
  FormsModule,
  NgForm,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../common/environments/environment';
import { TutorialService } from '../../../common/services/tutorial.service';
import Shepherd from 'shepherd.js';

@Component({
  selector: 'app-post-notification-admin',
  standalone: true,
  imports: [FormsModule, NgClass, ReactiveFormsModule],
  templateUrl: './post-notification-admin.component.html',
  styles: ['.hidden {display:none;}'],
  styleUrl: './post-notification-admin.component.css',
})
export class PostNotificationAdminComponent implements AfterViewInit, OnInit {
  //Botones
  @Input() info: string = '';

  //Rol del usuario logeado
  @Input() userRole: string = '';

  //Titulo de la pagina
  @Output() sendTitle = new EventEmitter<string>();

  httpClient: HttpClient = inject(HttpClient);
  private tour: Shepherd.Tour;
  constructor(
    private notificationService: NotificationService,
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

  selectValue: string = '1';
  usersRbtValue: string = 'allUsers';
  formSubmitted = false;
  awaitingResponse: boolean = false;
  users: UserApiDTO[] = [];
  subscription = new Subscription();
  tutorialSubscription = new Subscription();

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }
  
  form: FormGroup = new FormGroup({
    subject: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    usersRbt: new FormControl('allUsers'),
    selectValue: new FormControl('1'),
  });

  ngOnInit(): void {
    const users = this.httpClient
      .get<UserApiDTO[]>(
        environment.services.notifications + '/general/getUsers'
      )
      .subscribe((response) => {
        this.users = response;
        this.fillTable();
        console.log(this.users);
      });

    this.form.get('usersRbt')?.valueChanges.subscribe({
      next: (value) => {
        this.usersRbtValue = value;
      },
    });

    this.form.get('selectValue')?.valueChanges.subscribe({
      next: (value) => {
        this.selectValue = value;
      },
    });

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
      id: 'subject-step',
      title: 'Asunto de la Notificación',
      text: 'Este será el asunto de la notificación que deseas enviar. Debe ser conciso y claro.',

      attachTo: {
        element: '.col-md-12:has(#inputSubject)',
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
      id: 'description-step',
      title: 'Mensaje de la Notificación',
      text: 'En este campo, escriba el contenido detallado del mensaje que quiera enviar a los usuarios.',
      attachTo: {
        element: '.col-md-12:has(#inputDescription)',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'send-to-step',
      title: 'Enviar a',
      text: 'Acá puede seleccionar a quiénes quiere enviar la notificación. Puede enviar a todos, solo algunos o excluír a algunos.',
      attachTo: {
        element: '#allRbt',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'notification-channels-step',
      title: 'Configuración de Notificación',
      text: 'Desde acá puede seleccionar a través de dónde enviar la notificación. Tenga en cuenta que no todos los usuarios utilizan Telegram.',
      attachTo: {
        element: 'select[formControlName="selectValue"]',
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
            const onlyToRadio = document.getElementById(
              'onlyToRbt'
            ) as HTMLInputElement;
            onlyToRadio.click();
            this.tour.next();
          },
        },
      ],
    });

    this.tour.addStep({
      id: 'user-selection-step',
      title: 'Selección de Destinatarios',
      text: 'Haga click en la casilla de cada destinatario que desea incluir en la notificación. Puede seleccionar múltiples usuarios. Al finalizar, pulse "Enviar"',
      attachTo: {
        element: '#myTable',
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

  fillTable() {
    let table = $('#myTable').DataTable();
    for (let user of this.users) {
      table.row
        .add([
          user.name,
          user.lastname,
          user.dni,
          user.email,
          '<input type="checkbox" class="userCheckbox form-check-input border border-secondary" />',
        ])
        .draw(false);
    }
  }

  ngAfterViewInit(): void {
    this.setTable();
    this.selectValue = '1';
  }

  setTable(): void {
    $('#myTable').DataTable({
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',

      columnDefs: [
        {
          targets: 4,
          className: 'text-center align-middle',
        },
      ],

      select: {
        style: 'multi',
        selector: 'td:first-child input[type="checkbox"]',
      },
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      order: [[1, 'asc']],
      language: {
        emptyTable: 'Cargando...',
        search: 'Buscar',
        loadingRecords: 'Cargando...',
        zeroRecords: 'No se han encontrado registros',
        lengthMenu: '_MENU_',
        info: ' ',
      },
    });

    $('#searchTerm').on('keyup', function () {
      $('#myTable')
        .DataTable()
        .search($(this).val() as string)
        .draw();
    });

    $('#selectAll').on('click', function () {
      const isChecked = $(this).prop('checked');
      $('input[type="checkbox"].userCheckbox').prop('checked', isChecked);
    });
  }

  newNotification: NotificationGeneralDTO = {
    users: [],
    senderId: 1,
    subject: '',
    description: '',
    channel: 'EMAIL',
  };

  selectedUser: string = '';

  onSubmit() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    console.log('click: ', this.form.value);

    if (this.form.valid && this.selectValue != '1') {
      if (this.usersRbtValue == 'allUsers') {
        this.newNotification.users = this.mapUserApiDTOToUserDTO(this.users);
      } else if (this.usersRbtValue == 'onlyTo') {
        this.newNotification.users = this.getSelectedUsers();
      } else if (this.usersRbtValue == 'exclude') {
        this.newNotification.users = this.getFilteredUsers();
      }

      this.newNotification.subject = this.form.get('subject')?.value;
      this.newNotification.description = this.form.get('description')?.value;
      this.newNotification.channel = this.selectValue;

      this.awaitingResponse = true;
      const postNotification = this.notificationService
        .postNotification(this.newNotification)
        .subscribe({
          next: (response: any) => {
            console.log('Notificacion enviada: ', response);
            Swal.fire({
              title: '¡Notificación enviada!',
              text: 'La notificacion ha sido enviada correctamente.',
              icon: 'success',
              showConfirmButton: true,
              confirmButtonText: 'Aceptar',
            });
            this.awaitingResponse = false;
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al enviar las notificaciones',
              icon: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Aceptar',
            });
            this.awaitingResponse = false;
          },
        });
      this.subscription.add(postNotification);
    } else {
      console.log('form invalid');
    }
  }

  clearForm(form: NgForm) {
    // form.reset();
    // this.radioButtonValue = "allUsers";
    let table = $('#myTable').DataTable();
  }
  getSelectedUsers(): UserDTO[] {
    let table = $('#myTable').DataTable();

    let users: UserDTO[] = [];
    const component = this;

    $('#myTable tbody tr').each(function () {
      const checkbox = $(this).find('input.userCheckbox');
      if (checkbox.is(':checked')) {
        const rowData = $('#myTable').DataTable().row(this).data();
        let user: UserDTO = {
          //encontrar el ID del user a travez del DNI
          id: component.users.find((user) => user.dni == rowData[2])?.id || 4,
          nombre:
            component.users.find((user) => user.dni == rowData[2])?.name ||
            'test',
          apellido:
            component.users.find((user) => user.dni == rowData[2])?.lastname ||
            'test',
          dni:
            component.users.find((user) => user.dni == rowData[2])?.dni ||
            9999999,
          email:
            component.users.find((user) => user.dni == rowData[2])?.email ||
            'test@test.com',
          telegramChatId:
            component.users.find((user) => user.dni == rowData[2])
              ?.telegram_id || 801000,
        };
        users.push(user);
      }
    });
    return users;
    console.log(users);
  }

  mapUserApiDTOToUserDTO(userApiArr: UserApiDTO[]): UserDTO[] {
    let userDTOArray: UserDTO[] = [];
    for (let user of userApiArr) {
      let userDTO: UserDTO = {
        id: user.id,
        nombre: user.name,
        apellido: user.lastname,
        dni: 999999,
        email: user.email,
        telegramChatId: user.telegram_id,
      };
      userDTOArray.push(userDTO);
    }
    return userDTOArray;
  }

  getFilteredUsers(): UserDTO[] {
    let selectedUsers = this.getSelectedUsers();

    let filteredUsers: any[] = [];
    filteredUsers = this.users.filter(
      (user) => !selectedUsers.some((selected) => selected.id === user.id)
    );

    let filteredUserDTOArray = this.mapUserApiDTOToUserDTO(filteredUsers);

    console.log(filteredUserDTOArray);
    return filteredUserDTOArray;
  }
}
