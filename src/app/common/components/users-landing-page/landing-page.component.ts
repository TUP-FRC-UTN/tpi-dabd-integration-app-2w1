import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { PlotService } from '../../../users/users-servicies/plot.service';
import { GetPlotModel } from '../../../users/users-models/plot/GetPlot';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'], 
})
export class LandingPageComponent implements OnInit {

  //Injects
  private router = inject(Router);
  private plotService = inject(PlotService);
  //-----------------------------------------implementar el servicio de notificaciones para enviar un mail-------------------------------

  formMessage : FormGroup;
  plotsCard : {number : number, blockNumber : number, totalArea : number, type : string, status : string}[] = [];

  //Formulario para hacer consultas
  constructor(private fb : FormBuilder){
    this.formMessage = this.fb.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    })
  }
  ngOnInit(): void {
    this.getPlots();
  }

  //Trae los primeros 3 lotes disponibles
  getPlots(){
    this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotModel[]) => {
        
        const firstThreePlots = data.slice(0, 3);
        this.plotsCard = firstThreePlots.map(d => ({
          number: d.plot_number,
          blockNumber: d.block_number,
          totalArea: d.total_area_in_m2,
          type: d.plot_type,
          status: d.plot_state
          }));
          
      },
      error: (err) => {
        console.error('Error al cargar los lotes', err);
      }
    });
  }

  //Método para redireccionar
  redirect(path : string){
    this.router.navigate([path]);
  }

  //Enviar el formulario con la consulta
  sendMessage(){
    if(this.formMessage.valid){
      //implementar enviar mensaje
    }
  }

  //Mostrar si el campo es válido o no
  onValidate(controlName: string) {
    const control = this.formMessage.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Mostrar los errores del los campos
  showError(controlName: string): string {
    const control = this.formMessage.get(controlName);
  
    if (!control || !control.errors) return '';
  
    const errorKey = Object.keys(control.errors)[0];
  
    const errorMessages: { [key: string]: string } = {
      required: 'Este campo no puede estar vacío.',
      email: 'Formato de correo electrónico inválido.',
    };

    return errorMessages[errorKey] || 'Error desconocido';
  }
  
}