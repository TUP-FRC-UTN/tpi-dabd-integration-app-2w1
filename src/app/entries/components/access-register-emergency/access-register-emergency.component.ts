import { NgClass } from '@angular/common';
import { AfterViewChecked, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccessEmergenciesService } from '../../services/access-emergencies/access-emergencies.service';
import { AccessNewEmergencyDto, AccessNewEmergencyPerson } from '../../models/access-emergencies/access-new-emergecy-dto';
import { Subject, Subscription } from 'rxjs';
import { AccessEmergencyPersonDto } from '../../models/access-emergencies/access-emergency-person-dto';

@Component({
  selector: 'access-app-register-emergency',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './access-register-emergency.component.html',
  styleUrl: './access-register-emergency.component.css'
})
export class AccessRegisterEmergencyComponent implements OnInit, OnDestroy, AfterViewChecked{
  private readonly emergenciesService: AccessEmergenciesService = inject(AccessEmergenciesService);
  private readonly subscription = new Subscription();
  private readonly personUpdated = new Subject<void>();
  
  private peopleSubscriptionsArray: Subscription[] = [];
  private personAdded: boolean = false;

  form = new FormGroup({
    onlyExit: new FormControl(false),
    people: new FormArray<FormGroup>([]),
    vehicle: new FormGroup({
      type: new FormControl(),
      plate: new FormControl('')
    }),
    observations: new FormControl()
  });
  requestStatus: RequestStatus = RequestStatus.None;

  public get RequestStatus(): typeof RequestStatus {
    return RequestStatus;
  }

  ngOnInit(): void {
    this.subscription.add(this.personUpdated);
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
    this.requestStatus = RequestStatus.Loading;
    const emergency: AccessNewEmergencyDto = this.getFormAsDto();
    const newSubscription = this.emergenciesService.registerEmergencyEntry(emergency).subscribe({
    next: nv => {
      this.requestStatus = RequestStatus.Success;
      this.resetPeopleControl();
      nv.forEach(v => {
        this.addPersonForm(v);
      })
    },
    error: e => {
      this.requestStatus = RequestStatus.Error;
    }});

    this.subscription.add(newSubscription);
  }
  
  registerExit() {
    this.requestStatus = RequestStatus.Loading;
    const emergency: AccessNewEmergencyDto = this.getFormAsDto();

    const newSubscription = this.emergenciesService.registerEmergencyExit(emergency).subscribe({
    next: nv => {
      this.requestStatus = RequestStatus.Success;
      this.resetPeopleControl();
      nv.forEach(v => {
        this.addPersonForm(v);
      })
    },
    error: e => {
      this.requestStatus = RequestStatus.Error;
    }});

    this.subscription.add(newSubscription);
  }
  
  addPersonForm(emergencyPerson?: AccessEmergencyPersonDto) {
    const peopleFormArray = this.form.controls.people;
    const documentTypeControl = new FormControl('DNI', [Validators.required]);
    const documentNumberControl = new FormControl(emergencyPerson?.data.document ?? '', [Validators.required]);
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
      name: new FormControl(emergencyPerson?.data.name ?? ''),
      lastName: new FormControl(emergencyPerson?.data.last_name ?? '')
    });

    if (this.form.controls.onlyExit) {
      personForm.controls.name.setValidators([]);
      personForm.controls.lastName.setValidators([]);
    }

    const onlyExitUpdated = this.form.controls.onlyExit.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          personForm.controls.name.setValidators([]);
          personForm.controls.lastName.setValidators([]);
          personForm.controls.name.updateValueAndValidity();
          personForm.controls.lastName.updateValueAndValidity();
        }
        else {
          personForm.controls.name.setValidators([Validators.required]);
          personForm.controls.lastName.setValidators([Validators.required]);
        }
      },
    });

    subscriptions.add(onlyExitUpdated);
    this.peopleSubscriptionsArray.push(subscriptions);

    peopleFormArray.push(personForm);
    this.personAdded = true;
  }

  private getStateString(state?: String) {
    switch (state) {
      case 'UNAUTHORIZED':
        return 'El usuario no está autorizado a ingresar. Cuando se registra un ingreso se autoriza al usuario.';
      case 'WITHOUT_USER':
        return 'No existe un usuario con el documento provisto. Cuando se registra un ingreso se crea un usuaio.';
      case 'WITHOUT_EXIT':
        return 'El usuario posee un ingreso anterior y no se registró un egreso despues de el.';
      case 'WITHOUT_ENTRY':
        return 'El usuario no posee un ingreso anterior.';
      case 'FAILED':
        return 'Error al registrar esta persona.';
      case null:
      case 'SUCCESSFUL':
      default:
        return '';
    }
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
    this.form.controls.people.clear();
    this.peopleSubscriptionsArray.forEach(s => s.unsubscribe());
    this.peopleSubscriptionsArray = [];
  }

  resetForm() {
    this.requestStatus = RequestStatus.None;
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

  vehicleTypeChanged() {
    const plateControl = this.form.controls.vehicle.controls.plate;
    if (this.form.value.vehicle?.type != '') {
      setTimeout(() => {
        plateControl.setValidators([Validators.required]);
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
      observations: formValue.observations
    };
    return emergencyDto;
  }
}

enum RequestStatus {
  None,
  Loading,
  Error,
  Success
}