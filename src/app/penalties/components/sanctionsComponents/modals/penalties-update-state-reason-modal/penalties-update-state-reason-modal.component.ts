import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SanctionService } from '../../../../services/sanctions.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../../../users/users-servicies/user.service';
import { UserGet } from '../../../../../users/users-models/users/UserGet';

@Component({
  selector: 'app-penalties-update-state-reason-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './penalties-update-state-reason-modal.component.html',
  styleUrl: './penalties-update-state-reason-modal.component.scss'
})
export class PenaltiesUpdateStateReasonModalComponent {
  //Variables
  @Input() id: number = 1
  @Input() fineState: string = ""
  @Input() fine: any = ""
  userId: number = 1;
  reasonText: String = ""

  
  //Constructor
  constructor(
    public activeModal: NgbActiveModal,
    public sanctionService: SanctionService,
    public userService: UserService
  ) { }


  //
  ngOnInit(): void {
    console.log(this.id, this.fineState)
  }


  //
  close() {
    this.activeModal.close();
  }


  //
  putFine() {
    const fineDto: any = {
      id: this.id,
      fineState: this.fineState,
      stateReason: this.reasonText,
      userId: this.userId
    };


    //
    this.sanctionService.putStateFine(fineDto).subscribe(res => {

      //  Hacer un If fineState para saber el estado (aceptado o rechazado)
      let dischargeState = ''
      if (this.fineState == 'PAYMENT_PAYMENT') {
        dischargeState = 'REJECTED'// Rechazada
      }
      else if (this.fineState == 'ACQUITTED') {
        dischargeState = 'ACCEPTED'// Aceptada
      }
      let ownersIds: number[] = this.getOwnersIdByPlotId(this.fine.report.plotId);
      ownersIds.forEach(id => {
        let appealUpdate = {
          appealStatus: dischargeState,
          motive: this.reasonText,
          user_id: id
        };
        this.sanctionService.notifyDischargeResolved(appealUpdate).subscribe({
          next: () => { console.log("Notificacion enviada correctamente") },
          error: (e) => {
            console.log("Error al enviar la notificacion: ", e)
          }
        });
      });

      Swal.fire({
        title: 'Multa actualizada!',
        text: 'El estado de la multa fue actualizado con éxito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      this.sanctionService.triggerRefresh();
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
  }

  getOwnersIdByPlotId(plotId: number): number[] {
    let ownersIds: number[] = [];
    let users: UserGet[] = [];
    this.userService.getUsersByPlotID(plotId).subscribe({
      next: (data) => { users = data },
      error: (e) => { console.log("Error al cargar usuarios: ", e) }
    });
    users.forEach((user: UserGet) => {
      if (user.roles.includes('Propietario')) {
        ownersIds.push(user.id);
      }
    });
    return ownersIds;
  }


}
