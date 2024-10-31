import { CommonModule, JsonPipe, NgFor } from '@angular/common';
import { Component, importProvidersFrom, Inject, OnInit } from '@angular/core';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import { Ciudad, Provincia } from '../../models/emp-provincia';
import { Observable } from 'rxjs';
import { Provider } from '../../models/provider';
import { Supplier } from '../../models/suppliers';
import { AddressDto, Charge, DocumentTypeEnum, PostEmployeeDto } from '../../models/emp-post-employee-dto';
import { post } from 'jquery';
@Component({
  selector: 'app-iep-form-post-employees',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './iep-form-post-employees.component.html',
  styleUrl: './iep-form-post-employees.component.css',
})
export class IEPFormPostEmployeesComponent implements OnInit {
  constructor(private serviceCombos: EmpPostEmployeeService) {}

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

  lunes:boolean=false;
  martes:boolean=false;
  miercoles:boolean=false;
  jueves:boolean=false;
  viernes:boolean=false;
  sabado:boolean=false;
  domingo:boolean=false;

  documentTypeEnum=DocumentTypeEnum

  userId: number=0
  nombre: string = '';
  apellido: string = '';
  cuil: string = '';
  documentType:DocumentTypeEnum|undefined;
  dni?: string;
  telefono?: number;
  mail: string = '';
  calle: string = '';
  numeroCalle: number = 0;
  piso: number = 0;
  dpto: string = '';
  codigoPostal: string = '';
  salario?: number;
  horaSalida: string = '';
  horaEntrada: string = '';
  startTimeContract?: Date;

 

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
  provinciaSelect? : Provincia ;
  localidadSelect?:Ciudad ;
  
  postDto:PostEmployeeDto = new PostEmployeeDto();
  adressDto:AddressDto =new AddressDto();
 
  isValidDni:boolean =true;

  isValidCuil:boolean=true;




  

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


  public validateCuil(form:NgForm){
    console.log("pre validando"+this.cuil)
    if(this.cuil!=null&&this.cuil!=undefined ){

      console.log("prevalidando2")
        this.validateCuil$ = this.serviceCombos.validateCuil(this.cuil)
        this.validateCuil$.subscribe({
          next: response => {
            console.log("respuestaa"+response)
            this.isValidCuil = !response;
            console.log(this.isValidCuil)
            console.log(form.valid)



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
          this.adressDto.postal_code=this.codigoPostal
          this.adressDto.apartment=this.dpto
          this.adressDto.floor=this.piso
          this.adressDto.number_street=this.numeroCalle

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

            this.postDto.contractStartTime=this.startTimeContract
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
            this.createEmployee$.subscribe({
              next: response => {
                this.success = true;
                this.successMessage = "Empleado guardado.Credenciales de acceso habilitadas.";
                console.log("PASO: ", response);
                this.showModal=true;
              },
              //formatear estos errores y mostrar en modal succes y error
              error: error => {
                const errorKey = error.error.message as keyof typeof this.ERROR_MESSAGES; // Asegúrate de que sea del tipo correcto
                this.errorMessage = this.ERROR_MESSAGES[errorKey] || this.ERROR_MESSAGES['default'];
                this.success = false;
                console.log("Hola error "+this.errorMessage)
                console.log("error:"+error.error.message)
                console.error(error);
                this.showModal=true;
              
              },
              complete: () => {
                console.log('Petición completada');
                this.showModal=true;
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


 public loadLocalidades():void{

    if(this.provinciaSelect!= null){
    this.localidades=this.provinciaSelect?.ciudades
    this.localidadSelect=undefined
    }
  }

  
  public resetForm(form: NgForm) {
    form.reset();
    this.errorMessage = '';
    this.showModal=false;
    this.successMessage = '';
    this.success=false;
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
