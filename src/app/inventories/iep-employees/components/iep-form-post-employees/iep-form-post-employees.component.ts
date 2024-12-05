import { CommonModule, JsonPipe, NgFor } from '@angular/common';
import { Component, importProvidersFrom, Inject, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, NgForm, PatternValidator, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ciudad, Provincia } from '../../Models/emp-provincia';
import { Observable, Subscription } from 'rxjs';
import { Provider } from '../../../iep-inventory/models/provider';
import { Supplier } from '../../../iep-inventory/models/suppliers';
import { AddressDto, Charge, DocumentTypeEnum, PostEmployeeDto } from '../../Models/emp-post-employee-dto';
import { post } from 'jquery';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../../../users/users-servicies/auth.service';
import { ChargeService } from '../../services/charge.service';
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../../common/services/tutorial.service';
declare var bootstrap: any; // Añadir esta declaración al principio


@Component({
  selector: 'app-iep-form-post-employees',
  standalone: true,
  imports: [FormsModule, CommonModule, NgSelectModule, RouterLink, ReactiveFormsModule],
  templateUrl: './iep-form-post-employees.component.html',
  styleUrl: './iep-form-post-employees.component.css',
})
export class IEPFormPostEmployeesComponent implements OnInit {
 
  
  constructor(private serviceCombos: EmpPostEmployeeService , private router : Router,private userService: AuthService, private fb: FormBuilder,private cargoService: ChargeService, private tutorialService: TutorialService
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
      keyboardNavigation: false,
      useModalOverlay: true,
      
    }); 
    const currentDate = new Date();
    // Definir la fecha mínima (3 meses en el pasado)
    const minDate = new Date();
    minDate.setMonth(currentDate.getMonth() - 3);

    // Definir la fecha máxima (3 meses en el futuro)
    const maxDate = new Date();
    maxDate.setMonth(currentDate.getMonth() + 3);
    // Formatear fechas para el input de tipo "date"
    this.minDate = minDate.toISOString().split('T')[0];
    this.maxDate = maxDate.toISOString().split('T')[0];

    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', Validators.required],
      
    });
  }

  //TUTORIAL
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

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
      id: 'general-step',
      title: 'Crear un empleado',
      text: 'En este formulario podrá crear un nuevo empleado con sus datos correspondientes.',
      attachTo: {
        element: '#form-container',
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
      id: 'personal-data-step',
      title: 'Datos personales',
      text: 'Ingrese acá los datos personales del empleado.',
      attachTo: {
        element: '#personal-data',
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
      id: 'contact-data-step',
      title: 'Contacto',
      text: 'Ingrese acá el teléfono y E-mail del empleado.',
      attachTo: {
        element: '#contact-data',
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
      id: 'address-step',
      title: 'Domicilio',
      text: 'Ingrese acá la dirección del empleado, seleccionando provincia y localidad.',
      attachTo: {
        element: '#address',
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
      id: 'contract-data-step',
      title: 'Contrato',
      text: 'Indique si el contrato es tercerizado o no. En caso de serlo, seleccione el proveedor. En caso de no serlo, indique el salario. Luego seleccione el cargo que corresponda (en caso de no existir, puede crear uno nuevo). Y por ultimo indique la fecha de inicio del mismo.',
      attachTo: {
        element: '#contract-data',
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
      id: 'work-days-step',
      title: 'Días y Horarios laborales',
      text: 'Seleccione qué dias de la semana trabajará el empleado y especifique el horario de inicio y fin de los mismos.',
      attachTo: {
        element: '#work-days',
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
      id: 'submit-step',
      title: 'Registrar',
      text: 'Por último, haga click en el botón verde para registrar el empleado.',
      attachTo: {
        element: '#submit-button',
        on: 'top'
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

  isInfoModalVisible: boolean = false;

  showInfoModal() {
    this.isInfoModalVisible = true;
  }

  closeInfoModal() {
    this.isInfoModalVisible = false;
  }



  createEmployee$: Observable<any>= new Observable<any>();

  validateDni$:Observable<any> = new Observable<any>();
  validateCuil$:Observable<any>=new Observable<any>();

  minDate: string;
  maxDate: string;

  lunes:boolean=true;
  martes:boolean=true;
  miercoles:boolean=true;
  jueves:boolean=true;
  viernes:boolean=true;
  sabado:boolean=false;
  domingo:boolean=false;

  documentTypeEnum=DocumentTypeEnum

  userId: number=0;
  nombre: string = '';
  apellido: string = '';
  cuil: string = '';
  documentType:DocumentTypeEnum=DocumentTypeEnum.DNI;
  dni?: string;
  telefono?: number;
  mail: string = '';
  calle: string = '';
  numeroCalle: number = 0;
  piso?: number = undefined;
  dpto: string = '';
  codigoPostal: string = '';
  salario?: number;
  horaSalida: string = '17:00';
  horaEntrada: string = '08:00';
  startTimeContract: string = new Date().toISOString().split('T')[0];

  cargoForm: FormGroup;
  isCreateModalOpen = false;
 

  success:boolean=false;
  errorMessage:string="";
  successMessage:string="";
  showModal:boolean=false;

  invalidDate: Boolean = false;

  provincias: Provincia[] = [];

  suppliers: Supplier[] = [];
  terciorizedEmployee: Boolean = false;

  selectedSupplier?: Supplier;
  localidades:Ciudad[]=[];
  cargos:Charge[]=[];

  cargoSelected?:Charge
  provinciaSelect? : Provincia =this.provincias.find(provincia => provincia.nombre === 'Cordoba');
  localidadSelect?:Ciudad;
  
  postDto:PostEmployeeDto = new PostEmployeeDto();
  adressDto:AddressDto =new AddressDto();
 
  isValidDni:boolean =true;

  isValidCuil:boolean=true;
  isValidCuilFinish: boolean = true;

  cambio() {
    console.log("Lunes:", this.lunes); 
    console.log("Martes:", this.martes); 
}

dniChange(): void {
  if(this.documentType === DocumentTypeEnum.DNI){
    this.dni = this.cuil?.substring(3, 11);
  }
}

  public validateDate() {
    if (this.startTimeContract != null) {
      const today = new Date().setHours(0, 0, 0, 0);
      const selectedDate = new Date(this.startTimeContract).setHours(
        0,
        0,
        0,
        0
      );
      this.invalidDate = selectedDate < today;
      return;
    }
    this.invalidDate = false;
  }

  public validateDni(){
    if(this.dni!=null&&this.dni!=undefined && this.documentType!=null&& this.documentType!=undefined){
      if(this.dni.length>7){
        this.validateDni$ = this.serviceCombos.validateDni(this.dni,this.documentType)
        this.validateDni$.subscribe({
          next: response => {
            this.isValidDni = !response;
          }       
        })
      }
    }
  }

 

  public changeTerceorized() {
    this.terciorizedEmployee = !this.terciorizedEmployee;
  }

  public onSubmit(form: NgForm) {

      if(form.valid){
        if(this.adressDto!=null){

          this.adressDto.street=this.calle
          this.adressDto.city=this.provinciaSelect?.nombre
          this.adressDto.locality=this.provinciaSelect?.nombre
          this.adressDto.postalCode=this.codigoPostal
          this.adressDto.apartment=this.dpto || "0"
          this.adressDto.floor=this.piso || 0
          this.adressDto.numberStreet=this.numeroCalle

          if(this.postDto!=null){
            this.postDto.name=this.nombre;
            this.postDto.surname=this.apellido;
            this.postDto.documentType=this.documentType;   
            this.postDto.documenValue=this.dni;
            this.postDto.cuil=this.cuil;

            if(this.telefono!=null){
            this.postDto.telephoneValue=this.telefono
            }
            else{this.postDto.telephoneValue=0}
            if(this.mail!=null){
            this.postDto.emailValue=this.mail;
            }
            else{this.postDto.emailValue=""};

            this.postDto.adressDto=this.adressDto

            if(this.salario==null||this.salario==undefined){this.postDto.salary=0}
            else{   this.postDto.salary=this.salario}

            this.postDto.contractStartTime=new Date(this.startTimeContract)
            this.postDto.startTime=this.horaEntrada
            this.postDto.endTime=this.horaSalida
            this.postDto.supplierId=this.selectedSupplier?.id
           
            if(this.lunes==null||this.lunes==false){ this.postDto.mondayWorkday=false}
            else{this.postDto.mondayWorkday=this.lunes}
           
            if(this.martes==null||this.martes==false){ this.postDto.tuesdayWorkday=false}
            else{this.postDto.tuesdayWorkday=this.martes}
          
            if(this.miercoles==null||this.miercoles==false){this.postDto.wednesdayWorkday=false}
            else{  this.postDto.wednesdayWorkday=this.miercoles }
           
            if(this.jueves==null||this.jueves==false){this.postDto.thursdayWorkday=false}
            else{  this.postDto.thursdayWorkday=this.jueves }

            if(this.viernes==null||this.viernes==false){this.postDto.fridayWorkday=false}
            else{  this.postDto.fridayWorkday=this.viernes }

            
            if(this.sabado==null||this.sabado==false){this.postDto.saturdayWorkday=false}
            else{  this.postDto.saturdayWorkday=this.sabado }

            
            if(this.domingo==null||this.domingo==false){this.postDto.sundayWorkday=false}
            else{  this.postDto.sundayWorkday=this.domingo }


            this.postDto.charge=this.cargoSelected?.id
            this.postDto.userId=this.userService.getUser().id

            console.log("Id user"+ this.postDto.userId)
            console.log("Antes del Post (formato JSON):", JSON.stringify(this.postDto, null, 2))
            this.createEmployee$ = this.serviceCombos.createProduct(this.postDto);
            console.log(this.createEmployee$);
            
        // Primero mostrar confirmación
  
            this.createEmployee$.subscribe({
              next: response => {
                console.log(JSON.stringify(response))
                this.success = true;
                this.successMessage = "Empleado guardado con exito. Credenciales de acceso habilitadas.";
                Swal.fire({
                  title: '¡Guardado!',
                  text: this.successMessage,
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  showCancelButton: false,
                  confirmButtonColor: '#3085d6'
                }).then(() => {
                  this.resetForm(form)
                  this.router.navigate(['/main/employees/employees']);
                });
                console.log("PASO: ", response);
              },
              //formatear estos errores y mostrar en modal succes y error
              error: error => {
                const errorKey = error.error.message as keyof typeof this.ERROR_MESSAGES; // Asegúrate de que sea del tipo correcto
                this.errorMessage = this.ERROR_MESSAGES[errorKey] || this.ERROR_MESSAGES['default'];
                this.success = false;

                Swal.fire({
                  title: 'Error',
                  text: this.errorMessage,
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#3085d6'
                });

                console.log("Hola error "+this.errorMessage)
                console.log("error:"+error.error.message)
                console.error(error);
                       
              },
              complete: () => {     
                }
             });
      
          }
        }
      }
    }
       

  public loadProvincias(): void {
    this.serviceCombos.getProvinces().subscribe({
      next: (provinciass) => {
        this.provincias = provinciass;
        this.provinciaSelect=this.provincias.find(provincia => provincia.nombre === 'Cordoba');
        this.loadLocalidades();
        this.localidadSelect=this.localidades.find(x =>x.nombre==='Cordoba')
      },
    });
  }



  public loadSupplier(): void {
    this.serviceCombos.getProviders().subscribe({
      next: (supplierss) => {
        this.suppliers = supplierss;
      },
    });
  }




   validarCUILFormato(cuil: string): boolean {
    // Elimina guiones o espacios del CUIL
    console.log(cuil)
    const cuilLimpio = cuil.replace(/[-\s]/g, "");

    // Verifica que tenga 11 dígitos
    if (!/^\d{11}$/.test(cuilLimpio)) {
        return false;
    }
    console.log("paso 1")

    // Separa los componentes del CUIL
    const tipo = parseInt(cuilLimpio.substring(0, 2), 10);
    const tipoAndDni = cuilLimpio.substring(0, 10);
    const dni = parseInt(cuilLimpio.substring(2, 10), 10);
    const digitoVerificador = parseInt(cuilLimpio.substring(10, 11), 10);

    // Verifica que el tipo sea válido (20, 23, 24, 27, 30, 33, 34)
    const tiposValidos = [20, 23, 24, 27];
    if (!tiposValidos.includes(tipo)) {
        this.isValidCuilFinish= false
        return false;
    }
   
    console.log("paso3")
    // Calcula el dígito verificador
     const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]; // Último 1 es para el dígito verificador
    let suma = 0;

    for (let i = 0; i < multiplicadores.length; i++) {
      suma += parseInt(tipoAndDni[i], 10) * multiplicadores[i];
  }

    const resto = suma % 11;
    const digitoCalculado = resto === 0 ? 0 : 11 - resto;

    if( digitoCalculado != digitoVerificador){
      this.isValidCuilFinish = false
      return true
    } 
    console.log("paso3")
    // Verifica que el dígito verificador sea correcto
    this.isValidCuilFinish = true;
    return true
}



  loadCharges(): void {
    this.serviceCombos.getCharges().subscribe({
      next: (data) => this.cargos = data,
      error: (error) => console.error('Error al cargar cargos:', error)
    });
  }

  goBack(){
    window.history.back();
  }

  goTo(path : string){
   this.router.navigate([path]);
  }



 public loadLocalidades():void{

    if(this.provinciaSelect!= null){
    this.localidades=this.provinciaSelect?.ciudades
    this.localidadSelect=undefined
    }
  }

  
  public resetForm(form :NgForm) {
   
    form.reset();
    this.errorMessage = '';
    this.showModal=false;
    this.successMessage = '';
    this.success=false;

    this.lunes=true;
   this.martes=true;
   this.miercoles=true;
   this.jueves=true;
   this.viernes=true;
   this.sabado=false;
   this.domingo=false;

   this.documentTypeEnum=DocumentTypeEnum

   this.userId=0
   this.nombre = '';
   this.apellido = '';
   this.cuil = '';
   this.documentType=DocumentTypeEnum.DNI;
   this.piso = 0;
   this.codigoPostal = '';
   this.salario=0
   this.horaSalida = '17:00';
   this. horaEntrada = '08:00';
   this.startTimeContract = new Date().toISOString().split('T')[0];

  }

 cerrarModal(){
  this.showModal=!this.showModal
 }

 reset():void{
  this.cargoForm.reset();
}

  ngOnInit(): void {
   this.loadSupplier();
   this.loadProvincias();
   this.loadCharges();
   console.log(this.provincias);
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

    // Modal management methods
    openCreateModal(): void {
      this.cargoForm.reset();
      this.isCreateModalOpen = true;
      document.body.classList.add('modal-open');
    }
  
    closeCreateModal(): void {
      this.isCreateModalOpen = false;
      document.body.classList.remove('modal-open');
      this.cargoForm.reset();
    }

    closeModale(modalId: string) {
      const modal = document.getElementById(modalId);
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance?.hide();
      }
  
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
        
        // Limpieza completa del modal y sus efectos
        setTimeout(() => {
          // Remover clases del body
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('padding-right');
          document.body.style.removeProperty('overflow');
          
          // Remover todos los backdrops
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops.length > 0) {
            backdrops[0].remove();
          }
  
          // Limpiar el modal
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          modalElement.setAttribute('aria-hidden', 'true');
          modalElement.removeAttribute('aria-modal');
          modalElement.removeAttribute('role');
          
          // Remover cualquier estilo inline que Bootstrap pueda haber añadido
          const allModals = document.querySelectorAll('.modal');
          allModals.forEach(modal => {
            (modal as HTMLElement).style.display = 'none';
          });
        }, 100);
      }
    }

    onSubmitCreate(): void {
      if (this.cargoForm.valid) {
          const chargeValue = this.cargoForm.get('charge')?.value;
          console.log("Nuevo cargo: "+chargeValue);
          this.cargoService.getAllCargos().subscribe(cargos => {
              const exists = cargos.some(cargo => cargo.charge === chargeValue);
  
              if (exists) {
                  Swal.fire({
                      title: 'Error',
                      text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
                      icon: 'error',
                      confirmButtonText: 'Aceptar'
                  }).then(() => {
                      this.closeModale('createChargeModal'); // Cerrar modal en caso de error
                  });
                  return;
              }
  
              this.cargoService.createCargo(this.cargoForm.value).subscribe({
                  next: () => {
                      Swal.fire({
                          title: '¡Creado!',
                          text: 'El cargo ha sido creado correctamente.',
                          icon: 'success',
                          confirmButtonText: 'Aceptar'
                      }).then(() => {
                          this.closeModale('createChargeModal'); // Cerrar modal tras éxito
                          this.cargoForm.reset();
                          this.loadCharges();
                      });
                  },
                  error: () => {
                      Swal.fire({
                          title: 'Error',
                          text: 'Ocurrió un error al crear el cargo.',
                          icon: 'error',
                          confirmButtonText: 'Aceptar',
                          confirmButtonColor: '#3085d6'
                      }).then(() => {
                          this.closeModale('createChargeModal'); // Cerrar modal en caso de error
                          this.cargoForm.reset();
                      });
                  }
              });
          });
      }
    }

  ERROR_MESSAGES = {
    'Cuil exists in the system': 'Ya existe un empleado con ese cuil',
    'Document exists in the system': 'Ya existe un empleado con ese dni',
    'Error in contact server': 'El servidor de contacto fallo, intente nuevamente mas tarde',
    'Error al guardar direccion': 'El servidor de direcciones fallo, intente nuevamente mas tarde',
    'Error in access server':'El servidor de accesos fallo, intente nuevamente mas tarde',
    'Charge not found':'El cargo seleccionado ya no existe en el sistema',
    'default': 'El servidor de empleados fallo , intente  nuevamente mas tarde .'

  };
}