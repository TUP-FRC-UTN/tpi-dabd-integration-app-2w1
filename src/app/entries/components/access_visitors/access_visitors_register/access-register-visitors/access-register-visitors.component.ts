import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccessContainerVisitorsRegistrationComponent } from '../access-container-visitors-registration/access-container-visitors-registration.component';
import { AccessVisitorsEventualComponent } from '../../acceses-visitors-eventual/access-visitors-eventual/access-visitors-eventual.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../../common/services/tutorial.service';

@Component({
  selector: 'app-access-register-visitors',
  standalone: true,
  imports: [AccessContainerVisitorsRegistrationComponent, AccessVisitorsEventualComponent, FormsModule],
  templateUrl: './access-register-visitors.component.html',
  styleUrl: './access-register-visitors.component.css'
})
export class AccessRegisterVisitorsComponent implements OnInit, OnDestroy {

  selectedComponent: 'registration' | 'eventual' = 'eventual';
  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  constructor(private tutorialService: TutorialService
  ) {
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        canClickTarget: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        }
      },
      useModalOverlay: true,
    });
  }

  ngOnInit(): void {
    //TUTORIAL
    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  ngOnDestroy(): void {
    //TUTORIAL
    this.tutorialSubscription.unsubscribe();
    if (this.tour) {
      this.tour.complete();
    }

    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
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

    while (this.tour.steps.length > 0) {
      this.tour.removeStep(this.tour.steps[this.tour.steps.length - 1].id);
    }


    this.tour.addStep({
      id: 'start-step',
      title: 'Añadir visitante ',
      text: 'Desde esta pantalla, puede agregar un nuevo visitante. Puede elegir entre visitante eventual o permanetnente.',
      attachTo: {
        element: '#mainVisitors',
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
      id: 'subject-step',
      title: 'Tipos de visitantes',
      text: 'Desde aquí puede elegir el tipo de visitante que desea agregar. Estos pueden ser eventuales o permanentes.',
      attachTo: {
        element: '#selectVisitors',
        on: 'auto'
      },
      buttons: [

        {
          text: 'Ver tutorial de eventuales',
          action: () => {

            select.value = 'eventual';
            select.dispatchEvent(new Event('change'));

            this.loadEventualVisitor();

            this.tour.next();
          },
        },
        {
          text: 'Ver tutorial de permanentes',
          action: () => {

            select.value = 'registration';
            select.dispatchEvent(new Event('change'));

            this.loadPermanentVisitor();

            this.tour.next();
          },
        }

      ]
    });

    const select = document.getElementById(
      'selectVisitors'
    ) as HTMLInputElement;


    console.log(this.tour.steps.length);

    this.tour.start();
  }

  //Función para cargar steps si selecciona eventual
  loadEventualVisitor() {
    this.tour.addStep({
      id: 'subject-step',
      title: 'Agregar eventuales',
      text: 'Desde acá podrá agregar visitantes eventuales. Estos solo tienen acceso el día que se agreguen.',
      attachTo: {
        element: '#addVisitor',
        on: 'auto'
      },
      beforeShowPromise: () => {
        return new Promise((resolve) => {
          const checkElementExists = () => {
            const removeButton = document.getElementById('addVisitor');
            if (removeButton) {
              resolve(true);
            } else {
              // Reintentar cada 500 milisegundos
              setTimeout(checkElementExists, 5);
            }
          };

          checkElementExists();
        });
      },
      buttons: [

        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Email (opcional)',
      text: 'Acá puede elegir ingresar un email para el visitante. Esto es opcional, y le permite recibir por correo electrónico un código QR para facilitar el acceso.',
      attachTo: {
        element: '#email',
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

  }

  //Función para cargar steps si selecciona permanente
  loadPermanentVisitor() {
    while (this.tour.steps.length > 2) {
      this.tour.removeStep(this.tour.steps[this.tour.steps.length - 1].id);
    }


    this.tour.addStep({
      id: 'subject-step',
      title: 'Agregar permanentes',
      text: 'Desde acá podrá agregar visitantes permanentes. Estos tendrán acceso a su propiedad en los días y horarios que usted asigne.',
      attachTo: {
        element: '#addPermanent',
        on: 'auto'
      },
      beforeShowPromise: () => {
        return new Promise((resolve) => {
          const checkElementExists = () => {
            const removeButton = document.getElementById('addPermanent');
            if (removeButton) {
              resolve(true);
            } else {
              // Reintentar cada 500 milisegundos
              setTimeout(checkElementExists, 5);
            }
          };

          checkElementExists();
        });
      },
      buttons: [

        {
          text: 'Siguiente',
          action: this.tour.next
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Añadir vehículo',
      text: 'Si el invitado ingresa con vehículo, deberá seleccionar esta opción y cargar los datos de dicho vehículo.',
      attachTo: {
        element: '#vehicle',
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
      id: 'subject-step',
      title: 'Agregar visitante',
      text: 'Al finalizar, pulse este botón para agregar el visitante a la lista de visitantes y proceder con el siguinete paso.',
      attachTo: {
        element: '#addVisitorToList',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: () => {
            // Codigo para seleccionar el radio button "Solamente a"
            const addVisitor = document.getElementById(
              'nextStep'
            ) as HTMLInputElement;
            addVisitor.click();
            this.tour.next();
          },
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Revisar lista',
      text: 'Acá podrá ver la lista de visitantes. En ella aparecerán todos los visitantes cargados en el paso anterior, los cuales podrá remover de ser necesario.',
      attachTo: {
        element: '#secondStep',
        on: 'auto'
      },
      beforeShowPromise: () => {
        return new Promise((resolve) => {
          const checkElementExists = () => {
            const removeButton = document.getElementById('secondStep');
            if (removeButton) {
              resolve(true);
            } else {
              // Reintentar cada 500 milisegundos
              setTimeout(checkElementExists, 5);
            }
          };

          checkElementExists();
        });
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
      id: 'subject-step',
      title: 'Carga Masiva',
      text: 'Si lo desea, también puede realizar una carga masiva de visitantes. Para ello, descargue la plantilla de Excel con el botón de la izquierda y cargue los datos necesarios. Finalmente, con el botón de la derecha podrá subir la lista.',
      attachTo: {
        element: '#excelReader',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back
        },
        {
          text: 'Siguiente',
          action: () => {
            // Codigo para seleccionar el radio button "Solamente a"
            const addVisitor = document.getElementById(
              'finalStep'
            ) as HTMLInputElement;
            addVisitor.click();
            this.tour.next();
          },
        }
      ]
    });

    this.tour.addStep({
      id: 'subject-step',
      title: 'Tiempo autorizado',
      text: 'En este paso puede determinar durante qué periodo de tiempo se habilitará el acceso, en qué días y en qué horarios.',
      attachTo: {
        element: '#authorizedTime',
        on: 'auto'
      },
      beforeShowPromise: () => {
        return new Promise((resolve) => {
          const checkElementExists = () => {
            const removeButton = document.getElementById('authorizedTime');
            if (removeButton) {
              resolve(true);
            } else {
              // Reintentar cada 500 milisegundos
              setTimeout(checkElementExists, 5);
            }
          };

          checkElementExists();
        });
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
      id: 'subject-step',
      title: 'Selección de días',
      text: 'Acá puede seleccionar los días en los que se habilitará el acceso. Tenga en cuenta que solo estarán habilitados aquellos días contemplados en el rango de fechas.',
      attachTo: {
        element: '#dayCheckboxes',
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
      id: 'subject-step',
      title: 'Añadir días',
      text: 'Al terminar, pulse este botón para añadir los días seleccionados a la lista. Una vez añadidos, puede borrarlos de la lista en caso de equivocarse.',
      attachTo: {
        element: '#addDays',
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
      id: 'subject-step',
      title: 'Autorizar',
      text: 'Finalmente, pulse este botón para autorizar el acceso a los visitantes.',
      attachTo: {
        element: '#submitAll',
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
  }



}


