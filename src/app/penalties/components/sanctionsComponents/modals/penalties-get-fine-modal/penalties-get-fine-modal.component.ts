import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PenaltiesSanctionsServicesService } from '../../../../services/sanctionsService/sanctions.service';
import { PenaltiesUpdateStateReasonModalComponent } from '../penalties-update-state-reason-modal/penalties-update-state-reason-modal.component';

@Component({
  selector: 'app-penalties-modal-fine',
  standalone: true,
  imports: [NgbModule],
  templateUrl: './penalties-get-fine-modal.component.html',
  styleUrl: './penalties-get-fine-modal.component.scss'
})
export class PenaltiesModalFineComponent implements OnInit {
  //Variables
  tooltipTitle: string = 'Se podrá consultar el descargo del propietario y, con base en ello, aceptarlo o rechazarlo.'
  @Input() fineId!: number;
  files: File[] = [];
  fine: any;
  userId:number = 1;
  stateReason:string = "";

  //Constructor
  constructor(
    public activeModal: NgbActiveModal,
    private _modal: NgbModal,
    public sanctionsService: PenaltiesSanctionsServicesService,
  ) { }


  //Init
  ngOnInit(): void {
    this.getFine(this.fineId);
  }


  //Boton de cierre del modal
  close() {
    this.activeModal.close()
  }


  getFine(fineId:number){
    this.sanctionsService.getFineById(fineId)
    .subscribe(
      (response) => {
        console.log(response); 
        this.fine = response
      },
      (error) => {
        console.error('Error:', error);
      });
  }

  ngAfterViewInit(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  //Cambiar el estado de la multa segun lo que decide el consejo 
  //acerca del descargo proporcionado por el usuario
  
  

  changeState(state:string) {
    this.openModalStateReason(state);
  }

  
  openModalStateReason(state:string) {
    const modal = this._modal.open(PenaltiesUpdateStateReasonModalComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.id = this.fine.id;
    modal.componentInstance.fineState = state;
    modal.result
      .then((result) => {
        this.close()
      })
      .catch((error) => {
        console.log("Error con modal: " + error);
      });
  }



}
