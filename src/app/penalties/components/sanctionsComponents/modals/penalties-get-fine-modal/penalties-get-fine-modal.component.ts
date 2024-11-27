import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SanctionService } from '../../../../services/sanctions.service';
import { PenaltiesUpdateStateReasonModalComponent } from '../penalties-update-state-reason-modal/penalties-update-state-reason-modal.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../users/users-servicies/auth.service';

@Component({
  selector: 'app-penalties-modal-fine',
  standalone: true,
  imports: [NgbModule, CommonModule],
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
    public sanctionsService: SanctionService,
    private authService: AuthService
  ) { }


  //Init
  ngOnInit(): void {
    this.getFine(this.fineId);
  }


  //Modal close button
  close() {
    this.activeModal.close()
  }

  // Retrieves fine details based on the provided fine ID.
  
  // Parameters:
  // - fineId: number - The unique identifier of the fine to be retrieved.
  
  // Subscribes to the fine retrieval observable 
  // and assigns the response to `fine`.
  
  // Logs an error if the retrieval process fails.
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

  // Initiates the process of changing the fine's state.
  
  // Parameters:
  // - state The desired state to which 
  //   the fine should be changed. 
  
  // Opens a modal to allow the user to 
  // provide a reason for the state change.
  changeState(state:string) {
    this.openModalStateReason(state);
  }

  permisionToEdit : boolean = false
  getPermisionsToEdit(){
    if(this.authService.getActualRole() === 'SuperAdmin' || 
    this.authService.getActualRole() === 'Gerente multas'){
      this.permisionToEdit = true
    }
    return this.permisionToEdit;
  }

  

  // Opens a modal to update the reason for the fine's state change.
  
  // Parameters:
  // - state: The state to which the 
  //   fine's status will be updated.
  
  // Configures modal options, sets the fine ID and new state, and handles the result.
  // Closes the main modal if the state change modal is confirmed.
  openModalStateReason(state:string) {
    const modal = this._modal.open(PenaltiesUpdateStateReasonModalComponent, {
      size: 'md',
      keyboard: false,
    });
    modal.componentInstance.id = this.fine.id;
    modal.componentInstance.fineState = state;
    modal.componentInstance.fine = this.fine;
    modal.result
      .then((result) => {
        this.close()
      })
      .catch((error) => {
        console.log("Error con modal: " + error);
      });
  }



}
