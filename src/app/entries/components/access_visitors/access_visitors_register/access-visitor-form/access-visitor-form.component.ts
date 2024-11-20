import { CommonModule } from '@angular/common';
import { Component, input, model, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserType } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { AccessUserReportService } from '../../../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessInsurancesService } from '../../../../services/access-insurances/access-insurances.service';
import { AuthService } from '../../../../../users/users-servicies/auth.service';

@Component({
  selector: 'app-access-visitor-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './access-visitor-form.component.html',
  styleUrl: './access-visitor-form.component.scss'
})
export class AccessVisitorFormComponent implements OnInit, OnDestroy {
  userId: number;

  value = model<FormGroup<any>>();
  vehicleActivated = input<boolean>(true);
  emailActivated = input<boolean>(true);
  documentRequired = input<boolean>(true);

  indexUserType?: number;
  subscriptions = new Subscription();
  
  patentePattern = /(^[A-Z]{2}\d{3}[A-Z]{2}$)|(^[A-Z]{3}\d{3,4}$)|(^[A-Z]{3}\d{4}$)/;
  vehicleType: string[] = [];
  vehicleTypes: string[] = ['Car', 'Motorbike', 'Truck', 'Van'];
  insurances: string[] = [];
  usersType: UserType[] = [];
  vehicleOptions: { value: string, label: string }[] = [];
  translatedVehicleTypes: string[] = [];

  vehicleTypeMapping: { [key: string]: string } = {
    'Car': 'Auto',
    'Motorbike': 'Moto',
    'Truck': 'Camión',
    'Van': 'Camioneta'
  };

  constructor(
    private visitorService: AccessVisitorsRegisterServiceService, 
    private fb: FormBuilder,
    private userApi: AccessUserReportService,    
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
    private insuranceService: AccessInsurancesService,
    private authService: AuthService ) {
    this.vehicleOptions = this.vehicleTypes.map(type => ({
      value: type,
      label: this.vehicleTypeMapping[type] || type
    }));
    this.translatedVehicleTypes = this.vehicleTypes.map(type => this.vehicleTypeMapping[type] || type);
    this.userId = authService.getUser().id;
  }

  ngOnInit(): void {
    this.initForm();
    this.listenToHasVehicleChanges();
    this.loadVehicleTypes();
    this.loadInsurances();
    this.loadUsersType();

    const documentTypeSubscription = this.value()?.get('documentType')?.valueChanges.subscribe(() => {
      this.value()?.get('document')?.updateValueAndValidity();
    });
    this.subscriptions.add(documentTypeSubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadVehicleTypes(): void {
    this.visitorHttpService.getVehicleTypes().subscribe({
      next: (types) => {
        this.vehicleType = types;
      },
      error: (error) => {
        console.error('Error al cargar tipos de vehículos:', error);
      }
    });
  }

  loadInsurances(): void {
    const insuranceSubscription = this.insuranceService.getAll().subscribe({
      next: (insurances) => {
        this.insurances = insurances;
      },
      error: (error) => {
        console.error('Error al cargar los seguros:', error)
      }
    });
    this.subscriptions.add(insuranceSubscription);
  }

  loadUsersType(): void {
    const insuranceSubscription = this.visitorHttpService.getUsersType().subscribe({
      next: (types: UserType[]) => {
        this.usersType = types;
        console.log('Tipos de usuario cargados:', this.usersType);
      },
      error: (error) => {
        console.error('Error al cargar tipos de usuarios:', error);
      }
    });
    this.subscriptions.add(insuranceSubscription);
  }

  initForm(): void {
    this.value.update(() => this.fb.group({
      authorizedType: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(45)]],
      lastName: ['', [Validators.required, Validators.maxLength(45)]],
      document: ['', {
        validators: [
          this.validateDocumentRequired(),
          this.validateDocumentFormat()
        ],
        asyncValidators: [this.validateNonPropietarioDni()],
        updateOn: 'blur'
      }],
      documentType: ['', [Validators.required]],
      email: [''],
      hasVehicle: [false],
      licensePlate: [''],
      vehicleType: [''],
      insurance: [''],
    }));
    const documentTypeControl = this.value()?.get('documentType');
    const documentControl = this.value()?.get('document');
    documentTypeControl?.valueChanges.subscribe(() => {
      documentControl?.updateValueAndValidity();
    });
  }

  validateDocumentRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.documentRequired())
        return null;
      return Validators.required(control);
    }
  }

  validateDocumentFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const documentType = this.value()?.get('documentType')?.value;
      const documentValue = control.value;
      if (documentType === '1') {
        const dniPattern = /^\d{7,8}$/;
        if (!dniPattern.test(documentValue)) {
          return { invalidDniFormat: true };
        }
      }
      if (documentType === '2') {
        const passportPattern = /^[A-Z0-9]{6,9}$/;
        if (!passportPattern.test(documentValue)) {
          return { invalidPassportFormat: true };
        }
      }
      if (documentType === '3') {
        const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
        if (!cuitPattern.test(documentValue)) {
          return { invalidCuitFormat: true };
        }
        const cuitSinGuiones = documentValue.replace(/[-]/g, '');
        if (cuitSinGuiones.length !== 11) {
          return { invalidCuitLength: true };
        }
      }
      return null;
    };
  }

  validateNonPropietarioDni(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || this.value()?.get('documentType')?.value !== '1') {
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

  onAuthorizedTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue !== "") {
      this.indexUserType = parseInt(selectedValue, 10);
      console.log(this.indexUserType);

      // Obtén la referencia al control `email`
      const emailControl = this.value()?.get('email');

      // Aplica la validación de `required` solo si `indexUserType` es `1`
      if (this.emailActivated() && this.indexUserType === 1) {
        emailControl?.setValidators([Validators.required, Validators.email, Validators.maxLength(70)]);
      } else {
        // Elimina la validación de `required` si `indexUserType` no es `1`
        emailControl?.setValidators([Validators.email, Validators.maxLength(70)]);
      }
      // Actualiza el estado de validación del control
      emailControl?.updateValueAndValidity();
    }
  }

  onDocumentInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const documentType = this.value()?.get('documentType')?.value;

    if (documentType === '3') {  
      let value = input.value.replace(/[^\d]/g, '');

      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      if (value.length >= 2) {
        value = value.slice(0, 2) + '-' + value.slice(2);
      }

      if (value.length >= 11) {
        value = value.slice(0, 11) + '-' + value.slice(11);
      }

      input.value = value;
    } else if (documentType === '2') {
      input.value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    } else {
      input.value = input.value.replace(/[^0-9]/g, '');
    }
    this.value()?.patchValue({ document: input.value });
  }

  onLicensePlateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.value()?.patchValue({ licensePlate: input.value });
  }

  listenToHasVehicleChanges(): void {
    const hasVehicleControl = this.value()?.get('hasVehicle');
    if (!hasVehicleControl) 
      return;

    const vehicleChangesSubscription = hasVehicleControl.valueChanges.subscribe((hasVehicle: boolean) => {
      const licensePlateControl = this.value()?.get('licensePlate');
      const vehicleTypeControl = this.value()?.get('vehicleType');
      const insuranceControl = this.value()?.get('insurance');

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

    this.subscriptions.add(vehicleChangesSubscription)
  }
}
