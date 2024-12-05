import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserGet } from '../../../users-models/users/UserGet';
import { UserService } from '../../../users-servicies/user.service';
import Swal from 'sweetalert2';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteUser } from '../../../users-models/owner/DeleteUser';
import { DateService } from '../../../users-servicies/date.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { AuthService } from '../../../users-servicies/auth.service';


@Component({
  selector: 'app-modal-info-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-info-user.component.html',
  styleUrl: './modal-info-user.component.css'
})
export class ModalInfoUserComponent implements OnInit, OnDestroy {

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.editUser = this.fb.group({
      fullname: [''],
      email: [''],
      dni: [''],
      phoneNumber: [''],
      birthdate: [''],
      telegram_id : [''],
      username: [''],
      plot_number:[''],
      block_number:[''],
      dni_type: [''],
      create_date: ['']
    });
  }

  @Input() userModal: UserGet = new UserGet();
  @Input() plotModal: GetPlotDto[] = [];
  @Input() typeModal: string = '';

  //activeModal = inject(NgbActiveModal);
  private readonly apiService = inject(UserService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly authService = inject(AuthService);
  
  rolesInput: string[] = [];
  editUser: FormGroup;

  // Método para detectar cambios en el @Input
  ngOnInit() {

      // Actualiza los valores del formulario cuando cambian los datos del usuario
      if (this.userModal.datebirth) {
        const formattedCreatedDate = DateService.parseDateString(this.userModal.create_date);
        const formattedDate = DateService.parseDateString(this.userModal.datebirth);

        if (formattedDate) {
          // Formatea la fecha a 'yyyy-MM-dd' para un input de tipo date
          const formattedDateString = formattedDate.toISOString().split('T')[0];

          this.editUser.patchValue({
            datebirth: formattedDateString
          });
        } else {
          this.editUser.patchValue({
            datebirth: ''
          });
        }
        
        this.editUser.patchValue({
          fullname: this.userModal.lastname + ', ' + this.userModal.name,
          email: this.userModal.email,
          dni: this.userModal.dni,
          dni_type: this.userModal.dni_type,
          phoneNumber: this.userModal.phone_number,
          roles: this.rolesInput,
          username: this.userModal.username,
          telegram_id: this.userModal?.telegram_id || 'N/A',
          birthdate: formattedDate || 'N/A',
          create_date: formattedCreatedDate || 'N/A'
        });
      }

      this.editUser.disable();
  }

  //Desuscribirse de los observables
  ngOnDestroy(): void {
    this.suscriptionService.unsubscribeAll();
  }

  //Eliminar usuario
  confirmDesactivate() {
    var user = new DeleteUser();
    user.id = this.userModal.id;
    user.userIdUpdate = this.authService.getUser().id;
    const sus = this.apiService.deleteUser(user).subscribe({
      next: () => {
        console.log('Usuario eliminado correctamente');
        this.activeModal.close();
        // Poner un sweetAlert
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
      }
    });

    //Agregar suscripción
    this.suscriptionService.addSuscription(sus);
  }

  //--------------------------------------------------------Modal--------------------------------------------------------

  //Cerrar modal
  closeModal(){
    this.activeModal.close();
  }

  //Confirmar eliminación
  confirmDelete() {
    Swal.fire({
      title: '¿Seguro que desea eliminar el usuario?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Aceptar',
      denyButtonText: 'Cancelar',
      confirmButtonColor: "#dc3545",
      denyButtonColor: "#6c757d",
    }).then((result) => {
      if (result.isConfirmed) {
        (window as any).Swal.fire({
          title: '¡Usuario borrado!',
          text: 'El usuario se ha borrado correctamente.',
          icon: 'success',
          timer: undefined,
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          allowEscapeKey: false,
          allowOutsideClick: false

        });
        this.confirmDesactivate();
      } else {
        (window as any).Swal.fire({
          title: '¡Usuario no se ha borrado!',
          text: 'La operación se ha cancelado exitosamente.',
          icon: 'info',
          timer: undefined,
          showConfirmButton: false
        });
      }
    });
  } 
}
