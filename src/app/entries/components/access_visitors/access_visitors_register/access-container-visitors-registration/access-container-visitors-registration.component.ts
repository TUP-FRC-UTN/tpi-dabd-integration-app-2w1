import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessVisitor, AccessVisitorRecord, AccessAuthRange, AccessVehicle,AccessUser } from '../../../../models/access-visitors/access-visitors-models';
import { ReactiveFormsModule } from '@angular/forms';
import { AccessTimeRangeVisitorsRegistrationComponent } from '../access-time-range-visitors-registration/access-time-range-visitors-registration.component';
import { AccessGridVisitorsRegistrationComponent } from '../access-grid-visitors-registration/access-grid-visitors-registration.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-access-container-visitors-registration',
  standalone: true,
  templateUrl: './access-container-visitors-registration.component.html',
  styleUrls: ['./access-container-visitors-registration.component.css'], 
  imports: [
    ReactiveFormsModule,
    AccessGridVisitorsRegistrationComponent,
    AccessTimeRangeVisitorsRegistrationComponent,
    CommonModule
  ],
})
export class AccessContainerVisitorsRegistrationComponent implements OnInit, OnDestroy {
  qrCodeId?:string;
  isQRCodeAvailable?: boolean;
  visitorForm!: FormGroup; 
  vehicleType: string[] = [];
  patentePattern = '^[A-Z]{1,3}\\d{3}[A-Z]{0,3}$';
  private unsubscribe$ = new Subject<void>();
  visitorRecord?:AccessVisitorRecord;
  vehicleTypes: string[] = ['Car', 'Motorbike', 'Truck', 'Van']; // Elimina 'Bus'

  vehicleTypeMapping: { [key: string]: string } = {
    'Car': 'Auto',
    'Motorbike': 'Moto',
    'Truck': 'Camión',
    'Bus': 'Autobús',
    'Van': 'Camioneta'
  };
  vehicleOptions: { value: string, label: string }[] = [];
  translatedVehicleTypes: string[] = [];
  constructor(
    private fb: FormBuilder,
    private visitorService: AccessVisitorsRegisterServiceService,
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
  ) { 
    this.vehicleOptions = this.vehicleTypes.map(type => ({
      value: type,
      label: this.vehicleTypeMapping[type] || type
    }));
    this.translatedVehicleTypes = this.vehicleTypes.map(type => this.vehicleTypeMapping[type] || type);
  }



