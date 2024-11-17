import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { PlotModel } from '../../../users-models/plot/Plot';
import { FormArray } from '@angular/forms';
import { AuthService } from '../../../users-servicies/auth.service';
import { Router } from '@angular/router';
import { ValidatorsService } from '../../../users-servicies/validators.service';

@Component({
  selector: 'app-users-new-plot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './users-new-plot.component.html',
  styleUrl: './users-new-plot.component.css'
})
export class UsersNewPlotComponent {

  showOwners : boolean = false;

  toggleShowOwners(event: any): void {
    this.showOwners = event.target.checked;
  }
  
  private readonly plotService = inject(PlotService);
  private readonly authService = inject(AuthService);
  private readonly router : Router = inject(Router);
  private readonly validatorService = inject(ValidatorsService);

  types: PlotTypeModel[] = [];
  states: PlotStateModel[] = [];
  files: File[] = [];

  ngOnInit(): void {

    this.formReactivo.get('type')?.setValue("");

    this.plotService.getAllTypes().subscribe({
      next: (data: PlotTypeModel[]) => {
        
        this.types = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de lote:', err);
      }
    });


    this.plotService.getAllStates().subscribe({ 
      next: (data: PlotStateModel[]) => {
        console.log(data);
        this.states = data;
      },
      error: (err) => {
        console.error('Error al cargar los estados de lote:', err);
      }
    });
  }

  getFiles(files: File[]) {
    this.files = files;
  }

   
  formReactivo = new FormGroup({
    plotNumber: new FormControl(1, [
    Validators.required,Validators.min(1),
    ],
    this.validatorService.validateUniquePlotNumber()
  ),
    blockNumber: new FormControl(1, [
      Validators.required,
      Validators.min(1)
    ]),
    totalArea: new FormControl(0, [
      Validators.required,
      Validators.min(1)
    ]),
    totalBuild: new FormControl(0, [
      Validators.required,
      Validators.min(0)
    ]),
    state: new FormControl("", [
      Validators.required
    ]),
    type: new FormControl("", [
      Validators.required
    ])
  })


  resetForm() {
    this.formReactivo.reset();
    this.states = [];
    this.types = [];
    this.clearFileInput();
  }
  
  clearFileInput() {
    // Limpia el array de archivos
    this.files = [];
    // Limpia el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  

  createPlot(){
    const plot: PlotModel = {
      plot_number: this.formReactivo.get('plotNumber')?.value || 0,
      block_number: this.formReactivo.get('blockNumber')?.value || 0,
      total_area_in_m2: this.formReactivo.get('totalArea')?.value || 0,
      built_area_in_m2: this.formReactivo.get('totalBuild')?.value ||0,
      plot_state_id: Number(this.formReactivo.get('state')?.value || 0),
      plot_type_id: Number(this.formReactivo.get('type')?.value || 0),
      userCreateId: this.authService.getUser().id || 0,
      files: this.files

    }  

    this.plotService.postPlot(plot).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: "Lote guardado",
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
          timer: undefined,
          allowEscapeKey: false,
          allowOutsideClick: false

        });
        this.resetForm();
        this.ngOnInit();
        this.router.navigate(['/home/plots/list']);
      },
      error: (error) => {
        console.error('Error al crear el lote:', error);
        alert("Error al crear el lote");
      }
    });
  }

  redirect(url : string){
    this.router.navigate([url]);
  }

  onValidate(controlName: string) {
    const control = this.formReactivo.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }


  showError(controlName: string): string {
    const control = this.formReactivo.get(controlName);
    if (!control || !control.errors) return '';
  
    const firstErrorKey = Object.keys(control.errors)[0];
    const errorDetails = control.errors[firstErrorKey];
  
    switch (firstErrorKey) {
      case 'required':
        return 'Este campo no puede estar vacío.';
      case 'email':
        return 'Formato de correo electrónico inválido.';
      case 'minlength':
        return `Mínimo ${errorDetails.requiredLength} caracteres.`;
      case 'maxlength':
        return `Máximo ${errorDetails.requiredLength} caracteres.`;
      case 'pattern':
        return 'El formato ingresado no es válido.';
      case 'plotNumberTaken':
        return 'El numero de lote ya está asignado a un lote'
      case 'min':
        return `El valor debe ser mayor o igual a ${errorDetails.min}.`;
      case 'max':
        return `El valor debe ser menor o igual a ${errorDetails.max}.`;
      case 'requiredTrue':
        return 'Debe aceptar el campo requerido para continuar.';
      case 'date':
        return 'La fecha ingresada es inválida.';
      case 'url':
        return 'Formato de URL inválido.';
      case 'number':
        return 'Este campo solo acepta números.';
      case 'customError':
        return 'Error personalizado: verifique el dato ingresado.';
      default:
        return 'Error no identificado en el campo.';
    }
  }  

  //Evento para actualizar el listado de files a los seleccionados actualmente
  onFileChange(event: any) {
    this.files.push(...Array.from(event.target.files as FileList)); //Convertir FileList a Array
  }

  deleteFile(index: number) {
    // Elimina el archivo del array de archivos
    this.files.splice(index, 1);
    
    // Limpia el valor del input de archivo
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}