import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../users-servicies/user.service';
import { UserPut } from '../../../users-models/users/UserPut';
import { AuthService } from '../../../users-servicies/auth.service';
import { DateService } from '../../../users-servicies/date.service';
import Swal from 'sweetalert2';
import { GetuserDto } from '../../../users-models/users/GetUserDto';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { ChangePasswordComponent } from '../../../../common/components/users-change-password/users-change-password.component';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { TutorialService } from '../../../../common/services/tutorial.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';

@Component({
  selector: 'app-users-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ChangePasswordComponent,
  ],
  templateUrl: './users-profile.component.html',
  styleUrl: './users-profile.component.css',
})
export class UsersProfileComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UserService);
  private readonly plotsService = inject(PlotService);
  private readonly suscriptionService = inject(SuscriptionManagerService);

  dniType: number = 0;
  selectedIconUrl: string = '';
  isDropdownOpen = false;
  plots: GetPlotDto[] = [];
  formProfile: FormGroup;
  noIcon = 'https://i.ibb.co/bNH6vjf/avatar.png';
  icons = [
    { name: 'Icono 1', url: 'https://i.ibb.co/DpxXd6C/icono1.png' },
    { name: 'Icono 2', url: 'https://i.ibb.co/Vp515Fc/icono2.png' },
    { name: 'Icono 3', url: 'https://i.ibb.co/rvWz6Sh/icono3.png' },
    { name: 'Icono 4', url: 'https://i.ibb.co/1snjZn2/icono4.png' },
    { name: 'Icono 5', url: 'https://i.ibb.co/HNRqv7m/icono5.png' },
    { name: 'Icono 6', url: 'https://i.ibb.co/23B7tMh/icono6.png' },
    { name: 'Icono 7', url: 'https://i.ibb.co/FHR80gq/icono7.png' },
    { name: 'Icono 8', url: 'https://i.ibb.co/fMcysX4/icono8.png' },
    { name: 'Icono 9', url: 'https://i.ibb.co/k23ngcS/icono9.png' },
    { name: 'Icono 10', url: 'https://i.ibb.co/2gJgvFt/icono10.png' },
  ];

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  //Cambia la acción del botón
  type: string = 'info';

  ngOnInit(): void {
    this.getUserById();
    this.getPlotById();


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
      id: 'profile-step',
      title: 'Perfil',
      text: 'Acá puede ver la información de su perfil y sus lotes.',

      attachTo: {
        element: '#profile',
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
      id: 'edit-step',
      title: 'Editar Perfil',
      text: 'Al tocar este botón, puede editar su perfil. Algunos campos requieren permisos especiales para ser cambiados, consulte con un administrador para más información.',
      attachTo: {
        element: '#edit',
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

  //Desuscribirse de los observables
  ngOnDestroy(): void {
    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    this.suscriptionService.unsubscribeAll();
  }

  //Instancia el formulario
  constructor(
    private fb: FormBuilder,
    private tutorialService: TutorialService
  ) {
    this.formProfile = this.fb.group({
      name: new FormControl({ value: '...', disabled: true }, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      lastName: new FormControl({ value: '...', disabled: true }, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      username: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]),
      telegram_id: new FormControl({ value: 0, disabled: true }),
      email: new FormControl({ value: '...', disabled: true }, [
        Validators.required,
        Validators.email,
      ]),

      phoneNumber: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(20),
        Validators.pattern('^[0-9]*$'),
      ]),
      dni: new FormControl({ value: 0, disabled: true }, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(11),
      ]),
      dniType: new FormControl({ value: '', disabled: true }, []),
      avatar_url: new FormControl({ value: '...', disabled: true }),
      datebirth: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      roles: new FormControl<string[]>({ value: [], disabled: true }),
    });

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

  //------------------------------------------------------Carga de datos------------------------------------------------------

  //Obtener un usuario por id
  getUserById() {
    const sus = this.usersService.getUserById2(this.authService.getUser().id).subscribe({
      next: (user: GetuserDto) => {
        let roles = user.roles.map(role => " " + role);


        this.formProfile.patchValue({
          name: user.name,
          lastName: user.lastname,
          email: user.email || 'N/A',
          username: user.username,
          phoneNumber: user.phone_number == null ? 'N/A' : String(user.phone_number),
          dni: user.dni || 'N/A',
          dniType: user.dni_type || 'N/A',
          avatar_url: user.avatar_url,
          roles: user.roles,
          telegram_id: user.telegram_id
        });

        if (user.dni_type == 'DNI') {
          this.dniType = 1;
        }
        if (user.dni_type == 'PASAPORTE') {
          this.dniType = 2;
        }
        this.selectedIconUrl = user.avatar_url;

        const formattedDate: Date = DateService.parseDateString(user.datebirth)!;
        if (formattedDate) {
          const formattedDateString = formattedDate.toISOString().split('T')[0];

          this.formProfile.patchValue({
            datebirth: formattedDateString
          });
        } else {
          this.formProfile.patchValue({
            datebirth: 'N/A'
          });
        }
      }
    })

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Obtener un lote por id
  getPlotById() {
    const sus = this.plotsService
      .getPlotsByUserId(this.authService.getUser().id)
      .subscribe({
        next: (plot: GetPlotDto[]) => {
          this.plots = plot;
          //this.plots.push(plot);
        },
      });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //Mostrar icono
  haveIcon(url: string): boolean {
    for (const icon of this.icons) {
      if (icon.url === url) {
        return true;
      }
    }
    return false;
  }

  //Editar un usuario
  updateUser() {
    const updatedUser: UserPut = {
      userUpdateId: this.authService.getUser().id,
      name: this.formProfile.get('name')?.value || '',
      lastName: this.formProfile.get('lastName')?.value || '',
      email: this.formProfile.get('email')?.value || '',
      phoneNumber: this.formProfile.get('phoneNumber')?.value?.toString() || '',
      dni: this.formProfile.get('dni')?.value?.toString() || '',
      avatar_url: this.selectedIconUrl,
      datebirth: this.formProfile.get('datebirth')?.value || '',
      roles: this.formProfile.get('roles')?.value || [],
      telegram_id: this.formProfile.get('telegram_id')?.value || 0,
      dni_type_id: this.dniType,
    };

    const sus = this.usersService
      .putUser(updatedUser, this.authService.getUser().id)
      .subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Perfil actualizado',
            text: 'El perfil se actualizó correctamente',
            icon: 'success',
          });
          this.changeType('info');
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'Error al actualizar el perfil',
            icon: 'error',
          });
        },
      });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //-------------------------------------------------------Funciones-------------------------------------------------------

  //Setea la url del icono seleccionado
  onIconSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedIconUrl = selectElement.value;
  }

  //Método para seleccionar un icono
  selectIcon(url: string) {
    this.selectedIconUrl = url;
    this.isDropdownOpen = false;
  }

  //Abre o cierra el dropdown para los iconos
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  //Cambiar el botón
  changeType(newType: string): void {
    this.type = newType;
    if (newType == 'edit') {
      this.formProfile.get('name')?.enable();
      this.formProfile.get('lastName')?.enable();
      this.formProfile.get('phoneNumber')?.enable();
      this.formProfile.get('avatar_url')?.enable();
    }
    if (newType == 'info') {
      this.ngOnInit();
      this.formProfile.disable();
    }
  }

  //-------------------------------------------------------Validaciones-------------------------------------------------------

  //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
  onValidate(controlName: string) {
    const control = this.formProfile.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid,
    };
  }

  //Muestra el mensaje de error personalizado
  showError(controlName: string): string {
    const control = this.formProfile.get(controlName);

    if (control && control.errors) {
      const errorKey = Object.keys(control.errors)[0];

      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'min':
          return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
        case 'max':
          return `El valor es mayor que el máximo permitido (${control.errors['max'].max}).`;
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        case 'date':
          return 'La fecha ingresada es inválida.';
        case 'url':
          return 'El formato de URL ingresado no es válido.';
        case 'number':
          return 'Este campo solo acepta números.';
        case 'customError':
          return 'Error personalizado: verifique el dato ingresado.';
        default:
          return 'Error no identificado en el campo.';
      }
    }

    return ''; // No hay errores o el control no existe
  }

  //-----------------------------------------------------Estilos-----------------------------------------------------

  showPlotType(plotType: any): string {
    let color: string = ''

    switch (plotType) {
      case "Comercial":
        color = "text-bg-secondary";
        break;
      case "Residencial":
        color = "text-bg-success";
        break;
      case "Baldio":
        color = "text-bg-danger";
        break;
    }
    return color;
  }
}
