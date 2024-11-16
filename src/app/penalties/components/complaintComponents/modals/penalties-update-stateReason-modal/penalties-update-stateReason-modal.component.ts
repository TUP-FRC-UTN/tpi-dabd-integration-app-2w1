import { Component, Input } from '@angular/core';
import { PutStateComplaintDto } from '../../../../models/complaint';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from '../../../../services/complaints.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-penalties-modal-state-reason',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './penalties-update-stateReason-modal.component.html',
  styleUrl: './penalties-update-stateReason-modal.component.scss'
})
export class PenaltiesModalStateReasonComponent {
  reasonText:String = ""
  @Input() idComplaint:number=0
  @Input() complaintState: string = ""
  @Input() userId:number = 0
  

  constructor(public activeModal: NgbActiveModal, private complaintService: ComplaintService) {}
  ngOnInit(): void {
    console.log(this.idComplaint, this.complaintState)
  }
  close() {
    this.activeModal.close(); 
  }


  //This method is used to update
  //the state of a complaint.

  //Returns an alert if the 
  //state was updated or not.

  //Throws an error if the 
  //state could not be updated.
  putComplaint(){
    const ComplaintDto:PutStateComplaintDto = {
      id: this.idComplaint,
      userId: this.userId,
      complaintState: this.complaintState,
      stateReason: this.reasonText
    };
    // Sends the form only after confirmation.
    this.complaintService.putStateComplaint(this.idComplaint, ComplaintDto).subscribe( res => {
        Swal.fire({
          title: '¡Denuncia actualizada!',
          text: 'El estado de la denuncia fue actualizado con éxito',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
          
        });
        this.close();
      }, error => {
        console.error('Error al enviar la denuncia', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo enviar la denuncia. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      })


}
}
