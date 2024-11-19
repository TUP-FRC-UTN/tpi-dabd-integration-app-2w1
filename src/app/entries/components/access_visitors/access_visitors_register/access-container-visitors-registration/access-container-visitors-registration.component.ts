import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subject, combineLatest, of, pipe } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessVisitor, AccessVisitorRecord, AccessAuthRange, AccessVehicle,AccessUser, UserType } from '../../../../models/access-visitors/access-visitors-models';
import { ReactiveFormsModule } from '@angular/forms';
import { AccessTimeRangeVisitorsRegistrationComponent } from '../access-time-range-visitors-registration/access-time-range-visitors-registration.component';
import { AccessGridVisitorsRegistrationComponent } from '../access-grid-visitors-registration/access-grid-visitors-registration.component';
import Swal from 'sweetalert2';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { AccessUserServiceService } from '../../../../services/access-user/access-user-service.service';
import { AccessUserReportService } from '../../../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import { AccessInsurancesService } from '../../../../services/access-insurances/access-insurances.service';
import { error } from 'jquery';


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
  indexUserType?:number;
  onAuthorizedTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue !== "") {
      this.indexUserType = parseInt(selectedValue, 10);
      console.log(this.indexUserType);
  
      // Obtén la referencia al control `email`
      const emailControl = this.visitorForm.get('email');
  
      // Aplica la validación de `required` solo si `indexUserType` es `1`
      if (this.indexUserType === 1) {
        emailControl?.setValidators([Validators.required, Validators.email, Validators.maxLength(70)]);
      } else {
        // Elimina la validación de `required` si `indexUserType` no es `1`
        emailControl?.setValidators([Validators.email, Validators.maxLength(70)]);
      }
      // Actualiza el estado de validación del control
      emailControl?.updateValueAndValidity();
    }
  }
  


  user?: AccessUser;
  handleSelectedUser(user: AccessUser): void {
    this.user = user; 
    console.log('Selected user:', this.user);
  }
  uid?:string;
  qrCodeId?:string;
  isQRCodeAvailable: boolean = false; 
  visitorForm!: FormGroup; 
  vehicleType: string[] = [];
  patentePattern = /(^[A-Z]{2}\d{3}[A-Z]{2}$)|(^[A-Z]{3}\d{3,4}$)|(^[A-Z]{3}\d{4}$)/;
  private unsubscribe$ = new Subject<void>();
  visitorRecord?:AccessVisitorRecord;
  vehicleTypes: string[] = ['Car', 'Motorbike', 'Truck', 'Van']; 
  insurances: string[] = [];
  usersType:UserType[]=[];
  isRegisterButtonVisible: boolean = true;

  isLoading: boolean = false;
  buttonText: string = 'Registrar';

  vehicleTypeMapping: { [key: string]: string } = {
    'Car': 'Auto',
    'Motorbike': 'Moto',
    'Truck': 'Camión',
    'Van': 'Camioneta'
  };
  vehicleOptions: { value: string, label: string }[] = [];
  translatedVehicleTypes: string[] = [];
  constructor(
    private fb: FormBuilder,
    private visitorService: AccessVisitorsRegisterServiceService,
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
    private userApi: AccessUserReportService,
    private insuranceService: AccessInsurancesService
  ) { 
    this.vehicleOptions = this.vehicleTypes.map(type => ({
      value: type,
      label: this.vehicleTypeMapping[type] || type
    }));
    this.translatedVehicleTypes = this.vehicleTypes.map(type => this.vehicleTypeMapping[type] || type);
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

    this.visitorHttpService.getQRCode(this.qrCodeId).subscribe({
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
            this.isRegisterButtonVisible = true; // Mostrar botón registrar
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
          if (this.indexUserType === 1) {
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
    this.loadInsurances();
    this.listenToHasVehicleChanges();
    this.initVisitorRecord();
    this.loadUsersType();  
  }
  initForm(): void {
    this.visitorForm = this.fb.group({
      authorizedType: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(45)]],
      lastName: ['', [Validators.required, Validators.maxLength(45)]],
      document: ['', {
        validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(15),
            Validators.pattern('^[A-Za-z0-9]{8,15}$')
        ],
        asyncValidators: [this.validateNonPropietarioDni()],
        updateOn: 'blur'
      }],
      documentType:['', [Validators.required]],
      email: [''],
      hasVehicle: [false],
      licensePlate: [''],
      vehicleType: [''],
      insurance: ['']
    });
    this.visitorForm.get('documentType')?.valueChanges.subscribe(() => {
      this.visitorForm.get('document')?.updateValueAndValidity();
    });
  }


  validateNonPropietarioDni(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || this.visitorForm?.get('documentType')?.value !== '1') {
        return of(null);
      }
  
      return this.userApi.validateDniNotPropietario(control.value).pipe(
        map(isValid => {
          const error = isValid ? null : { dniAlreadyPropietario: true };
          console.log('Validation result:', error);
          return error;
        }),
        catchError(() => of(null))
      );
    };
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

loadInsurances(): void {
  this.insuranceService.getAll().pipe(
    takeUntil(this.unsubscribe$)
  ).subscribe({
    next: (insurances) => {
      this.insurances = insurances;
    },
    error: (error) => {
      console.error('Error al cargar los seguros:', error)
    }
  })
}

loadUsersType(): void {
  this.visitorHttpService.getUsersType().pipe(
    takeUntil(this.unsubscribe$)
  ).subscribe({
    next: (types: UserType[]) => {
      this.usersType = types;
      console.log('Tipos de usuario cargados:', this.usersType);
    },
    error: (error) => {
      console.error('Error al cargar tipos de usuarios:', error);
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
      neighborLastName: this.user?.lastname,
      neighborName: this.user?.name,
      userType:this.indexUserType
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
ngOnDestroy(): void {
  this.unsubscribe$.next();
  this.unsubscribe$.complete();
}

}
