import { Component, Input } from '@angular/core';
import { PutStateComplaintDto } from '../../../../models/complaint';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from '../../../../services/complaints.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../../users/users-servicies/auth.service';
@Component({
  selector: 'app-penalties-modal-state-reason',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './penalties-update-stateReason-modal.component.html',
  styleUrl: './penalties-update-stateReason-modal.component.scss'
})
export class PenaltiesModalStateReasonComponent {
  //Variables
  @Input() idComplaint: number = 0;
  @Input() complaintState: string = "";

  reasonText: String = ""


  //Constructor
  constructor(
    public activeModal: NgbActiveModal,
    private complaintService: ComplaintService,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
  }

  //-----------------------------------Metodos modal--------------------------------------//

  //Cierra el modal
  close() {
    this.activeModal.close();
  }


  //Envia la peticion a la api para el cambio de estado e informa con SW el resultado
  putComplaint() {
    alert("putComplaint" + ' - ' +this.idComplaint + ' - ' +this.complaintState + ' - ' + this.reasonText);
    const ComplaintDto: PutStateComplaintDto = {
      id: this.idComplaint,
      userId: this.authService.getUser().id,
      complaintState: this.complaintState,
      stateReason: this.reasonText
    };
    //Llama al servicio para actualizar la denuncia y dispara sweet alerts
    this.complaintService.putStateComplaint(this.idComplaint, ComplaintDto).subscribe(res => {
      Swal.fire({
        title: '¡Denuncia actualizada!',
        text: 'El estado de la denuncia fue actualizado con éxito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      this.close();
    }, error => {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la denuncia. Inténtelo de nuevo mas tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    })
  }

}
