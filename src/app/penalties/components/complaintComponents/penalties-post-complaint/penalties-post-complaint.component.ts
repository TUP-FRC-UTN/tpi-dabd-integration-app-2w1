import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../../services/complaints.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RoutingService } from '../../../../common/services/routing.service';
import { ReportReasonDto } from '../../../models/ReportReasonDTO';
import { CustomSelectComponent } from "../../../../common/components/custom-select/custom-select.component";
import { AuthService } from '../../../../users/users-servicies/auth.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';

@Component({
  selector: 'app-penalties-post-complaint',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule, CustomSelectComponent],
  templateUrl: './penalties-post-complaint.component.html',
  styleUrl: './penalties-post-complaint.component.scss'
})
export class PenaltiesPostComplaintComponent implements OnInit {
  //Variables
  complaintTypes: string[] = [];
  reactiveForm: FormGroup;
  files: File[] = [];
  otroSelected: boolean = false;
  options: { name: string, value: any }[] = []

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  //Constructor
  constructor(
    private complaintService: ComplaintService,
    private formBuilder: FormBuilder,
    private routingService: RoutingService,
    private authService: AuthService,
    private tutorialService: TutorialService
  ) {
    this.reactiveForm = this.formBuilder.group({  //Usen las validaciones que necesiten, todo lo de aca esta puesto a modo de ejemplo
      complaintReason: new FormControl([], [Validators.required]),
      anotherReason: new FormControl(''),
      descriptionControl: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]),
      fileControl: new FormControl(null),
    });
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
        canClickTarget: false,
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      keyboardNavigation: false,
      
      useModalOverlay: true,
    });
  }

  //Init
  ngOnInit(): void {
    this.getTypes();

    // Escuchar cambios en 'complaintReason' para activar o desactivar la validación
    this.reactiveForm.get('complaintReason')?.valueChanges.subscribe(value => {
      const anotherReasonControl = this.reactiveForm.get('anotherReason');

      if (value === 'Otro') {
        anotherReasonControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(48)]);
      } else {
        anotherReasonControl?.clearValidators();
      }

      // Actualizar el estado de validación de 'anotherReason'
      anotherReasonControl?.updateValueAndValidity();
    });

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  startTutorial() {
    if (this.tour) {
      this.tour.complete();
    }

    // CÓDIGO PARA PREVENIR SCROLLEO DURANTE TUTORIAL
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const restoreScroll = () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };

    // Al empezar, lo desactiva
    this.tour.on('start', () => {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
    });

    // Al completar lo reactiva, al igual que al cancelar
    this.tour.on('complete', restoreScroll);
    this.tour.on('cancel', restoreScroll);
    
    this.tour.addStep({
      id: 'reason-step',
      title: 'Motivo de la denuncia',
      text: 'En este campo debe seleccionar el motivo de la denuncia. En caso de no encontrar lo que busca, puede seleccionar "Otro" para escribir el motivo personalizado.',
      attachTo: {
        element: '#reasonInput',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });

    this.tour.addStep({
      id: 'description-step',
      title: 'Descripción de la denuncia',
      text: 'En este campo escriba el contenido detallado de la denuncia que quiera enviar.',
      attachTo: {
        element: '#descriptionInput',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
      
    });

    this.tour.addStep({
      id: 'fileInput-step',
      title: 'Agregar pruebas',
      text: 'Haciendo click en este botón puede agregar pruebas para la denuncia.',
      attachTo: {
        element: '#fileInput',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Finalizar',
          action: this.tour.complete
        }
      ]
    });
    this.tour.start();
  }

  updateSelect(data: any) {
    this.reactiveForm.get('complaintReason')?.setValue(data)
  }


  //Submit del form
  onSubmit(): void {
    if (this.reactiveForm.valid) {
      let formData = this.reactiveForm.value;
      let data = {
        userId: 1,
        complaintReason: formData.complaintReason,
        anotherReason: formData.anotherReason,
        description: formData.descriptionControl,
        pictures: this.files
      };

      this.complaintService.add(data).subscribe(res => {
        Swal.fire({
          title: '¡Denuncia enviada!',
          text: 'La denuncia ha sido enviada correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        if (this.getPermisionsToSeeList()) {
          this.routingService.redirect("main/complaints/list-complaint", "Listado de Denuncias")
        }
        else {
          this.routingService.redirect("/main/home", "Página Principal")
        }
      }, error => {
        console.error('Error al enviar la denuncia', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo enviar la denuncia. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      })
    };
  }

  //Retorna al listado a pagina principal
  cancel() {
    if (this.getPermisionsToSeeList()) {
      this.routingService.redirect("main/complaints/list-complaint", "Listado de Denuncias")
    }
    else {
      this.routingService.redirect("/main/home", "Página Principal")
    }

  }


  //Aplica estilos a los inputs dependiendo su estado de validacion
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }


  //Retorna un string con el mensaje de error correspondiente
  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);

    if (control?.errors && control.invalid && (control.dirty || control.touched)) {
      const errorKey = Object.keys(control.errors)[0];
      return this.getErrorMessage(errorKey, control.errors[errorKey]);
    }
    return '';
  }


  //Busca el mensaje de error correspondiente
  private getErrorMessage(errorKey: string, errorValue: any): string {
    const errorMessages: { [key: string]: (error: any) => string } = {
      required: () => 'Este campo no puede estar vacío.',
      email: () => 'Formato de correo electrónico inválido.',
      minlength: (error) => `El valor ingresado es demasiado corto. Mínimo ${error.requiredLength} caracteres.`,
      maxlength: (error) => `El valor ingresado es demasiado largo. Máximo ${error.requiredLength} caracteres.`,
      pattern: () => 'El formato ingresado no es válido.',
      min: (error) => `El valor es menor que el mínimo permitido (${error.min}).`,
      max: (error) => `El valor es mayor que el máximo permitido (${error.max}).`,
      requiredTrue: () => 'Debe aceptar el campo requerido para continuar.',
      date: () => 'La fecha ingresada es inválida.',
      url: () => 'El formato de URL ingresado no es válido.',
      number: () => 'Este campo solo acepta números.',
      customError: () => 'Error personalizado: verifique el dato ingresado.'
    };

    return errorMessages[errorKey]?.(errorValue) ?? 'Error no identificado en el campo.';
  }


  //Trae los tipos de la base de datos
  getTypes(): void {
    this.complaintService.getAllReportReasons().subscribe(
      (reasons: ReportReasonDto[]) => {
        reasons.push({
          id: 0,
          reportReason: "Otro",
          baseAmount: 0
        })
        reasons.forEach((reason) => this.complaintTypes.push(reason.reportReason))

        this.options = this.complaintTypes.map(opt => ({ name: opt, value: opt }))
      },
      (error) => {
        console.error('error: ', error);
      }
    )
  }


  onFileChange(event: any) {
    this.files = Array.from(FileList = event.target.files); //Convertir FileList a Array
  }


  permisionToEdit: boolean = false
  getPermisionsToSeeList() {
    console.log(this.authService.getActualRole());

    if (this.authService.getActualRole() === 'SuperAdmin' ||
      this.authService.getActualRole() === 'Gerente multas') {
      this.permisionToEdit = true
    }
    return this.permisionToEdit;
  }

}