  downloadQRCode(): void {
    if (this.qrCodeId) {
        this.visitorHttpService.getQRCode(this.qrCodeId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `VisitanteQrNro${this.qrCodeId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.resetEverything(); 
                Swal.fire({
                    icon: 'success',
                    title: 'QR Descargado',
                    text: 'El registro ha sido limpiado. Puede agregar nuevos visitantes.',
                    showConfirmButton: true
                });
            },
            error: (error) => {
                console.error('Error downloading QR code', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al descargar el código QR',
                });
            }
        });
    }
}




  private resetEverything(): void {
    this.resetForm();
    this.qrCodeId = undefined;
    this.isQRCodeAvailable = false;
    this.visitorRecord = undefined;
    this.visitorService.resetAllData();
  }


  sendVisitorRecord(): void {
    if (this.visitorRecord) {
      if(this.visitorRecord.visitors.length<=0){
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede enviar el registro: ingrese un visitante por lo menos.',
        });
      }
      if (!this.visitorRecord.authRange || this.visitorRecord.authRange ==null) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede enviar el registro: ingrese un rango de fechas con al menos un dia permitido.',
        });
      
        this.isQRCodeAvailable = false;
        return;
      }
  
      this.visitorHttpService.postVisitorRecord(this.visitorRecord).subscribe({
        next: (response) => {
          this.qrCodeId = response.qrCodeId || response.id;
          this.isQRCodeAvailable = !!this.qrCodeId;
        },
        error: (error) => {
          console.error('Error sending visitor record', error);
          this.isQRCodeAvailable = false;
        }
      });
    }
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
  ngOnInit(): void {

    this.initForm();
    this.loadVehicleTypes();
    this.listenToHasVehicleChanges();
    this.initVisitorRecord();
  
  }
  initForm(): void {
    this.visitorForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(45)]],
      lastName: ['', [Validators.required, Validators.maxLength(45)]],
      document: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern('^[A-Za-z0-9]{8,15}$'), 
      ]],
      documentType:[''],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(70)]],
      hasVehicle: [false],
      licensePlate: [''],
      vehicleType: [''],
      insurance: ['']
    });
  }

  

loadVehicleTypes(): void {
  this.visitorHttpService.getVehicleTypes().pipe(
    takeUntil(this.unsubscribe$)
  ).subscribe({
    next: (types) => {
      this.vehicleType = types;
    },
    error: (error) => {
      console.error('Error al cargar tipos de vehículos:', error);
    }
  });
}

listenToHasVehicleChanges(): void {
  const hasVehicleControl = this.visitorForm.get('hasVehicle');
  if (hasVehicleControl) {
    hasVehicleControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((hasVehicle: boolean) => {
      const licensePlateControl = this.visitorForm.get('licensePlate');
      const vehicleTypeControl = this.visitorForm.get('vehicleType');
      const insuranceControl = this.visitorForm.get('insurance');
      
      if (licensePlateControl && vehicleTypeControl && insuranceControl) {
        if (hasVehicle) {
          licensePlateControl.setValidators([Validators.required, Validators.pattern(this.patentePattern), Validators.maxLength(7)]);
          vehicleTypeControl.setValidators([Validators.required]);
          insuranceControl.setValidators([Validators.required]);
        } else {
          licensePlateControl.clearValidators();
          vehicleTypeControl.clearValidators();
          insuranceControl.clearValidators();
        }
        
        licensePlateControl.updateValueAndValidity();
        vehicleTypeControl.updateValueAndValidity();
        insuranceControl.updateValueAndValidity();
      }
    });
  }
}

onLicensePlateInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  input.value = input.value.toUpperCase();
  this.visitorForm.patchValue({ licensePlate: input.value });
}

onlyNumbers(event: Event): void {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, '');
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

        const visitor: AccessVisitor = {
            firstName: visitantData.firstName,
            lastName: visitantData.lastName,
            document: visitantData.document,
            email: visitantData.email,
            hasVehicle: visitantData.hasVehicle,
            documentType: visitantData.documentType || undefined,
            vehicle: vehicle, 
        };
        if(this.visitorService.addVisitorsTemporalsSubject(visitor)){
          console.log("no sepudo agregar.")
        }
        
        console.log(visitor);
        console.log(this.visitorForm);
        console.log(this.visitorForm.valid);
        this.resetForm();
    } else {
        console.log('El formulario no es válido');
    }
}

setFormData(visit: AccessVisitor): void {
  setTimeout(() => {
    this.visitorForm.patchValue({
      firstName: visit.firstName,
      lastName: visit.lastName,
      document: visit.document,
      documentType:visit.documentType,
      email: visit.email,
      hasVehicle: visit.hasVehicle,
      licensePlate: visit.hasVehicle ? visit.vehicle?.licensePlate : '', 
      vehicleType: visit.hasVehicle ? visit.vehicle?.vehicleType?.description : '', 
      insurance: visit.hasVehicle ? visit.vehicle?.insurance : ''
    });
  }, 0);
}

updateVisitor(visit: AccessVisitor): void {
  console.log('Visitante a editar:', visit);
  this.setFormData(visit);
}

onDocumentInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.visitorForm.patchValue({ document: input.value });
}

resetForm(): void {
  this.visitorForm.reset({
    firstName: '',
    lastName: '',
    document: '',
    email: '',
    hasVehicle: false,
    licensePlate: '',
    vehicleType: ''
  });
}

ngOnDestroy(): void {
  this.unsubscribe$.next();
  this.unsubscribe$.complete();
}

}
