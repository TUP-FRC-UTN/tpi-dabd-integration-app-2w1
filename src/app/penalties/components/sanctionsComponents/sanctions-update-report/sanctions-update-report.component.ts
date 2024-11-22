import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PutReportDTO } from '../../../models/PutReportDTO';
import { ComplaintService } from '../../../services/complaints.service';
import { SanctionService } from '../../../services/sanctions.service';
import { ModalComplaintsListComponent } from '../../complaintComponents/modals/penalties-list-complaints-modal/penalties-list-complaints-modal.component';
import { RoutingService } from '../../../../common/services/routing.service';
import Swal from 'sweetalert2';
import { PlotService } from '../../../../users/users-servicies/plot.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-modify',
  standalone: true,
  imports: [FormsModule, RouterLink, ModalComplaintsListComponent],
  templateUrl: './sanctions-update-report.component.html',
  styleUrl: './sanctions-update-report.component.scss'
})
export class ReportModifyComponent implements OnInit {
  url = 'https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/plots';
  private readonly plotService = inject(PlotService);
  private readonly mockPlotService = inject(HttpClient);
  
  reportId: number = 0;
  reportState = '';
  selectedDate = '';
  plotId: number = 0;
  infractorPlaceholder: string = '';
  textareaPlaceholder = 'Ingrese su mensaje aquí...';
  description = '';
  selectedComplaints: any[] = [];
  private route: ActivatedRoute;
  modalInstance: any;
  formType = 'modify';

  constructor(private complaintService: ComplaintService,
     private reportService: SanctionService,
       route: ActivatedRoute,
       private routingService: RoutingService
      ) {
    this.route = route;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.reportId = params['id'] || '';
        this.reportState = params['reportState'] || '';
        this.selectedDate = this.formatDate(params['createdDate'] || '');
        this.description = params['description'] || '';
        this.plotId = params['plotId'] || '';
        if (this.plotId) {
          this.plotService.getPlotById(this.plotId).subscribe(plot => {
            this.infractorPlaceholder = `Bloque ${plot.block_number}, Lote ${plot.plot_number}`;
          });
        }
        if (this.reportId) {
          this.loadSelectedComplaints(this.reportId);
        }
        console.log(params);
      }
    });
  }

  loadSelectedComplaints(reportId: number): void {
    this.reportService.getById(reportId).subscribe(report => {
      this.selectedComplaints = report.complaints || [];
    });
  }

  development(): void {
    (window as any).Swal.fire({
      title: 'Función en desarrollo',
      text: 'Esta funcionalidad aún está en desarrollo.',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const [datePart] = dateString.split(' ');
    return datePart;
  }

  handleSelectedComplaints(selectedComplaints: any[]): void {
    this.selectedComplaints = selectedComplaints;
  }

  updateReport(): void {
    
        const userId = 1;

        const complaintsIds = this.selectedComplaints.length > 0
          ? this.selectedComplaints.map(complaint => complaint.id)
          : [];

        const reportDTO: PutReportDTO = {
          id: this.reportId,
          userId: userId,
          description: this.description,
          complaintsIds: complaintsIds,
        };

        this.reportService.updateReport(reportDTO).subscribe(res => {
          Swal.fire({
            title: '¡Actualización exitosa!',
            text: 'El informe ha sido actualizado correctamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.routingService.redirect("main/sanctions/report-list", "Listado de Informes")
        }, error => {
          console.error('Error al actualizar el informe', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el informe. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
      }
 

  cancel(){
    this.routingService.redirect("main/sanctions/report-list", "Listado de Informes")
  }

  openModal(): void {
    const modalElement = document.getElementById('complaintModal');
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalElement.addEventListener('shown.bs.modal', () => {
        const modalComponent = (modalElement as any).componentInstance;
        if (modalComponent) {
          modalComponent.selectedComplaints = [...this.selectedComplaints];
          modalComponent.updateCheckboxes();
          modalComponent.reportId = this.reportId;
        }
      });
      this.modalInstance.show();
    }
  }
}
