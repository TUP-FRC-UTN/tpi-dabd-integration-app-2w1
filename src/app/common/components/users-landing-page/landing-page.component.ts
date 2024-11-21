import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { PlotService } from '../../../users/users-servicies/plot.service';
import { GetPlotModel } from '../../../users/users-models/plot/GetPlot';
import { CommonModule } from '@angular/common';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'], 
})
export class LandingPageComponent implements OnInit  {
  lotes: GetPlotModel[]=[];
  //Injects
  private router = inject(Router);
  private plotService = inject(PlotService);
  //-----------------------------------------implementar el servicio de notificaciones para enviar un mail-------------------------------

  formMessage : FormGroup;
  plotsCard : {number : number, blockNumber : number, totalArea : number, type : string, status : string}[] = [];

  //Formulario para hacer consultas
  constructor(private fb : FormBuilder, private routingService : RoutingService) {
    this.formMessage = this.fb.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    })
  }
  loadMap(): void {
    const svgElement = document.getElementById('mapa') as HTMLObjectElement;
    const svgDoc = svgElement.contentDocument; 
      svgDoc?.getElementById('rio')?.setAttribute('fill','#4381C1')
      svgDoc?.getElementById('path277')?.setAttribute('fill','#FDE2E4')
      this.lotes.forEach(lote => {
        const pathElement = svgDoc?.getElementById(lote.plot_number.toString());
        if (pathElement) {
          
          switch (lote.plot_state) {
            case 'Habitado':
              pathElement.setAttribute('fill', '#CDDAFD');
              break;
            case 'En construccion':
              pathElement.setAttribute('fill', '#f7a072');
              break;
            case 'Disponible':
              pathElement.setAttribute('fill', '#BEE1E6');
              break;
          }
                  // Evento de hover (mouseenter)
        pathElement.addEventListener('mouseenter', () => {
          pathElement.setAttribute('stroke', '#000'); // Borde negro
          pathElement.setAttribute('stroke-width', '2'); // Ancho del borde
          pathElement.setAttribute('opacity', '0.8'); // Opacidad reducida
        });

        // Evento de salir del hover (mouseleave)
        pathElement.addEventListener('mouseleave', () => {
          pathElement.removeAttribute('stroke'); // Elimina el borde
          pathElement.removeAttribute('stroke-width');
          pathElement.removeAttribute('opacity');
        });
          pathElement.addEventListener('click', () => {
            alert(`Hiciste clic en ${lote.id}`);
            console.log(lote)
          });
        }
      });
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
    this.plotService.getAllPlots().subscribe({
      next: (data: GetPlotModel[]) => {
        this.lotes = data;
        this.loadMap();
      },
      error: (err) => {
        console.error('Error al cargar los lotes', err);
      }
    })
  }

  //Método para redireccionar
  redirect(path : string){
    this.routingService.redirect('/login')
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