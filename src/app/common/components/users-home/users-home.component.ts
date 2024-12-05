import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../users/users-servicies/auth.service';
import { UserLoged } from '../../../users/users-models/users/UserLoged';
import { WeatherService } from '../../../users/users-servicies/weather.service';
import { WeatherData } from '../../../users/users-models/weather/WeatherData';
import { CommonModule } from '@angular/common';
import { LandingNotification } from '../../models/Landing-notification';
import { NotificationService } from '../../../notifications/service/notification.service';
import { NotificationsService } from '../../../users/users-servicies/notifications.service';
import { TutorialService } from '../../services/tutorial.service';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { GetPlotModel } from '../../../users/users-models/plot/GetPlot';
import { PlotService } from '../../../users/users-servicies/plot.service';

@Component({
  selector: 'app-users-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-home.component.html',
  styleUrl: './users-home.component.css',
})
export class UsersHomeComponent implements OnInit, OnDestroy {
  selectedPlot: GetPlotModel | null = null;
  selectedPath: HTMLElement | null = null;
  selectedPng: string | null = null;
  plots: GetPlotModel[] = [];
  plotsCard: { number: number, blockNumber: number, totalArea: number, type: string, status: string }[] = [];


  constructor(
    private authService: AuthService,
    private weatherService: WeatherService,
    private notificationService: NotificationsService,
    private plotService: PlotService,
    private cdRef: ChangeDetectorRef,
    private tutorialService: TutorialService
  ) {
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

  ngOnDestroy(): void {
    if (this.tour) {
      this.tour.complete();
    }
    this.subsription.unsubscribe();
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  userLoged: UserLoged | undefined;
  greeting: string = '';
  icon: string = '';
  currentTime: string = '';
  userName: string = '';
  weather: WeatherData | null = null;
  forecast: WeatherData[] = [];
  notifications: LandingNotification[] = [];
  tour: Shepherd.Tour;
  tutorialSubscription = new Subscription();
  subsription = new Subscription();

  ngOnInit() {
    this.weatherService.getForecast();
    this.weatherService.getWeather();
    this.getPlots();
    this.loadNotifications();

    const aux = this.weatherService.weather$.subscribe((weather) => {
      this.weather = weather;
    });

    const aux2 = this.weatherService.forecast$.subscribe((forecast) => {
      this.forecast = forecast;
    });
    // Actualizar cada minuto

    // Obtener el nombre del usuario
    this.userLoged = this.authService.getUser();
    this.userName = this.userLoged?.name || '';

    this.subsription.add(aux);
    this.subsription.add(aux2);

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  //Trae los primeros 3 lotes disponibles
  getPlots() {
    this.plotService.getAllPlots().subscribe({
      next: (data: GetPlotModel[]) => {
        this.plots = data;
        this.loadMap();
      },
      error: (err) => {
        console.error('Error al cargar los lotes', err);
      }
    })
  }

  //Cargar el mapa
  loadMap(): void {
    const svgElement = document.getElementById('mapa') as HTMLObjectElement;
    const svgDoc = svgElement.contentDocument;

    //Colores de elementos unicos
    svgDoc?.getElementById('river')?.setAttribute('fill', '#789DBC');
    svgDoc?.getElementById('street')?.setAttribute('fill', '#6C757D');
    svgDoc?.getElementById('entry')?.setAttribute('fill', '#6C757D');

    this.plots.forEach(plot => {
      const pathElement = svgDoc?.getElementById(plot.plot_number.toString());
      if (pathElement) {
        switch (plot.plot_state) {
          case 'Habitado':
            pathElement.setAttribute('fill', '#DEAA79');
            break;
          case 'En construccion':
            pathElement.setAttribute('fill', '#FFE6A9');
            break;
          case 'Disponible':
            pathElement.setAttribute('fill', '#B1C29E');
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
          this.selectedPlot = this.plots.find(l => l.id === plot.id)!;
          this.selectedPath = pathElement.cloneNode(true) as HTMLElement;
          this.selectedPng = this.convertPathToPngV2();
          this.cdRef.detectChanges();
        });

      }
    });
  }


  //
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
      id: 'table-step',
      title: 'Barra de navegación',
      text: 'Esta es la barra de navegación. Desde aquí puede ingresar a su perfil, ver sus notificaciones, o acceder a la sección de ajustes.',
      attachTo: {
        element: '#navbar',
        on: 'auto',
      },
      buttons: [

        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Barra lateral',
      text: 'Desde acá puede acceder a las demás pantallas del sistema. Pulse en el botón de la izquierda para ver más información.',
      attachTo: {
        element: '#sidebar',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Notificaciones',
      text: 'Acá puede ver las últimas tres notificaciones generales. Para ver más, visite la pestaña de notificaciones.',
      attachTo: {
        element: '#notificaciones',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Clima',
      text: 'Acá puede ver el clima actual y los pronósticos para los próximos días.',
      attachTo: {
        element: '#clima',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior', action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Contactos',
      text: 'Acá puede ver los números de contacto en caso de necesitar comunicarse con nosotros.',
      attachTo: {
        element: '#contactos',
        on: 'auto',
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'map-step',
      title: 'Mapa',
      text: 'Este es el mapa del barrio, puede hacer click en cualquier lote para ver los detalles del mismo.',
      attachTo: {
        element: '#map',
        on: 'auto',
      },
      canClickTarget: true,

      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        },
      ],
    });

    this.tour.addStep({
      id: 'plot-step',
      title: 'Lote',
      text: 'Acá puede ver el detalle del lote seleccionado en el mapa.',
      attachTo: {
        element: '#plot',
        on: 'auto',
      },
      canClickTarget: true,

      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Finalizar',
          action: this.tour.complete,
        },
      ],
    });


    this.tour.start();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return this.capitalizeFirstLetter(day);
  }

  formatDateToDDMM(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  loadNotifications() {
    // this.notificationService.getAll().subscribe(
    //   notifications => {
    //     notifications.sort((a, b) => new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime());
    //     let notis = notifications.filter(n => n.userId === this.userLoged?.id);
    //     this.notifications = notis.slice(0, 3);
    //   },
    //   error => {
    //     console.error('Error al obtener las notificaciones', error);
    //   }
    // );

    //Trae las ultmias notificaciones del usuario
    this.notificationService
      .getAllByUser(this.authService.getUser().id)
      .subscribe({
        next: (notifications: LandingNotification[]) => {
          this.notifications = notifications.slice(0, 3);
        },
        error: (err) => {
          console.error('Error al cargar las notificaciones', err);
        },
      });
  }

  capitalizeFirstLetter(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
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


  openRequestModal(plotId: number) {

  }

}
