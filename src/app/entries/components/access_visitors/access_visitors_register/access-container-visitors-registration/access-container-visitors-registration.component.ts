import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, combineLatest } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessVisitor, AccessVisitorRecord, AccessAuthRange, AccessUser, AccessVehicle } from '../../../../models/access-visitors/access-visitors-models';
import { ReactiveFormsModule } from '@angular/forms';
import { AccessTimeRangeVisitorsRegistrationComponent } from '../access-time-range-visitors-registration/access-time-range-visitors-registration.component';
import { AccessGridVisitorsRegistrationComponent } from '../access-grid-visitors-registration/access-grid-visitors-registration.component';
import Swal from 'sweetalert2';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { AccessVisitorFormComponent } from "../access-visitor-form/access-visitor-form.component";
import { AuthService } from '../../../../../users/users-servicies/auth.service';
import { UserLoged } from '../../../../../users/users-models/users/UserLoged';
import { Router } from '@angular/router';
import { RoutingService } from '../../../../../common/services/routing.service';
@Component({
  selector: 'app-access-container-visitors-registration',
  standalone: true,
  templateUrl: './access-container-visitors-registration.component.html',
  styleUrls: ['./access-container-visitors-registration.component.css'],
  imports: [
    ReactiveFormsModule,
    AccessGridVisitorsRegistrationComponent,
    AccessTimeRangeVisitorsRegistrationComponent,
    CommonModule,
    AccessVisitorFormComponent
],
})
export class AccessContainerVisitorsRegistrationComponent implements OnInit, OnDestroy {
  private router=inject(Router);
  goTo(path: string) {
  this.routingService.redirect(path, 'Actualizar Visitante');
  }
  uid?: string;
  qrCodeId?: string;
  isQRCodeAvailable: boolean = false;
  private unsubscribe$ = new Subject<void>();
  user!: UserLoged;
  visitorRecord?: AccessVisitorRecord;
  isRegisterButtonVisible: boolean = true;
  visitorForm!: FormGroup;
  currentStep = 0;

  isLoading: boolean = false;
  buttonText: string = 'Autorizar';

  constructor(
    private visitorService: AccessVisitorsRegisterServiceService,
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
    private authService: AuthService,
    private routingService: RoutingService
  ) {}
  handleUpdateVisitor(event: any): void {
    // Primero actualizamos el visitante como lo hacías antes
    this.updateVisitor(event);
    
    // Luego regresamos al paso 1 y actualizamos el formulario
    this.currentStep = 0;
    
    // Aquí deberías actualizar el formulario con los datos del visitante
    // Asumiendo que el evento trae los datos necesarios
    this.visitorForm.patchValue({
      firstName: event.firstName,
      lastName: event.lastName,
      document: event.document,
      email: event.email,
      // ... otros campos que necesites actualizar
    });
  }
  
  // Opcional: para mejor control de la navegación entre steps
  canProceedToNextStep(): boolean | undefined {
    switch(this.currentStep) {
      case 0:
        return this.visitorForm.get('document')?.valid && 
               this.visitorForm.get('firstName')?.valid && 
               this.visitorForm.get('lastName')?.valid && 
               this.visitorForm.get('email')?.valid;
      case 1:
        return true; // Define aquí las validaciones necesarias para el paso 2
      default:
        return true;
    }
  }
  
