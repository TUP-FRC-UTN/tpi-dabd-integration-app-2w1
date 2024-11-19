import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgModel, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { EmpPostConfiguration } from '../../Models/emp-post-configuration';
import { PillowTimeLateArrivalService } from '../../services/pillow-time-late-arrival.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-iep-pillow-later-arrival-config',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './iep-pillow-later-arrival-config.component.html',
  styleUrl: './iep-pillow-later-arrival-config.component.css'
})
export class IepPillowLaterArrivalConfigComponent implements OnInit{

  configForm: FormGroup= new FormGroup({});
  configTimeJustify : FormGroup = new FormGroup({});
  savedMinutesValue : number|null=null
  savedDaysValue: number | null = null;
  successMessage: string='';

  constructor(
    private fb: FormBuilder,
    private pillowTimeLateArrivalService: PillowTimeLateArrivalService
  )
  {
    this.initForm();
  }

  ngOnInit(): void {

    this.loadSavedConfig();
    
  }

   goBack(){
    window.history.back();
   }


  private initForm(): void {
    this.configForm = this.fb.group({
      minutes: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(60),
      ]],
      days: ['', [
        Validators.required,
         Validators.min(0), 
         Validators.max(30),
         ]]

     
    });


    // Suscribirse a cambios del formulario para limpiar mensajes
    this.configForm.valueChanges.subscribe(() => {
    });
  }

  private loadSavedConfig(): void {

    this.pillowTimeLateArrivalService.actualConfig().subscribe({ 


      next: (x:EmpPostConfiguration) => {
 console.log("ENtrooo")
        this.savedMinutesValue = x.pillowLastArrival
        this.savedDaysValue = x.pillowJustify
        console.log(this.savedDaysValue)
        this.configForm.get('minutes')?.setValue(this.savedMinutesValue);
        console.log(  this.configForm.get('minutes')?.value)
        this.configForm.get('days')?.setValue(this.savedDaysValue?.toString());
        console.log(this.configForm.get('days')?.value)
      },
      error: error => {
        
        Swal.fire({
          title: 'Error',
          text: "Error en el servidor intente nuevamente mas tarde",
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        
        }).then(() => {
            window.history.back()
        });

    }


  })
    
    // Aquí podrías obtener la configuración desde un servicio
    // const savedConfig = localStorage.getItem('minutesBuffer');
    // if (savedConfig) {
    //   const minutes = parseInt(savedConfig, 10);
    //   this.configForm.patchValue({ minutes });
    //   this.savedValue = minutes;
    // }
  }

  onSubmit(): void {
    if (this.configForm.valid) {
      let empPostConfiguration: EmpPostConfiguration ={
        pillowLastArrival: this.configForm.get('minutes')?.value,
        userId: 1,
        pillowJustify: this.configForm.get('days')?.value

      }
      this.pillowTimeLateArrivalService.postConfig(empPostConfiguration).subscribe({
        next: (response) => {

          Swal.fire({
            title: '¡Guardado!',
            text: "Configuracion guardada con exito",
            icon: 'success',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.savedDaysValue= this.configForm.get('days')?.value;
            this.savedMinutesValue=this.configForm.get('minutes')?.value

          });
        },
        error: error => {
          
          Swal.fire({
            title: 'Error',
            text: "Error en el servidor intente nuevamente mas tarde",
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });

          this.savedMinutesValue = this.configForm.get('minutes')?.value;
          this.savedDaysValue = this.configForm.get('days')?.value;
      }})
    }}



  resetForm(): void {
    this.configForm.reset();
  }

  // Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.configForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    const field = this.configForm.get(fieldName);
    return field ? field.errors?.[errorType] : false;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }







}
