import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
import { ReportDTO, plotOwner } from '../../../models/reportDTO';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { PlotService } from '../../../../users/users-servicies/plot.service';
@Component({
  selector: 'app-penalties-post-fine',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './penalties-post-fine.component.html',
  styleUrls: ['./penalties-post-fine.component.css']
})
export class PenaltiesPostFineComponent implements OnInit {
  private readonly plotService = inject(PlotService);


  report:any
  formattedDate: any;
  infractorPlaceholder: string = '';
  fineForm!: FormGroup;
  report: any;
  formattedDate: any;
  newFine: boolean = false;
  reportId: number = 0;

  @Input() reportDto: ReportDTO = {
    id: 0,
    reportState: '',
    plotId: 0,
    description: '',
    createdDate: new Date,
    baseAmount: 0,
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private penaltiesService: PenaltiesSanctionsServicesService,
    private route: ActivatedRoute,
    private routingService: RoutingService
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.fineForm = this.fb.group({
      infractionType: ['warning', Validators.required],
      amount: [0, [
        Validators.required,
        Validators.min(this.report?.baseAmount || 0)
      ]]
    });
  }

  ngOnInit() {
    this.setTodayDate();
    this.route.paramMap.subscribe(params => {
      this.reportId = +params.get('id')!;
      this.getReport(this.reportId);
    });
  }

  getReport(reportId: number) {
    this.penaltiesService.getById(reportId).subscribe(
      (response) => {
        this.report = response;
        const createdDate = this.report?.createdDate;
        this.formattedDate = new Date(createdDate).toISOString().split('T')[0];
        this.plotService.getPlotById(this.report.plotId).subscribe(
          (plot) => {
            this.infractorPlaceholder = `Bloque ${plot.block_number}, Lote ${plot.plot_number}`;
          },
          (error) => {
            console.error('Error al obtener los datos del plot:', error);
          }
        );
        
        // Update amount validator with the new baseAmount
        this.fineForm.get('amount')?.setValidators([
          Validators.required,
          Validators.min(this.report.baseAmount)
        ]);
        this.fineForm.get('amount')?.updateValueAndValidity();
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  setTodayDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    this.formattedDate = `${year}-${month}-${day}`;
  }

  showAmountToPay(radioButton: string) {
    this.newFine = radioButton === 'fine';
    if (!this.newFine) {
      this.fineForm.get('amount')?.setValue(0);
    }
  }

  onSubmit(): void {
    if (this.fineForm.valid) {
      if (this.fineForm.get('infractionType')?.value === 'fine') {
        const fineData = {
          reportId: this.reportId,
          amount: this.fineForm.get('amount')?.value,
          createdUser: 1
        };

        this.penaltiesService.postFine(fineData).subscribe(
          res => {
            Swal.fire({
              title: '¡Multa enviada!',
              text: 'La multa ha sido enviada correctamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones");
          },
          error => {
            console.error('Error al actualizar la multa', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar la multa. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      } else {
        const warningData = {
          reportId: this.reportId,
          createdUser: 1
        };

        this.penaltiesService.postWarning(warningData).subscribe(
          res => {
            Swal.fire({
              title: '¡Advertencia enviada!',
              text: 'La advertencia ha sido enviada correctamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.routingService.redirect("main/sanctions/sanctions-list", "Listado de Infracciones");
          },
          error => {
            console.error('Error al enviar la advertencia', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo enviar la advertencia. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      }
    }
  }

  cancel() {
    this.routingService.redirect("main/sanctions/report-list", "Listado de Informes");
  }
}