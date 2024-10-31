import { Component, Input } from '@angular/core';
import { PutStateComplaintDto } from '../../../../models/complaint';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from '../../../../services/complaintsService/complaints.service';
import { FormsModule } from '@angular/forms';

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

  //metodo para enviar
  putComplaint(){
    const ComplaintDto:PutStateComplaintDto = {
      id: this.idComplaint,
      userId: this.userId,
      complaintState: this.complaintState,
      stateReason: this.reasonText
    }
    this.complaintService.putStateComplaint(this.idComplaint,ComplaintDto).subscribe({
      next: (response) => {
        alert('El estado de la denuncia fue actualizado con éxito');
        this.close()
        
      },
      error: (error) => {
        alert('El estado de la denuncia no pudo ser actualizado');
        this.close()
      }
    });
  }

}
