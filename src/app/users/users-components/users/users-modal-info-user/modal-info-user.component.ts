import { CommonModule, formatDate } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserGet } from '../../../users-models/users/UserGet';
import { UserService } from '../../../users-servicies/user.service';
import Swal from 'sweetalert2';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteUser } from '../../../users-models/owner/DeleteUser';
import { DateService } from '../../../users-servicies/date.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';


@Component({
  selector: 'app-modal-info-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-info-user.component.html',
  styleUrl: './modal-info-user.component.css'
})
export class ModalInfoUserComponent implements OnInit {

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
  @Input() plotModal: GetPlotDto = new GetPlotDto();
  @Input() typeModal: string = '';

  //activeModal = inject(NgbActiveModal);
  private readonly apiService = inject(UserService);
  
  rolesInput: string[] = [];
  editUser: FormGroup;

  // Método para detectar cambios en el @Input
  ngOnInit() {
      console.log('userModal:', this.userModal);
      console.log('plotModal:', this.plotModal);
      // Actualiza los valores del formulario cuando cambian los datos del usuario
      if (this.userModal.datebirth) {
        const formattedDate = DateService.parseDateString(this.userModal.datebirth);
        const formattedCreatedDate = DateService.parseDateString(this.userModal.create_date)
        this.editUser.patchValue({
          fullname: this.userModal.lastname + ', ' + this.userModal.name,
          email: this.userModal.email,
          dni: this.userModal.dni,
          dni_type: this.userModal.dni_type+': ',
          phoneNumber: this.userModal.phone_number,
          roles: this.rolesInput,
          plot_number : this.plotModal?.plot_number || 'N/A'  ,
          block_number: this.plotModal?.block_number || 'N/A',
          username: this.userModal.username,
          telegram_id: this.userModal?.telegram_id || 'N/A',
          birthdate: formattedDate ? DateService.formatDate(formattedDate) : 'N/A',
          create_date: formattedCreatedDate ? DateService.formatDate(formattedCreatedDate) : 'N/A'
        });
      }

      this.editUser.disable();
  }
  

  confirmDesactivate() {
    var user = new DeleteUser();
    user.id = this.userModal.id;
    user.userIdUpdate = 1; // Cambiar por el id del usuario logueado
    this.apiService.deleteUser(user).subscribe({
      next: () => {
        console.log('Usuario eliminado correctamente');
        this.activeModal.close();
        // Poner un sweetAlert
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        // Poner un sweetAlert
      }
    });
  }

  closeModal(){
    this.activeModal.close();
  }

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
          position: "center-center",
          title: '¡Usuario borrado!',
          text: 'El usuario se ha borrado correctamente.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        this.confirmDesactivate();
      } else {
        (window as any).Swal.fire({
          position: "center-center",
          title: '¡Usuario no se ha borrado!',
          text: 'La operación se ha cancelado exitosamente.',
          icon: 'info',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  } 
  
}
