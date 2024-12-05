import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../../services/complaints.service';
import { ComplaintDto } from '../../../../models/complaint';

@Component({
  selector: 'app-modal-complaints-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './penalties-list-complaints-modal.component.html',
  styleUrl: './penalties-list-complaints-modal.component.scss'
})
export class ModalComplaintsListComponent implements OnInit {
  //Variables
  @Input() reportId: number = 0;
  @Input() formType: string = '';
  @Output() selectedComplaints = new EventEmitter<any[]>();

  complaints: any[] = [];
  filteredComplaints: any[] = [];
  tooltipTitle: string = 'Las denuncias seleccionadas se anexarán al informe. Las que no estén seleccionadas se desanexarán del mismo en caso de estar anexadas.'


  //Constructor
  constructor(
    private complaintService: ComplaintService
  ) { }


  //Init
  ngOnInit(): void {
    this.getComplaints();
  }


  //-----------------------------------CARGA DE DATOS--------------------------------------//

  //Obtiene las denuncias
  getComplaints(): void {
    this.complaintService.getAllComplaints().subscribe(response => {
      this.filteredComplaints = response.filter(complaint => {
        return complaint.reportId == null;
      })

      //Agrega la propiedad selected a cada denuncia detectando si esta o no anexada
      .map(complaint => ({
          ...complaint,
          selected: complaint.complaintState === 'Anexada'
        }));
      this.updateCheckboxes();
      console.log('Denuncias:', this.complaints);
    }, error => {
      console.error('Error al obtener denuncias', error);
    });
  }


  //Carga el tooltip en el icono de ayuda
  ngAfterViewInit(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }


  //-----------------------------------Logica--------------------------------------//

  //Actualiza los checkbox
  updateCheckboxes(): void {
    this.filteredComplaints.forEach(complaint => {
      complaint.selected = complaint.complaintState === 'Anexada';
    });
  }


  //Emite el listado actualizado con las denuncias seleccionadas
  attachSelectedComplaintsToList(): void {
    const selected = this.getSelectedComplaints();
    this.selectedComplaints.emit(selected);
  }


  //Obtiene el listado de denuncias seleccionadas
  private getSelectedComplaints(): any[] {
    return this.filteredComplaints.filter(complaint => complaint.selected);
  }

  getComplaintReason(complaint: any): string {
    if (complaint?.complaintReason === 'Otro') {
        return complaint?.complaintReason + complaint?.anotherReason;
    }
    return complaint?.complaintReason || 'N/A';
}

}
