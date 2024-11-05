import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PenaltiesSanctionsServicesService } from '../../../../services/sanctionsService/sanctions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-penalties-update-state-reason-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './penalties-update-state-reason-modal.component.html',
  styleUrl: './penalties-update-state-reason-modal.component.scss'
})
export class PenaltiesUpdateStateReasonModalComponent {
  reasonText:String = ""
  @Input() id:number=1
  @Input() fineState: string = ""
  userId: number = 1;
  

  constructor(public activeModal: NgbActiveModal, 
    public sanctionService: PenaltiesSanctionsServicesService) {}
  ngOnInit(): void {
    console.log(this.id, this.fineState)
  }
  close() {
    this.activeModal.close(); 
  }

  //metodo para enviar
  putFine(){
    const fineDto:any = {
      id: this.id,
      fineState: this.fineState,
      stateReason: this.reasonText,
      userId: this.userId
    };
    // Confirmación antes de enviar el formulario
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas confirmar la actualización de la multa?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
    }).then((result: any) => {
      if (result.isConfirmed) {
        // Envío de formulario solo después de la confirmación
        this.sanctionService.putStateFine(fineDto).subscribe( res => {
            Swal.fire({
              title: 'Multa actualizada!',
              text: 'El estado de la multa fue actualizado con éxito',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
              
            });
            this.close();
          }, error => {
            console.error('Error al enviar la multa', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo enviar la multa. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          })
        };
      });
    
  }
}
