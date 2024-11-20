import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder, FormsModule, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { map, Observable, of, Subject, takeUntil } from 'rxjs';
import { accessTempRegist, AccessUser, AccessVisitor3, UserType } from '../../../models/access-visitors/access-visitors-models';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessUserReportService } from '../../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import { AccessInsurancesService } from '../../../services/access-insurances/access-insurances.service';
declare var bootstrap: any; 

@Component({
  selector: 'app-acceses-visitors-temp',
  standalone: true,
  imports: [ ReactiveFormsModule,CommonModule,NgSelectModule,FormsModule],
  templateUrl: './acceses-visitors-temp.component.html',
  styleUrl: './acceses-visitors-temp.component.css'
})
export class AccesesVisitorsTempComponent implements OnInit {
  indexUserType?:number;
  propietariosOptions: any[] = [];
  user?: AccessUser;
  handleSelectedUser(user: AccessUser): void {
    this.user = user; 
    console.log('Selected user:', this.user);
  }
  private userId?: number;
  SelectedNeighborhood: { id: number; label: string } = { id: 0, label: '' };
  visitorForm!: FormGroup; 
  vehicleType: string[] = [];
  insurances: string[] = [];
  patentePattern = '^[A-Z]{1,3}\\d{3}[A-Z]{0,3}$';
  private unsubscribe$ = new Subject<void>();
  vehicleTypes: string[] = ['Car', 'Motorbike', 'Truck', 'Van']; 
  usersType:UserType[]=[];
  private loadSelectOptions(): void {
    this.userService.getPropietariosForSelect().subscribe(
      options => this.propietariosOptions = options
    );
  }
  private loadInsurances(): void {
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
    private userService: AccessUserReportService,
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
    private authService: AuthService,
    private userApi: AccessUserReportService,
    private insuranceService: AccessInsurancesService
  ) { 
    // Inicializa las opciones de vehículos con su traducción
    this.vehicleOptions = this.vehicleTypes.map(type => ({
      value: type,
      label: this.vehicleTypeMapping[type] || type
    }));
    this.translatedVehicleTypes = this.vehicleTypes.map(type => this.vehicleTypeMapping[type] || type);
}
onPropietarioChange(selected: any) {
  if (selected) {
    this.SelectedNeighborhood = {
      id: selected.id,
      label: selected.label
    };
  }

}
ngOnInit(): void {
    this.initForm();
    this.loadVehicleTypes();
    this.loadInsurances();
    this.listenToHasVehicleChanges();
    this.loadUsersType(); 
    const modal = document.getElementById('visitorModal');
    modal!.addEventListener('show.bs.modal', event => {
      this.resetForm()
    });
    this.loadSelectOptions();
    this.userId = this.authService.getUser().id;
}

resetForm() {
  this.visitorForm.reset();

}
ngOnDestroy(): void {
    // Limpieza de subscripciones
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
}

private switchModals(): void {
  // Close the current visitor modal
  const currentModal = bootstrap.Modal.getInstance(document.getElementById('visitorModal'));
  currentModal.hide();

  // Open the visitor list modal
  const listModal = new bootstrap.Modal(document.getElementById('visitorListModal'));
  listModal.show();
}
initForm(): void {
  this.visitorForm = this.fb.group({
      authorizedType: ['', Validators.required],
      propietario: [null, Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(45)]],
      lastName: ['', [Validators.required, Validators.maxLength(45)]],
      document: ['', {
        validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(15),
            Validators.pattern('^[A-Za-z0-9]{8,15}$')
        ],
        asyncValidators: [(control: AbstractControl): Observable<ValidationErrors | null> => {
         
          if (this.visitorForm?.get('documentType')?.value === '1') {
            return this.userApi.validateDniNotPropietario(control.value).pipe(
              map(isValid => isValid ? null : { dniAlreadyPropietario: true })
            );
          }
          return of(null);
        }],
        updateOn: 'blur'
      }],
      documentType:['', [Validators.required]],
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
    if (!control.value) {
      return new Observable(observer => observer.next(null));
    }
    console.log('Validando DNI no propietario:', control.value);
    return this.userApi.validateDniNotPropietario(control.value).pipe(
      map(isValid => isValid ? null : { dniAlreadyPropietario: true })
    );
  };
}


// Carga tipos de vehículos del servicio
loadVehicleTypes(): void {
  this.visitorHttpService.getVehicleTypes()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
          next: (types) => this.vehicleType = types,
          error: (error) => console.error('Error al cargar tipos de vehículos:', error)
      });
}

// Carga tipos de usuarios del servicio
loadUsersType(): void {
  this.visitorHttpService.getUsersType()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
          next: (types: UserType[]) => this.usersType = types,
          error: (error) => console.error('Error al cargar tipos de usuarios:', error)
      });
}
  // Maneja cambios en el checkbox de vehículo
listenToHasVehicleChanges(): void {
  const hasVehicleControl = this.visitorForm.get('hasVehicle');
  if (hasVehicleControl) {
      hasVehicleControl.valueChanges
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((hasVehicle: boolean) => {
              // Ajusta validaciones según si tiene vehículo o no
              const controls = ['licensePlate', 'vehicleType', 'insurance'];
              controls.forEach(control => {
                  const ctrl = this.visitorForm.get(control);
                  if (ctrl) {
                      hasVehicle ? ctrl.setValidators([Validators.required]) : ctrl.clearValidators();
                      ctrl.updateValueAndValidity();
                  }
              });
          });
  }
}

// Convierte input de patente a mayúsculas
onLicensePlateInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  input.value = input.value.toUpperCase();
  this.visitorForm.patchValue({ licensePlate: input.value });
}

onDocumentInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.visitorForm.patchValue({ document: input.value });
}

// Actualiza el tipo de usuario autorizado
onAuthorizedTypeChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;
  if (selectedValue !== "") {
    this.indexUserType = parseInt(selectedValue, 10);
    console.log(this.indexUserType);

  }
}

sendVisitor(): void {
  console.log('Formulario de visitante:', this.visitorForm.value);

    const formData = this.visitorForm.value;
    
    // Create the base visitor object
    const visitorData: AccessVisitor3 = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      document: formData.document,
      documentType: parseInt(formData.documentType),
      userType: this.indexUserType
    };

    // Add vehicle data if hasVehicle is true and all vehicle fields are filled
    if (formData.hasVehicle && formData.licensePlate && formData.vehicleType && formData.insurance) {
      visitorData.vehicle = {
        plate: formData.licensePlate,
        vehicle_Type: {
          description: formData.vehicleType // Assuming vehicleType is the description string
        },
        insurance: formData.insurance
      };
    }else{
      visitorData.vehicle = null;
    }
    const accessTempRegistData: accessTempRegist = {
      visitor: visitorData,
      guard_Id: this.userId || 0, 
      neighbor_Id: this.SelectedNeighborhood.id
    };
    this.visitorHttpService.giveTempRange(accessTempRegistData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'Se autorizó el visitante Correctamente',   
      }).then(() => {

        this.switchModals();
      });
      },
      error: (error) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se puede enviar el registro.',
          });
          console.error('Error sending visitor record', error);
      }
  });
  }
}