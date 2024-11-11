import { CommonModule, JsonPipe, NgFor } from '@angular/common';
import { Component, importProvidersFrom, Inject, OnInit } from '@angular/core';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { Ciudad, Provincia } from '../../Models/emp-provincia';
import { Observable } from 'rxjs';
import { Provider } from '../../../iep-inventory/models/provider';
import { Supplier } from '../../../iep-inventory/models/suppliers';
import { AddressDto, Charge, DocumentTypeEnum, PostEmployeeDto } from '../../Models/emp-post-employee-dto';
import { post } from 'jquery';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-iep-form-post-employees',
  standalone: true,
  imports: [FormsModule, CommonModule,NgSelectModule],
  templateUrl: './iep-form-post-employees.component.html',
  styleUrl: './iep-form-post-employees.component.css',
})
export class IEPFormPostEmployeesComponent implements OnInit {
  constructor(private serviceCombos: EmpPostEmployeeService , private router : Router) {}

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

  lunes:boolean=true;
  martes:boolean=true;
  miercoles:boolean=true;
  jueves:boolean=true;
  viernes:boolean=true;
  sabado:boolean=false;
  domingo:boolean=false;

  documentTypeEnum=DocumentTypeEnum

  userId: number=0
  nombre: string = '';
  apellido: string = '';
  cuil: string = '';
  documentType:DocumentTypeEnum=DocumentTypeEnum.DNI;
  dni?: string;
  telefono?: number;
  mail: string = '';
  calle: string = '';
  numeroCalle: number = 0;
  piso: number = 0;
  dpto: string = '';
  codigoPostal: string = '5000';
  salario?: number;
  horaSalida: string = '17:00';
  horaEntrada: string = '08:00';
  startTimeContract: string = new Date().toISOString().split('T')[0];

 

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
  localidadSelect?:Ciudad ;
  
  postDto:PostEmployeeDto = new PostEmployeeDto();
  adressDto:AddressDto =new AddressDto();
 
  isValidDni:boolean =true;

  isValidCuil:boolean=true;

  cambio() {
    console.log("Lunes:", this.lunes); // Debería mostrar true o false
    console.log("Martes:", this.martes); // Debería mostrar true o false
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
    // Si la fecha seleccionada es anterior a la actual, setea `isInvalidDate` en true
    this.invalidDate = false;
  }


  public validateCuil(){
    console.log("pre validando"+this.cuil)
    if(this.cuil!=null&&this.cuil!=undefined ){

      console.log("prevalidando2")
        this.validateCuil$ = this.serviceCombos.validateCuil(this.cuil)
        this.validateCuil$.subscribe({
          next: response => {
            console.log("respuestaa"+response)
            this.isValidCuil = !response;
            console.log(this.isValidCuil)



    // Verificar cada control en el formulario y registrar errores
 //   Object.keys(form.controls).forEach(field => {
   //   const control = form.controls[field];
      
   //   if (control.invalid) {
   //       console.log(`Campo '${field}' inválido. Errores:`, control.errors);
   //   }
  //  });

   
      }
       
            })

    }


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
          this.adressDto.apartment=this.dpto
          this.adressDto.floor=this.piso
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
            this.postDto.userId=this.userId

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


  public loadCharges(): void {
    this.serviceCombos.getCharges().subscribe({
      next: (c) => {
        this.cargos = c;
        console.log("cargoss"+c)
      },
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
   this.codigoPostal = '5000';
   this.salario=0
   this.horaSalida = '17:00';
   this. horaEntrada = '08:00';
   this.startTimeContract = new Date().toISOString().split('T')[0];

  }

 cerrarModal(){
  this.showModal=!this.showModal
 }

  ngOnInit(): void {
   this.loadSupplier();
   this.loadProvincias();
   this.loadCharges();
   console.log(this.provincias);
   
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
