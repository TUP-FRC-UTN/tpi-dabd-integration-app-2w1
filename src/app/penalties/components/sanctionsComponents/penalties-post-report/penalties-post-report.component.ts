import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router, Routes, RouterModule } from '@angular/router';
// import { MockapiService } from '../../../services/mock/mockapi.service';
import { PostReportDTO } from '../../../models/PostReportDTO';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';
import { ReportService } from '../../../services/report.service';
import { error } from 'jquery';
import { ModalComplaintsListComponent } from '../../complaintComponents/modals/penalties-list-complaints-modal/penalties-list-complaints-modal.component';
import { RoutingService } from '../../../../common/services/routing.service';
import Swal from 'sweetalert2';
import { PlotService } from '../../../../users/users-servicies/plot.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlotModel } from '../../../../users/users-models/plot/Plot';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-report',
  standalone: true,
  imports: [FormsModule, RouterLink, ModalComplaintsListComponent, RouterModule, CommonModule],
  templateUrl: './penalties-post-report.component.html',
  styleUrl: './penalties-post-report.component.scss'
})
export class NewReportComponent {
  url = 'https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/plots';
  private readonly plotService = inject(PlotService);
  private readonly mockPlotService = inject(HttpClient);
  mockGetPlots(): Observable<any[]> {
    return this.mockPlotService.get<any[]>(this.url);
  }
  plot = "";
  plots: any[] = [];
  selectedReasonId = "";
  selectedDate = '';
  dateView = '';
  textareaPlaceholder = 'Ingrese su mensaje aquí...';
  description = '';
  reportReasons: ReportReasonDto[] = [];
  complaintsList: any[] = [];
  selectedComplaints: any[] = [];
  selectedComplaintsCount = 0;

  constructor(private reportService: ReportService,
     private router: Router,
     private routingService: RoutingService
    ) {
    this.dateView = this.setTodayDate();
  }

  setTodayDate(): string {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.getReportReasons();
    this.getPlots();
  }

  getReportReasons(): void {
    this.reportService.getAllReportReasons().subscribe(
      (reasons: ReportReasonDto[]) => {
        reasons.forEach((reason) => this.reportReasons.push(reason))
        console.log("Reports: " + this.reportReasons)
      },
      (error) => {
        console.error('Error al cargar report reasons: ', error);
      }
    );

  }

  getPlots(): void {
    this.plotService.getAllPlots().subscribe(
    //this.mockGetPlots().subscribe(
      (plots: any[]) => {
        this.plots = plots.map(plot => ({
          id: plot.id,
          name: `Bloque ${plot.block_number}, Lote ${plot.plot_number}`
        }));
        console.log("Mapped Plots: ", this.plots);
      },
      (error) => {
        console.error('Error al cargar plots: ', error);
      }
    );
  }

  handleSelectedComplaints(selectedComplaints: any[]): void {
    console.log('Denuncias recibidas del modal:', selectedComplaints);
    this.complaintsList = selectedComplaints;
    this.selectedComplaintsCount = selectedComplaints.length;
  }

  onSubmit(): void {
    console.log("Submit");
    const userId = 1;
    const plotId = this.plot;

    const complaintsIds = this.complaintsList.length > 0
      ? this.complaintsList.map(complaint => complaint.id)
      : [];

    if (complaintsIds.length === 0) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Debe cargar al menos una denuncia.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        customClass: {
          confirmButton: 'btn btn-secondary'
        },
      });
      return;
    }

    if (this.validateParams()) {
      this.selectedReasonId == "" ? this.selectedReasonId = "" : this.selectedReasonId;
      const reportDTO: PostReportDTO = {
        reportReasonId: Number(this.selectedReasonId),
        plotId: Number(plotId),
        description: this.description,
        complaints: complaintsIds,
        userId: userId,
      };
      console.log(reportDTO);
      this.reportService.postReport(reportDTO).subscribe({
        next: (response) => {
          Swal.fire({
            title: '¡Informe creado!',
            text: 'El informe ha sido creado correctamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.routingService.redirect("main/sanctions/report-list", "Listado de Informes")
        },
        error: (error) => {
          console.error('Error al enviar la denuncia', error);
        }
      });
    } else {
      console.log("Los campos no estaban validados")
    }
  }

  cancel(){
    this.routingService.redirect("main/sanctions/report-list/", "Listado de Informes")
  }

  validateParams(): boolean {
    if (this.selectedReasonId == "0" || this.selectedReasonId == null) {
      return false
    }
    if (Number(this.plot) == 0 || this.plot == null) {
      return false;
    }
    if (this.description == null || this.description == '') {
      return false
    }
    if (this.reportReasons == null || this.reportReasons[0] == null) {
      return false;
    }
    return true;
  }

  openSelectComplaints(): void {
    const modalElement = document.getElementById('complaintModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

}