  // Opcional: para navegar entre steps de manera más controlada
  nextStep(): void {
    if (this.currentStep < 2 && this.canProceedToNextStep()) {
      this.currentStep++;
    }
  }
  
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }



  sendVisitorWithoutRH(): void {
    if (this.visitorForm.valid) {
      const visitantData = this.visitorForm.value;

      const vehicle: AccessVehicle | undefined = visitantData.hasVehicle ? {
        licensePlate: visitantData.licensePlate,
        vehicleType: {
          description: visitantData.vehicleType
        },
        insurance: visitantData.insurance,
      } : undefined;

      console.log(visitantData);
      const visitor: AccessVisitor = {
        firstName: visitantData.firstName,
        lastName: visitantData.lastName,
        document: visitantData.document,
        email: visitantData.email,
        hasVehicle: visitantData.hasVehicle,
        documentType: visitantData.documentType || undefined,
        vehicle: vehicle,
        neighborLastName: this.user.lastname,
        neighborName: this.user.name,
        userType: visitantData.authorizedType
      };

      if (!this.visitorService.addVisitorsTemporalsSubject(visitor)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede agregar el visitante: El documento o email ya existe en la lista.',
          confirmButtonText: 'Entendido'
        });
      } else {
        this.resetForm();
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos requeridos correctamente.',
        confirmButtonText: 'Entendido'
      });
    }
  }

  resetForm(): void {
    const currentAuthorizedType = this.visitorForm.get('authorizedType')?.value;
    this.visitorForm.reset({
      authorizedType: currentAuthorizedType,
      firstName: '',
      lastName: '',
      document: '',
      email: '',
      hasVehicle: false,
      licensePlate: '',
      vehicleType: ''
    });
  }

  downloadQRCode(): void {
    if (!this.qrCodeId) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No hay un ID de QR disponible.',
      });
      return;
    }

    this.visitorHttpService.getQRCode(this.qrCodeId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Qr_${this.uid || 'default'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.resetEverything();
        this.isQRCodeAvailable = false;
        this.isRegisterButtonVisible = true;
        Swal.fire({
          icon: 'success',
          title: 'QR Descargado',
          text: 'Se descargó correctamente el QR. Puede agregar nuevos visitantes.',
          showConfirmButton: true
        });
      },
      error: (error) => {
        console.error('Error downloading QR code', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al descargar el código QR.',
        });
      }
    });
  }

  setNameQr(): void {
    if (this.qrCodeId) {
      this.visitorHttpService.getUidQrByQrId(this.qrCodeId).subscribe({
        next: (response) => {
          console.log('Response:', response);
          this.uid = response.uid;
          console.log('UID:', this.uid);
        },
        error: (error) => {
          console.error('Error retrieving UID', error);
        }
      });
    }
  }

  private resetEverything(): void {
    this.resetFormComplete();
    this.qrCodeId = undefined;
    this.visitorRecord = undefined;
    this.visitorService.resetAllData();
    this.isRegisterButtonVisible = true;
  }

  resetFormComplete(): void {
    this.visitorForm.reset({
      authorizedType: '',
      firstName: '',
      lastName: '',
      document: '',
      documentType: '',
      email: '',
      hasVehicle: false,
      licensePlate: '',
      vehicleType: '',
      insurance: ''
    });
  }

  sendVisitorRecord(): void {
    if (this.visitorRecord) {
      if (this.visitorRecord.visitors.length <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede enviar el registro: ingrese un autorizado.',
        });
        return;
      }

      if (!this.visitorRecord.authRange || this.visitorRecord.authRange == null || this.visitorRecord.authRange.allowedDays.length < 1) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede enviar el registro: ingrese un rango de fechas con al menos un día permitido.',
        });
        this.isQRCodeAvailable = false;
        return;
      }

      this.isLoading = true;
      this.buttonText = 'Registrando...';
      this.isRegisterButtonVisible = false;

      setTimeout(() => {
        this.visitorHttpService.postVisitorRecord(this.visitorRecord!).subscribe({
          next: (response) => {
            if (this.existsVisitor()) {
              if (response.id) {
                this.qrCodeId = response.id;
              }
              if (this.qrCodeId) {
                this.isQRCodeAvailable = true;
                this.isRegisterButtonVisible = false;
                this.setNameQr();
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Advertencia',
                  text: 'El registro se creó pero no se generó el código QR.',
                });
              }
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Registro enviado correctamente',
                text: 'El registro de autorización se ha enviado exitosamente.',
              });
              this.isQRCodeAvailable = false;
            }
            if (!this.isQRCodeAvailable) {
              this.resetEverything();
            }
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se puede enviar el registro.',
            });
            console.error('Error sending visitor record', error);
            this.isQRCodeAvailable = false;
            this.resetEverything();
          },
          complete: () => {
            this.isLoading = false;
            this.buttonText = 'Registrar';
          }
        });
      }, 1000);
    }
  }

  existsVisitor(): boolean {
    return this.visitorRecord!.visitors.find(v => v.userType === 1) !== undefined;
  }

  initVisitorRecord(): void {
    combineLatest([
      this.visitorService.getVisitorsTemporalsSubject(),
      this.visitorService.getAuthRange()
    ]).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(([visitors, authRange]) => {
      this.updateVisitorRecord(visitors, authRange);
    });
  }

  updateVisitorRecord(visitors: AccessVisitor[], authRange: AccessAuthRange | null): void {
    this.visitorRecord = {
      visitors: visitors,
      authRange: authRange
    };
  }
  private documentTypeSubscription?: Subscription;

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.initVisitorRecord();
  }


  setFormData(visit: AccessVisitor): void {
    setTimeout(() => {
      this.visitorForm.patchValue({
        firstName: visit.firstName,
        lastName: visit.lastName,
        document: visit.document,
        documentType: visit.documentType,
        email: visit.email,
        hasVehicle: visit.hasVehicle,
        licensePlate: visit.hasVehicle ? visit.vehicle?.licensePlate : '',
        vehicleType: visit.hasVehicle ? visit.vehicle?.vehicleType?.description : '',
        insurance: visit.hasVehicle ? visit.vehicle?.insurance : '',
        authorizedType: visit.userType
      });
    }, 0);
  }

  updateVisitor(visit: AccessVisitor): void {
    this.setFormData(visit);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.documentTypeSubscription?.unsubscribe();
  }
}
