import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from '../../../../services/report.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-penalties-update-state-reason-report-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './penalties-update-state-reason-report-modal.component.html',
  styleUrls: ['./penalties-update-state-reason-report-modal.component.css']
})
export class PenaltiesUpdateStateReasonReportModalComponent implements OnInit {

  reasonText:String = ""
  @Input() id:number=1
  @Input() reportState: string = ""
  userId: number = 1;
  

  constructor(public activeModal: NgbActiveModal, 
    public reportService: ReportService) {}


  ngOnInit(): void {
    console.log(this.id, this.reportState)
  }


  close() {
    this.activeModal.close(); 
  }

  // Sends the updated fine state to the server
  //
  // Builds a `fineDto` object with:
  // - id: Fine ID to update
  // - fineState: New state to be set
  // - stateReason: Reason entered by user for the update
  // - userId: ID of the user making the change
  //
  // If successful, refreshes the fine list and closes the modal.
  // Shows an alert based on the response.
  putReport(){
    const reportDto:any = {
      id: this.id,
      reportState: this.reportState,
      stateReason: this.reasonText,
      userId: this.userId
    };

        // This method sends the 
        // fine to the service.

        // If the fine is sent correctly, 
        // it will show a success message.
        
        // If the fine is not sent correctly, 
        // it will show an error message.
        this.reportService.putStateReport(reportDto).subscribe( res => {
            Swal.fire({
              title: 'Informe actualizado!',
              text: 'El estado del informe fue actualizado con éxito',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
              
            });
            this.reportService.triggerRefresh();
            this.close();
          }, error => {
            console.error('Error al enviar el informe', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo enviar el informe. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          })

    
  }

}
