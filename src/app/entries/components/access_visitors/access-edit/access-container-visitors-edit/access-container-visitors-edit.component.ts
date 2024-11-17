import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessVisitor, AccessVisitorRecord, AccessAuthRange, AccessVehicle,AccessUser, AccessNewVehicleDto, AccessUserAllowedInfoDto } from '../../../../models/access-visitors/access-visitors-models';
import { ReactiveFormsModule } from '@angular/forms';
import { AccessTimeRangeVisitorsEditComponent } from '../access-time-range-visitors-edit/access-time-range-visitors-edit.component';
import { AccessGridVisitorsEditComponent } from '../access-grid-visitors-edit/access-grid-visitors-edit.component';
import Swal from 'sweetalert2';
import { AccessVisitorsEditServiceService } from '../../../../services/access_visitors/access-visitors-edit/access-visitors-edit-service/access-visitors-edit-service.service';
import { AccessVisitorsEditServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-edit/access-visitors-edit-service-http-service/access-visitors-edit-service-http-client.service';
import { AccessAuthRangeInfoDto2, AccessNewVehicleDto2, AccessUserAllowedInfoDto2, Owner } from '../../../../models/access-visitors/access-VisitorsModels';
@Component({
  selector: 'app-access-container-visitors-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccessTimeRangeVisitorsEditComponent,
    AccessGridVisitorsEditComponent
  ],
  templateUrl: './access-container-visitors-edit.component.html',
  styleUrl: './access-container-visitors-edit.component.css'
})
export class AccessContainerVisitorsEditComponent implements OnInit, OnDestroy {
  visitorForm!: FormGroup; 
  vehicleType: string[] = [];
  @Output() visitorSaved = new EventEmitter<void>();
  patentePattern = '^[A-Z]{1,3}\\d{3}[A-Z]{0,3}$';
  private unsubscribe$ = new Subject<void>();
  visitorToUpdate?:AccessUserAllowedInfoDto2;
  Owners: Owner[] = [];

