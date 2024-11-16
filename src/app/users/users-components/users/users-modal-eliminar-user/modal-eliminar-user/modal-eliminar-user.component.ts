import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteUser } from '../../../../users-models/owner/DeleteUser';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../users-servicies/user.service';
import { UserGet } from '../../../../users-models/users/UserGet';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-eliminar-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ],
  templateUrl: './modal-eliminar-user.component.html',
  styleUrl: './modal-eliminar-user.component.css'
})
export class ModalEliminarUserComponent {

  @Input() userModal: { id: number } = { id: 0 }; // Recibe solo el userId
  @Output() userDeleted = new EventEmitter<void>(); // Emitir evento para que el componente principal recargue la tabla

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private apiService: UserService, private modal: NgbModal) {
  }

  confirmDesactivate() {
    var user = new DeleteUser();
    user.id = this.userModal.id;
    user.userIdUpdate = 1; // Cambiar por el id del usuario logueado
    this.apiService.deleteUser(user).subscribe({
      next: () => {
        console.log('Usuario eliminado correctamente');
        this.activeModal.close();
        this.userDeleted.emit(); // Emitir evento para recargar los usuarios en el componente principal
        this.showSuccessModal(); // Muestra el modal temporal de éxito (Aún sin implementar)
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error); // Muestra el modal temporal de error (Aún sin implementar)
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  showSuccessModal() {
    Swal.fire({
      title: '¡Usuario eliminado!',
      text: 'El usuario ha sido eliminado exitosamente.',
      icon: 'success',
      showConfirmButton: true, 
      timer: 2000 
    });
  }

  confirmDelete() {
    this.confirmDesactivate();
  }
}
