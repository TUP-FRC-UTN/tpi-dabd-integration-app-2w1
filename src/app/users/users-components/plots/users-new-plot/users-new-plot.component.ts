import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { PlotTypeModel } from '../../../users-models/plot/PlotType';
import { PlotStateModel } from '../../../users-models/plot/PlotState';
import { PlotModel } from '../../../users-models/plot/Plot';
import { FormArray } from '@angular/forms';
import { FileUploadComponent } from '../../utils/file-upload/file-upload.component';
import { AuthService } from '../../../users-servicies/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-users-new-plot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FileUploadComponent],
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

  @ViewChild(FileUploadComponent) fileUploadComponent!: FileUploadComponent;

  types: PlotTypeModel[] = [];
  states: PlotStateModel[] = [];
  files: File[] = [];

  ngOnInit(): void {

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
    plotNumber: new FormControl(0, [Validators.required,Validators.min(0)]),
    blockNumber: new FormControl(0, [Validators.required,Validators.min(0)]),
    totalArea: new FormControl(0, [Validators.required,Validators.min(0)]),
    totalBuild: new FormControl(0, [Validators.required,Validators.min(0)]),
    state: new FormControl(null, [Validators.required]),
    type: new FormControl(null, [Validators.required])
  })

  resetForm() {
    this.formReactivo.reset();
    this.states = [];
    this.types = [];
    this.fileUploadComponent.files = [];
    this.files = [];
    
  }

  createPlot(){
    const plot: PlotModel = {
      plot_number: this.formReactivo.get('plotNumber')?.value || 0,
      block_number: this.formReactivo.get('blockNumber')?.value || 0,
      total_area_in_m2: this.formReactivo.get('totalArea')?.value || 0,
      built_area_in_m2: this.formReactivo.get('totalBuild')?.value ||0,
      plot_state_id: this.formReactivo.get('state')?.value || 0,
      plot_type_id: this.formReactivo.get('type')?.value || 0,
      userCreateId: this.authService.getUser().id || 0,
      files: this.files

    }  

    this.plotService.postPlot(plot).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: "Lote guardado",
          showConfirmButton: false,
          timer: 1500
        });
        this.resetForm();
        this.ngOnInit();
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
    this.files.splice(index, 1);
  }
}