  neighborid: number = 0;
  authId: number = 0;
  visitorId: number | null = null;
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
    private visitorService: AccessVisitorsEditServiceService,
    private visitorHttpService: AccessVisitorsEditServiceHttpClientService,
  ) { 
    this.vehicleOptions = this.vehicleTypes.map(type => ({
      value: type,
      label: this.vehicleTypeMapping[type] || type
    }));
    this.translatedVehicleTypes = this.vehicleTypes.map(type => this.vehicleTypeMapping[type] || type);
  }
  @ViewChild(AccessTimeRangeVisitorsEditComponent) 
  timeRangeComponent?: AccessTimeRangeVisitorsEditComponent;

  ngOnInit(): void {
    this.initForm();
    this.loadVehicleTypes();
    this.listenToHasVehicleChanges();
    this.initVisitorRecord();
    
  }
  private resetEverything(): void {
    this.resetForm();
    
    this.visitorService.resetAllData();
  }
  
  initVisitorRecord(): void {
    combineLatest([
      this.visitorService.getVisitorsTemporalsSubject(),
      this.visitorService.getAuthRange()
    ]).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(([visitors, authRange]) => {
    //  this.updateVisitorRecord(visitors, authRange);
    });
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

        const vehicle: AccessNewVehicleDto2 =  {
            id: visitantData.vehicle.id,
            plate: visitantData.licensePlate,
            vehicle_Type: {
              description: visitantData.vehicleType 
            },
            insurance: visitantData.insurance,
        } ;

        const visitor: AccessUserAllowedInfoDto2 = {
            name: visitantData.firstName,
            last_name: visitantData.lastName,
            document: visitantData.document,
            email: visitantData.email,
            documentType: visitantData.documentType || undefined,
            vehicle: vehicle,
            authId: visitantData.authId || '0',
            authRange: {
              neighbor_id: visitantData.authRange.id,
              init_date: new Date(),
              end_date: new Date(),
              allowedDays: [],
            }, 
            visitorId: 0
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
setFormData(visit: AccessUserAllowedInfoDto2): void {
  setTimeout(() => {
    console.log('Visitante a editar:', visit);

    this.visitorForm.patchValue({
      firstName: visit.name,
      lastName: visit.last_name,
      document: visit.document,
      documentType: visit.documentType,
      email: visit.email,
      hasVehicle: !!visit.vehicle,
      vehicle: visit.vehicle,
      licensePlate: visit.vehicle?.plate,
      vehicleType: visit.vehicle?.vehicle_Type.description,
      insurance: visit.vehicle?.insurance 
    });
    this.neighborid = visit.authRange.neighbor_id;
    this.authId = parseInt(visit.authId);
    this.visitorId = visit.visitorId;

    if (this.timeRangeComponent && visit.authRange) {

      const initDate = new Date(visit.authRange.init_date);
      const endDate = new Date(visit.authRange.end_date);
      
      const formattedInitDate = initDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      this.timeRangeComponent.form.get('startDate')?.enable();
      this.timeRangeComponent.form.get('endDate')?.enable();
      

      this.timeRangeComponent.form.patchValue({
        startDate: formattedInitDate,
        endDate: formattedEndDate
      });


      if (visit.authRange.allowedDays) {
        this.visitorService.clearAllowedDays();
        this.visitorService.addAllowedDays(visit.authRange.allowedDays);
      }
      
    }
  }, 0);
}
updateVisitor(visit: AccessUserAllowedInfoDto2): void {
  this.visitorSaved.emit();
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
updateVisitorRecord(): void {
  if (this.visitorForm.valid && this.timeRangeComponent) {
    const formData = this.visitorForm.value; // Obtener los datos del formulario
    const timeRangeData = this.timeRangeComponent.form.value; // Obtener los datos del componente hijo
    const allowedDays = this.visitorService.getAllowedDays(); // Obtener los días permitidos

    // Crear el objeto vehicle solo si hasVehicle es true
    let vehicle: AccessNewVehicleDto2 | null = null;
    if (formData.hasVehicle) {
      vehicle = {
        id: formData.vehicle?.id || 0,
        plate: formData.licensePlate,
        vehicle_Type: {
          description: formData.vehicleType
        },
        insurance: formData.insurance
      };
    }

    this.visitorService.getAuthRange().subscribe((authRangeInfo) => {
      console.log("id del visitante",this.visitorId)
      if (authRangeInfo) {
        this.visitorToUpdate = {
          name: formData.firstName,
          last_name: formData.lastName,
          document: formData.document,
          documentType: formData.documentType,
          email: formData.email,
          authId: this.authId.toString(),
          authRange: authRangeInfo, 
          vehicle: vehicle,
          visitorId: this.visitorId
        };
      } else {
        console.error("Error: authRangeInfo es null");
      }
    });

    // Actualizar la lista de visitantes con los nuevos datos
    
  }
}
sendVisitorRecord(): void {
  this.updateVisitorRecord();
  if (this.visitorToUpdate) {
    // Validate that we have at least one visitor
    if (!this.visitorToUpdate) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede enviar el registro: no hay visitante para actualizar.',
      });
      return;
    }

    // Validate auth range and allowed days
    if (!this.visitorToUpdate.authRange || !this.visitorToUpdate.authRange.allowedDays || 
        this.visitorToUpdate.authRange.allowedDays.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede enviar el registro: ingrese un rango de fechas con al menos un día permitido.',
      });
      return;
    }

    // Send update request to the service
    this.visitorHttpService.PutVisitor(this.visitorToUpdate).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Visitante actualizado correctamente.',
        });
        this.resetEverything();
        this.visitorSaved.emit();
      },
      error: (error) => {
        console.error('Error updating visitor record', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al actualizar el visitante. Por favor, intente nuevamente.',
        });
      }
    });
  }
}
}