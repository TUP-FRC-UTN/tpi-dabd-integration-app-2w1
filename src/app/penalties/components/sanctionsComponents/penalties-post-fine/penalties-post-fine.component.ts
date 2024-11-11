import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
import { ReportDTO, plotOwner } from '../../../models/reportDTO';
import { PenaltiesSanctionsServicesService } from '../../../services/sanctionsService/sanctions.service';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { PlotService } from '../../../../users/users-servicies/plot.service';
import { ReportService } from '../../../services/report.service';
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
  newFine: boolean = false;
  reportId: number = 0;
  baseAmountInit: number=0;

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
    private routingService: RoutingService,
    private reportService: ReportService
  ) {
    
  }

  private initForm(): void {
    this.fineForm = this.fb.group({
      infractionType: ['warning', Validators.required],
      amount: [this.baseAmountInit, [
        Validators.required,
        Validators.min(this.report?.reportReason.baseAmount || 0)
      ]]
    });
  }

  ngOnInit() {
    this.setTodayDate();
    this.route.paramMap.subscribe(params => {
      this.reportId = +params.get('id')!;
      this.getReport(this.reportId);
    });
    this.initForm();
  }

  getReport(reportId: number) {
    this.penaltiesService.getById(reportId).subscribe(
      (response) => {
        this.report = response;
        const createdDate = this.report?.createdDate;
        this.baseAmountInit = this.report?.reportReason.baseAmount
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
          Validators.min(this.report.reportReason.baseAmount)
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
      this.fineForm.get('amount')?.setValue(this.report.reportReason.baseAmount);
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
            const reportDto:any = {
              id: this.report.id,
              reportState: "ENDED",
              stateReason: "Multa generada, se finaliza el proceso",
              userId: this.report.userId
            };
            this.reportService.putStateReport(reportDto).subscribe( res => {
              
            }, error => {
              console.error('Error al actualizar el estado', error);
            })
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

   //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
   onValidate(controlName: string) {
    const control = this.fineForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }


  //Retorna el primer error encontrado para el input dentro de los posibles
  showError(controlName: string) {
    const control = this.fineForm.get(controlName);
    //Si encuentra un error retorna un mensaje describiendolo
    if (control && control.errors) {
      const errorKey = Object.keys(control!.errors!)[0];
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'min':
          return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
        case 'max':
          return `El valor es mayor que el máximo permitido (${control.errors['max'].max}).`;
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        case 'date':
          return 'La fecha ingresada es inválida.';
        case 'url':
          return 'El formato de URL ingresado no es válido.';
        case 'number':
          return 'Este campo solo acepta números.';
        case 'customError':
          return 'Error personalizado: verifique el dato ingresado.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
    //Si no se cumplen ninguno de los anteriores retorna vacio
    return '';
  }
}