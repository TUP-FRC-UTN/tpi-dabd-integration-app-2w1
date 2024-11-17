
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Ciudad, Provincia } from '../../Models/emp-provincia';
import { Charge } from '../../Models/emp-post-employee-dto';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmpPutEmployeesResponse } from '../../../iep-inventory/models/EmpPutEmployeesResponse';
import { EmpPutEmployeeRequest } from '../../../iep-inventory/models/EmpPutEmployeeRequest';
import { UsersMockIdService } from '../../../common-services/users-mock-id.service';

@Component({
  selector: 'app-iep-put-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgSelectModule],
  templateUrl: './iep-put-employees.component.html',
  styleUrls: ['./iep-put-employees.component.css']
})
export class IepPutEmployeesComponent implements OnInit {
  // Variables para datos personales
  userId: number=0;
  nombre: string = '';
  apellido: string = '';
  dni: string = '';
  cuil: string = '';
  // Variables para contacto
  telefono: string = '';
  mail: string = '';
  // Variables para dirección
  provincias: Provincia[] = [];
  provinciaSelect?: Provincia;
  ciudad: Ciudad[] = [];
  localidadSelect?: Ciudad;
  calle: string = '';
  numeroCalle: number = 0;
  piso?: number;
  dpto?: string;
  codigoPostal: string = '';
  // Variables para empleado tercerizado
  terciorizedEmployee: boolean = false;
  license: boolean = false;
  suppliers: any[] = [];
  selectedSupplier?: any;
  // Variables para cargo y salario
  cargos: Charge[] = [];
  cargoSelected?: Charge;
  salario: number = 0;
  startTimeContract?: string;
  // Variables para días laborales
  lunes: boolean = false;
  martes: boolean = false;
  miercoles: boolean = false;
  jueves: boolean = false;
  viernes: boolean = false;
  sabado: boolean = false;
  domingo: boolean = false;
  // Variables para horarios
  horaEntrada: string = '';
  horaSalida: string = '';
  private employeeId: number = 0;
  invalidDate: Boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpListadoEmpleadosService,
    private postEmployeeService: EmpPostEmployeeService,
    private mockid: UsersMockIdService
  ) {}
  ngOnInit(): void {
    this.loadProvincias();
    this.loadSuppliers();
    this.loadCargos();
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      this.loadEmployeeData();
    });
  }
  loadEmployeeData(): void {
    this.empleadoService.getEmployeeById2(this.employeeId).subscribe({
      next: (employee : EmpPutEmployeesResponse) => {
        // Datos personales
        this.nombre = employee.name;
        this.apellido = employee.surname;
        this.dni = employee.documentValue;
        this.cuil = employee.cuil;
        // Datos laborales
        this.salario = employee.salary;
        // this.startTimeContract = employee.contractStartTime;
        if (employee.contractStartTime?.length === 3) {
          const [year, month, day] = employee.contractStartTime;
          const formattedMonth = month.toString().padStart(2, '0');
          const formattedDay = day.toString().padStart(2, '0');
          this.startTimeContract = `${year}-${formattedMonth}-${formattedDay}`;
        }
        this.license = employee.license;
        if (employee.startTime?.length === 2) {
          const [hour, minute] = employee.startTime;
          this.horaEntrada = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        if (employee.endTime?.length === 2) {
          const [hour, minute] = employee.endTime;
          this.horaSalida = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        // Días laborales
        this.lunes = employee.mondayWorkday;
        this.martes = employee.tuesdayWorkday;
        this.miercoles = employee.wednesdayWorkday;
        this.jueves = employee.thursdayWorkday;
        this.viernes = employee.fridayWorkday;
        this.sabado = employee.saturdayWorkday;
        this.domingo = employee.sundayWorkday;
        // Cargo
        if (employee.charge) {
          const cargoEncontrado = this.cargos.find(c => c.id === employee.charge.id);
          if (cargoEncontrado) {
            this.cargoSelected = cargoEncontrado;
          }
        }
        // Empleado tercerizado
        if (employee.supplierId !== null) {
          this.terciorizedEmployee = true;
          const proveedorEncontrado = this.suppliers.find(s => s.id === employee.supplierId);
          if (proveedorEncontrado) {
            this.selectedSupplier = proveedorEncontrado;
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del empleado:', error);
      }
    });
  }
  loadProvincias(): void {
    this.postEmployeeService.getProvinces().subscribe({
      next: (data) => this.provincias = data,
      error: (error) => console.error('Error al cargar provincias:', error)
    });
  }
  loadLocalidades(): void {
    // Esta función se llama cuando cambia la provincia seleccionada
    // La lógica ya está implementada en el template con el ngModel
  }
  loadSuppliers(): void {
    this.postEmployeeService.getProviders().subscribe({
      next: (data) => this.suppliers = data,
      error: (error) => console.error('Error al cargar proveedores:', error)
    });
  }
  loadCargos(): void {
    this.postEmployeeService.getCharges().subscribe({
      next: (data) => this.cargos = data,
      error: (error) => console.error('Error al cargar cargos:', error)
    });
  }
  onSubmit(form: any): void {
    if (form.valid) {
      const employeeData = this.createEmployeeData();
      console.log('Datos a enviar:', JSON.stringify(employeeData, null, 2));
      console.log('Validación de campos obligatorios:');
      console.log('name:', employeeData.name);
      console.log('surname:', employeeData.surname);
      console.log('documentValue:', employeeData.documentValue);
      console.log('cuil:', employeeData.cuil);
      console.log('charge:', employeeData.charge);
      console.log('startTime format:', employeeData.startTime);
      console.log('endTime format:', employeeData.endTime);
      console.log('addressDto:', employeeData.addressDto);
      console.log('telephoneValue:', employeeData.telephoneValue);
      console.log('emailValue:', employeeData.emailValue);
      console.log(employeeData);
      this.postEmployeeService.updateEmployee(employeeData).subscribe({
        next: () => this.showAlert('success', 'Empleado actualizado exitosamente'),
        error: (error) => {
          console.log('Error response:', error);
          this.handleUpdateError(error);
      }
      });
    }
  }
  private createEmployeeData(): EmpPutEmployeeRequest {
    
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const formatTime = (timeString: string): string => {
      if (!timeString) return '';
      return timeString;
    };
    const addressDto = {
      street: this.calle || '',
      numberStreet: this.numeroCalle || 0,
      apartment: this.dpto || '',
      floor: this.piso || 0,
      postalCode: this.codigoPostal  || '',
      city: this.provinciaSelect?.nombre || '',
      locality: this.localidadSelect?.nombre || ''
    };
    
    return {
      id: this.employeeId,
      name: this.nombre || '',            
      surname: this.apellido || '',     
      documentValue: this.dni || '',    
      cuil: this.cuil || '',          
      charge: this.cargoSelected?.id || 0,
      contractStartTime: formatDate(this.startTimeContract || ''),
      salary: this.salario || 0,
      license: this.license || false,
      mondayWorkday: this.lunes || false,   
      tuesdayWorkday: this.martes || false,  
      wednesdayWorkday: this.miercoles || false, 
      thursdayWorkday: this.jueves || false, 
      fridayWorkday: this.viernes || false,  
      saturdayWorkday: this.sabado || false, 
      sundayWorkday: this.domingo || false, 
      startTime: formatTime(this.horaEntrada), 
      endTime: formatTime(this.horaSalida),   
      supplierId: this.terciorizedEmployee ? this.selectedSupplier?.id : 0,
      addressDto ,                         
      telephoneValue: this.telefono || '', 
      emailValue: this.mail || '',         
      userId: this.mockid.getMockId() || 0       
    };
  }
  private showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: type === 'success' ? 'Confirmación' : 'Error',
      text: message,
      confirmButtonText: 'Aceptar'
    }).then(() => {
      if (type === 'success') {
        this.router.navigate(['/home/employee-list']);
      }
    });
  }
  private handleUpdateError(error: any): void {
    const errorMessage = error.status === 404 ? 'Empleado no encontrado' : 
                        error.status === 500 ? 'Error al actualizar empleado' : 
                        error.message;
    this.showAlert('error', errorMessage);
    console.error('Error al actualizar el empleado:', error);
  }
  validateDate(): void {
    if (this.startTimeContract) {
      const today = new Date().setHours(0, 0, 0, 0);
      const selectedDate = new Date(this.startTimeContract).setHours(0, 0, 0, 0);
      this.invalidDate = selectedDate < today;
    } else {
      this.invalidDate = false;
    }
  }
  changeTerceorized(): void {
    this.terciorizedEmployee = !this.terciorizedEmployee;
  }
  cancelar(): void {
    this.router.navigate(['/home/employee-list']);
  }
}
