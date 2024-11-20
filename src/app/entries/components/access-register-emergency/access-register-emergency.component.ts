import { NgClass, NgIf } from '@angular/common';
import { AfterViewChecked, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccessEmergenciesService } from '../../services/access-emergencies/access-emergencies.service';
import { AccessNewEmergencyDto, AccessNewEmergencyPerson } from '../../models/access-emergencies/access-new-emergecy-dto';
import { Subject, Subscription } from 'rxjs';
import { AccessEmergencyPersonDto } from '../../models/access-emergencies/access-emergency-person-dto';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessUserReportService } from '../../services/access_report/access_httpclient/access_usersApi/access-user-report.service';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';

@Component({
  selector: 'access-app-register-emergency',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf, NgSelectModule],
  templateUrl: './access-register-emergency.component.html',
  styleUrl: './access-register-emergency.component.css'
})
export class AccessRegisterEmergencyComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly emergenciesService: AccessEmergenciesService = inject(AccessEmergenciesService);
  private readonly userService: AccessUserReportService = inject(AccessUserReportService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly visitorService: AccessVisitorsRegisterServiceHttpClientService = inject(AccessVisitorsRegisterServiceHttpClientService);

  private readonly subscription = new Subscription();
  private readonly personUpdated = new Subject<void>();
  
  private peopleSubscriptionsArray: Subscription[] = [];
  private personAdded: boolean = false;
  private perfectRegisterSuccess: boolean = false;
  private userId?: number;
  
  ownersOptions: any[] = [];
  vehicleOptions: { value: string, label: string }[] = [];
  vehicleTypeMapping: { [key: string]: string } = {
    'Car': 'Auto',
    'Motorbike': 'Moto',
    'Truck': 'Camión',
    'Van': 'Camioneta'
  };

  form = new FormGroup({
    neighborId: new FormControl(null, [Validators.required]),
    people: new FormArray<FormGroup>([]),
    vehicle: new FormGroup({
      type: new FormControl(),
      plate: new FormControl('')
    }),
    observations: new FormControl()
  });

  ngOnInit(): void {
    const ownersSubscription = this.userService.getPropietariosForSelect().subscribe({
      next: options => this.ownersOptions = options,
      error: error => console.error("Error al cargar propietarios:", error)
    }
    );
    const vehicleTypesSubscription = this.visitorService.getVehicleTypes().subscribe({
      next: vehicleTypes => {
        this.vehicleOptions = vehicleTypes.map(type => ({
          value: type,
          label: this.vehicleTypeMapping[type] || type
        }));
      },
      error: error => console.error("Error al cargar tipos de vehículos:", error)
    })

    this.userId = this.authService.getUser().id;

    this.subscription.add(this.personUpdated);
    this.subscription.add(vehicleTypesSubscription);
    this.subscription.add(ownersSubscription);
    const modal = document.getElementById('emergencyModal');
    modal!.addEventListener('show.bs.modal', event => {
      this.resetForm()
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.personAdded){
      const modalDialog = document.getElementById('emergencyModalBody');
      modalDialog!.scrollTop = modalDialog!.scrollHeight;
      this.personAdded = false;
    }
  }
  registerEntry() {
    const emergency: AccessNewEmergencyDto = this.getFormAsDto();
    const newSubscription = this.emergenciesService.registerEmergencyEntry(emergency).subscribe({
    next: nv => {
      this.resetPeopleControl();
      nv.forEach(v => {
        if (v.state != 'SUCCESSFUL')
          this.perfectRegisterSuccess = false;
        this.addPersonForm(v);
      });
      if (this.perfectRegisterSuccess)
        this.fireSuccess();
    },
    error: e => {
      this.fireError();
    }});

    this.subscription.add(newSubscription);
  }
  
  registerExit() {
    const emergency: AccessNewEmergencyDto = this.getFormAsDto();

    const newSubscription = this.emergenciesService.registerEmergencyExit(emergency).subscribe({
    next: nv => {
      this.resetPeopleControl();
      nv.forEach(v => {
        if (v.state != 'SUCCESSFUL')
          this.perfectRegisterSuccess = false;
        this.addPersonForm(v);
      });
      if (this.perfectRegisterSuccess)
        this.fireSuccess();
    },
    error: e => {
      this.fireError();
    }});

    this.subscription.add(newSubscription);
  }
  private fireSuccess() {
    Swal.fire({
      title: 'Éxito',
      icon: 'success',
      text: 'La emergencia fue registrada.',
    }).finally(() => this.resetForm());
  }
  private fireError() {
    Swal.fire({
      title: 'Error',
      icon: 'error',
      text: 'No se pudo registrar la emergencia. Intente de nuevo.'
    });
  }
  addPersonForm(emergencyPerson?: AccessEmergencyPersonDto) {
    const peopleFormArray = this.form.controls.people;
    const documentTypeControl = new FormControl('DNI', [Validators.required]);
    const documentNumberControl = new FormControl(emergencyPerson?.data.document ?? '', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15),
      Validators.pattern('^[A-Za-z0-9]{8,15}$')]);
    const subscriptions = new Subscription();

    documentNumberControl.addValidators(this.documentUniqueValidator(documentTypeControl));
    const documentTypeSubscription = documentTypeControl.valueChanges.subscribe({
      next: () => {
        this.personUpdated.next();
      }
    });
    const personUpdatedSubscription = this.personUpdated.subscribe({
      next: () => {
        documentNumberControl.updateValueAndValidity();
      }
    });

    subscriptions.add(documentTypeSubscription);
    subscriptions.add(personUpdatedSubscription);

    const personForm = new FormGroup({
      state: new FormControl(this.getStateString(emergencyPerson?.state)),
      documentType: documentTypeControl,
      documentNumber: documentNumberControl,
      name: new FormControl(emergencyPerson?.data.name ?? '', [Validators.required]),
      lastName: new FormControl(emergencyPerson?.data.last_name ?? '',[Validators.required])
    });
    
    this.peopleSubscriptionsArray.push(subscriptions);

    peopleFormArray.push(personForm);
    this.personAdded = true;
  }

  private getStateString(state?: String) {

    let text;
    let alertType = 'alert-danger';
    switch (state) {
      case 'UNAUTHORIZED':
        text = 'El usuario no está autorizado a ingresar. Cuando se registra un ingreso se autoriza al usuario.';
        break;
      case 'WITHOUT_USER':
        text =  'No existe un usuario con el documento provisto. Cuando se registra un ingreso se crea un usuaio.';
        break;
      case 'WITHOUT_EXIT':
        text =  'El usuario posee un ingreso anterior y no se registró un egreso despues de el.';
        break;
      case 'WITHOUT_ENTRY':
        text =  'El usuario no posee un ingreso anterior.';
        break;
      case 'FAILED':
        text =  'Error al registrar esta persona.';
        break;
      case 'SUCCESSFUL':
        if (this.perfectRegisterSuccess)
          return '';
        text = 'Éxito al registrar esta persona.'
        alertType = 'alert-success';
        break;
      case null:
      default:
        return '';
    }    
    const stateHtml = `<div class="alert ${alertType} d-flex align-items-center" role="alert">
                        <div>
                          ${text}
                        </div>
                      </div>`
    return stateHtml;
  }

  private documentUniqueValidator(documentTypeControl: FormControl): ValidatorFn {
    return (documentNumberControl: AbstractControl): ValidationErrors | null => {
      const peopleControlsArray = this.form.controls.people.controls;
      const peopleSameDocument = peopleControlsArray.filter(
        p => p.controls['documentType'].value == documentTypeControl.value && p.controls['documentNumber'].value == documentNumberControl.value);
      if (peopleSameDocument.length <= 1)
        return null;
      else 
        return {
          'unique': true
      };
    } 
  }

  resetPeopleControl() {
    this.perfectRegisterSuccess = true;
    this.form.controls.people.clear();
    this.peopleSubscriptionsArray.forEach(s => s.unsubscribe());
    this.peopleSubscriptionsArray = [];
  }

  resetForm() {
    this.form.reset();
    this.form.controls.vehicle.controls.type.setValue('');
    this.resetPeopleControl();
    this.addPersonForm();
  }
  
  removePersonForm(index: number) {
    this.form.controls.people.removeAt(index);
    const subscriptions = this.peopleSubscriptionsArray.splice(index, 1);
    subscriptions[0].unsubscribe();
    this.personUpdated.next();
  }

  onPlateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.form.controls.vehicle.patchValue({ plate: input.value });
  }

  vehicleTypeChanged() {
    const plateControl = this.form.controls.vehicle.controls.plate;
    const platePattern = /(^[A-Z]{2}\d{3}[A-Z]{2}$)|(^[A-Z]{3}\d{3,4}$)|(^[A-Z]{3}\d{4}$)/;

    if (this.form.value.vehicle?.type != '') {
      setTimeout(() => {
        plateControl.setValidators([
          Validators.required, 
          Validators.pattern(platePattern), 
          Validators.maxLength(7)]);
        plateControl.updateValueAndValidity();
      }, 1);
    }
    else {
      setTimeout(() => {
        plateControl.setValidators([]);
        plateControl.updateValueAndValidity();
      }, 1);
    }
  }

  getFormAsDto(): AccessNewEmergencyDto {
    const formValue = this.form.value;

    const emergencyDto: AccessNewEmergencyDto = {
      people: formValue.people?.map<AccessNewEmergencyPerson>(v => {
        return {
          name: v.name,
          lastName: v.lastName,
          document: {
            number: v.documentNumber,
            type: {
              description: v.documentType
            }
          }
        }
      }) ?? [],
      vehicle: {
        vehicle_Type: {
          description: formValue.vehicle?.type ?? null
        },
        plate: formValue.vehicle?.plate ?? null
      },
      observations: formValue.observations,
      loggedUserId: this.userId ?? 0,
      neighborId: formValue.neighborId ?? 0
    };
    return emergencyDto;
  }
}