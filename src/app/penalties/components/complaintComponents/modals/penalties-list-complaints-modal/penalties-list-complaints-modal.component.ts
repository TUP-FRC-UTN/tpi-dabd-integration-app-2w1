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
  @Input() reportId: number = 0;
  @Input() formType: string = '';
  complaints: any[] = [];
  tooltipTitle: string = 'Las denuncias seleccionadas se anexarán al informe. Las que no estén seleccionadas se desanexarán del mismo en caso de estar anexadas.'
  @Output() selectedComplaints = new EventEmitter<any[]>();

  constructor(private complaintService: ComplaintService) { }

  ngOnInit(): void {
    this.getComplaints();
  }

  // This method gets all the complaints 
  // from the database using the service.
  getComplaints(): void {
    this.complaintService.getAllComplaints().subscribe(res => {
      console.log(res)
      this.complaints = res.filter(complaint => {
        if (this.formType === 'modify') {
          return (complaint.complaintState == 'Nueva' && complaint.reportId == null) ||
            (complaint.complaintState == 'Pendiente' && complaint.reportId == null) ||
            (complaint.reportId == Number(this.reportId) && complaint.complaintState == 'Anexada');
        } else {
          return (complaint.complaintState == 'Nueva' && complaint.reportId == null) || (complaint.complaintState == 'Pendiente' && complaint.reportId == null);
        }
      })
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

  updateCheckboxes(): void {
    this.complaints.forEach(complaint => {
      complaint.selected = complaint.complaintState === 'Anexada';
    });
  }

  // Emits the selected complaints 
  // to the parent component.
  attachSelectedComplaintsToList(): void {
    const selected = this.getSelectedComplaints();
    console.log('Denuncias seleccionadas antes de emitir:', selected);
    this.selectedComplaints.emit(selected);
  }

  // Filters the 
  // selected complaints.
  private getSelectedComplaints(): any[] {
    return this.complaints.filter(complaint => complaint.selected);
  }

  // Tooltip for the 
  // question mark icon.
  ngAfterViewInit(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

}
