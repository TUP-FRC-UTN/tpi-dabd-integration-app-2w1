import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { PlotService } from '../../../users/users-servicies/plot.service';
import { GetPlotModel } from '../../../users/users-models/plot/GetPlot';
import { CommonModule } from '@angular/common';
import { RoutingService } from '../../services/routing.service';
import { PostBuyRequestDto } from '../../../users/users-models/plot/PostBuyRequestDto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  lotes: GetPlotModel[] = [];
  selectedPlot: GetPlotModel | null = null;
  selectedPath: HTMLElement | null = null;
  selectedPng: string | null = null;
  
  //Injects
  private routingService = inject(RoutingService);
  private plotService = inject(PlotService);

  formMessage: FormGroup;
  plotsCard: { number: number, blockNumber: number, totalArea: number, type: string, status: string }[] = [];


  images: any[] = [
    'https://www.villadelcondor.com/imagenes/villadelcondor1.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor2.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor3.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor4.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor5.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor6.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor7.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor8.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor9.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor10.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor11.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor12.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor14.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor15.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor16.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor17.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor18.jpg'
  ];


  //Formulario para hacer consultas
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.formMessage = this.fb.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl('', [Validators.minLength(10),
        Validators.maxLength(20),  Validators.pattern(/^\d+$/)]),
      observations: new FormControl(''),
      plot_id: new FormControl(this.selectedPlot?.id)
    })
    
  }


  //Init
  ngOnInit(): void {
    this.getPlots();
    this.formMessage.setValidators(this.emailOrPhoneValidator);
  }


  //Cargar el mapa
  loadMap(): void {
    const svgElement = document.getElementById('mapa') as HTMLObjectElement;
    const svgDoc = svgElement.contentDocument;

    //Colores de elementos unicos
    svgDoc?.getElementById('river')?.setAttribute('fill', '#789DBC');
    svgDoc?.getElementById('street')?.setAttribute('fill', '#6C757D');
    svgDoc?.getElementById('entry')?.setAttribute('fill', '#6C757D');

    this.lotes.forEach(lote => {
      const pathElement = svgDoc?.getElementById(lote.plot_number.toString());
      if (pathElement) {
        switch (lote.plot_state) {
          case 'Disponible':
            pathElement.setAttribute('fill', '#B1C29E');
            break;
          default:
            pathElement.setAttribute('fill', '#DEAA79');
            break;
        }

        // Evento de hover (mouseenter)
        pathElement.addEventListener('mouseenter', () => {
          pathElement.setAttribute('stroke-width', '3'); // Ancho del borde
          pathElement.setAttribute('opacity', '0.6'); // Opacidad reducida
        });

        // Evento de salir del hover (mouseleave)
        pathElement.addEventListener('mouseleave', () => {
          pathElement.setAttribute('stroke-width', '1');
          pathElement.removeAttribute('opacity');
        });

        // Setteo de evento de clic
        pathElement.addEventListener('click', () => {
          this.selectedPlot = this.lotes.find(l => l.id === lote.id) || null;

          this.selectedPath = pathElement.cloneNode(true) as HTMLElement;
          this.selectedPng = this.convertPathToPngV2();
          this.formMessage.reset();
          this.cdRef.detectChanges();
        });

      }
    });
  }

  //Trae los primeros 3 lotes disponibles
  getPlots() {
    this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotModel[]) => {

        const firstThreePlots = data.slice(0, 6);
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

  emailOrPhoneValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const email = control.get('email')?.value;
    const phone = control.get('phone')?.value;

    if (!email && !phone) {
      return { emailOrPhoneRequired: true };
    }
    return null;
  }

  //Método para redireccionar
  redirect(path: string) {
    this.routingService.redirect('/login')
  }


  //Mostrar si el campo es válido o no
  onValidate(controlName: string) {
    const control = this.formMessage.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid  && (control?.dirty || control?.touched)
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
      pattern: 'Solo se permiten números.',
      minlength: `El campo debe tener al menos 10 caracteres.`,
      maxlength: `El campo debe tener como máximo 20 caracteres.`,
      emailOrPhoneRequired: 'Debe ingresar al menos un correo electrónico o un número de teléfono.'
    };

    return errorMessages[errorKey] || 'Error desconocido';
  }
  

  clearPlot() {
    this.selectedPlot = null;
  }

  extractPathCoordinates(path: string): { minX: number, minY: number, maxX: number, maxY: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let currentX = 0, currentY = 0;

    //Separa los comandos del path
    const pathCommands = path.match(/[a-zA-Z][^a-zA-Z]*/g);

    pathCommands?.forEach(command => {
      //Obtiene las coordenadas
      const coords = command.slice(1).split(/[\s,]+/).map(Number);
      let i = 0;

      while (i < coords.length) {
        const x = coords[i];
        const y = coords[i + 1];

        //Movimientos absolutos
        if (command.startsWith('M') || command.startsWith('L') || command.startsWith('T')) {
          currentX = x;
          currentY = y;
        }

        //Movimientos relativos
        else if (command.startsWith('m') || command.startsWith('l') || command.startsWith('t')) {
          currentX += x;
          currentY += y;
        }

        //
        else if (command.startsWith('C') || command.startsWith('c') || command.startsWith('S') || command.startsWith('s') || command.startsWith('Q') || command.startsWith('q') || command.startsWith('T')) {
          currentX = x;
          currentY = y;
        }

        //Actualiza las coordenadas mínimas y máximas
        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);

        //Avanza de dos en dos porque itera sobre x,y
        i += 2;
      }
    });

    return { minX, minY, maxX, maxY };
  }

  updatePathToOrigin(path: string): string {
    const { minX, minY } = this.extractPathCoordinates(path);

    // Calculamos el traslape necesario para llevar el path a (0, 0)
    const translateX = -minX;
    const translateY = -minY;

    // Devuelve el transform para mover el path a (0, 0)
    return `translate(${translateX}, ${translateY})`;
  }

  convertPathToPngV2(width: number = 150, height: number = 150): string {
    debugger
    const pathD = this.selectedPath?.getAttribute('d');
    if (!pathD) {
      throw new Error('Path no definido.');
    }
    console.log('Path d:', pathD);
    const { minX, minY, maxX, maxY } = this.extractPathCoordinates(pathD);

    // Crear un canvas temporal
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas.');
    }

    // Escalar y trasladar para ajustar el path al canvas
    const scaleX = width / (maxX - minX);
    const scaleY = height / (maxY - minY);
    const scale = Math.min(scaleX, scaleY); // Mantener proporción

    const translateX = -minX * scale;
    const translateY = -minY * scale;

    ctx.setTransform(scale, 0, 0, scale, translateX, translateY);

    // Dibujar el path en el canvas
    const svgPath = new Path2D(pathD);
    ctx.fillStyle = this.selectedPath?.getAttribute('fill') as string || '#000000';
    ctx.fill(svgPath);
    // Configurar y aplicar el contorno (stroke)
    ctx.lineWidth = 0.5; // Grosor del contorno
    ctx.strokeStyle = '#343A40'; // Color del contorno (puedes cambiarlo)
    ctx.stroke(svgPath)

    // Convertir el canvas a una imagen en formato base64
    return canvas.toDataURL('image/png');
  }

  //----------------------------------Acciones----------------------------------

  //Envía el formulario
  postRequest(){
    if(this.formMessage.valid){
      const formData = this.formMessage.value as PostBuyRequestDto;
      this.plotService.postBuyRequest(formData).subscribe({
        next: () => {
          console.log('Solicitud enviada');
          this.formMessage.reset();
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'La solicitud ha sido enviada correctamente.',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (err) => {
          console.error('Error al enviar la solicitud', err);
          Swal.fire({
            icon: 'error',
            title: 'Algo salió mal',
            text: 'Intentelo de nuevo más tarde.',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  }
}