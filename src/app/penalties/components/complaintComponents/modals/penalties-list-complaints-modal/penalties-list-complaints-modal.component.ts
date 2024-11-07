import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../../services/complaintsService/complaints.service';

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

  //trae las denuncias desde el service
  getComplaints(): void {
    this.complaintService.getAllComplaints().subscribe(res => {
      this.complaints = res.filter(complaint => {
        if (this.formType === 'modify') {
          return complaint.complaintState === 'Nueva' ||
            complaint.complaintState === 'Pendiente' ||
            (complaint.reportId === Number(this.reportId) && complaint.complaintState === 'Anexada');
        } else {
          return complaint.complaintState === 'Nueva' || complaint.complaintState === 'Pendiente';
        }
      })
        .map(complaint => ({
          ...complaint,
          selected: complaint.complaintState === 'Anexada'
        }));
      console.log('Denuncias:', this.complaints);
    }, error => {
      console.error('Error al obtener denuncias', error);
    });
  }

  //emite al padre (formulario) las denuncias que se seleccionan con el chk
  attachSelectedComplaintsToList(): void {
    const selected = this.getSelectedComplaints();
    console.log('Denuncias seleccionadas antes de emitir:', selected);
    this.selectedComplaints.emit(selected);
  }

  //filtra las denuncias seleccionadas
  private getSelectedComplaints(): any[] {
    return this.complaints.filter(complaint => complaint.selected);
  }

  //tooltip para el icono del signo de pregunta
  ngAfterViewInit(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

}
