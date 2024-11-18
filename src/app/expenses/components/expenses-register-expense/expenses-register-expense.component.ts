import {
  Component,
  forwardRef,
  inject,
  Inject,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Distributions } from '../../models/distributions';
import { Expense } from '../../models/expense';
import { Owner } from '../../models/owner';
import { ExpenseCategory } from '../../models/expense-category';
import { ExpenseService } from '../../services/expensesServices/expense.service';
import { OwnerService } from '../../services/ownerServices/owner.service';
import { ProviderService } from '../../services/providerServices/provider.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Provider } from '../../models/provider';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ExpenseGetById } from '../../models/expenseGetById';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import Swal from 'sweetalert2';
import { ExpenseCategoriesNgSelectComponent } from "../expense-categories-ng-select/expense-categories-ng-select.component";
import { ExpenseProvidersNgSelectComponent } from "../expense-providers-ng-select/expense-providers-ng-select.component";
import { ExpensesTypeExpenseNgSelectComponent } from "../expenses-type-expense-ng-select/expenses-type-expense-ng-select.component";
import { ExpensesOwnersNgSelectComponent } from "../expenses-owners-ng-select/expenses-owners-ng-select.component";
import { FileService } from '../../services/expenseFileService/file.service';

@Component({
  selector: 'app-expenses-register-expense',
  templateUrl: './expenses-register-expense.component.html',
  standalone: true,
  providers: [ExpenseService, OwnerService, ProviderService],
  imports: [
    FormsModule,
    DatePipe,
    NgFor,
    NgIf,
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    CurrencyMaskModule,
    ExpenseCategoriesNgSelectComponent,
    ExpenseProvidersNgSelectComponent,
    ExpensesTypeExpenseNgSelectComponent,
    ExpensesOwnersNgSelectComponent
],
  styleUrls: ['./expenses-register-expense.component.css'],
})
export class ExpensesRegisterExpenseComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('modalConfirmDelete') modalConfirmDelete!: ElementRef;
  // Modal states
  showModal = false;
  modalMessage = '';
  modalTitle = '';
  modalType: 'success' | 'error' = 'success';

  // Form validation
  formSubmitted = false;
  touchedFields: { [key: string]: boolean } = {};

  distributions: Distributions[] = [];
  expense: Expense;
  selectedFile: File | null = null;
  listOwner: Owner[] = [];
  selectedOwnerId: number = 0;
  listProviders: Provider[] = [];
  today: string = '';
  alreadysent = false;
  expenseCategoryList: ExpenseCategory[] = [];
  isEditMode = false;
  pageTitle = 'Registrar Gasto';

  private cdRef = inject(ChangeDetectorRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly fileService = inject(FileService);
  private readonly propietarioService = inject(OwnerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  constructor(){
    this.expense= {
        description: '',
        providerId: 0,
        expenseDate: '',
        invoiceNumber: '',
        typeExpense: '',
        categoryId: 1,
        amount: 0,
        installments: 0,
        distributions: this.distributions,
        fileId:''
      };
  }
  ngOnInit(): void {
    this.loadInitialData();
    this.checkForEditMode();
    //this.initializeDefaultExpense();
  }
  checkForEditMode() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Gasto';
        this.loadExpense(id);
      }else{
        this.initializeDefaultExpense();
      }
    });
  }
  removeFile(): void {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
  }
  
  onFieldBlur(fieldName: string, control: any) {
    this.touchedFields[fieldName] = true;
    control.markAsTouched();
  }

  isFieldValid(fieldName: string, control: any): boolean {
    return !control.errors && control.touched;
  }

  isFieldInvalid(fieldName: string, control: any): boolean {
    return (control.errors && control.touched) || 
           (this.formSubmitted && control.errors);
  }

  getFieldClass(fieldName: string, control: any): any {
    return {
      'is-valid': this.isFieldValid(fieldName, control),
      'is-invalid': this.isFieldInvalid(fieldName, control)
    };
  }

  
  redirectToViewAdmin() {
    this.router.navigate(["/viewExpenseAdmin"])
    }
    loadFile(fileId: string): void {
      this.fileService.getFile(fileId).subscribe({
        next: ({ blob, filename }) => {
          const file = new File([blob], filename, { type: blob.type });
          this.selectedFile = file;
  
          console.log('Archivo asignado a selectedFile:', this.selectedFile);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          Swal.fire({
            title: '¡Error!',
            text: 'No se pudo cargar el archivo. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#f44336',
            background: '#ffffff',
            customClass: {
              title: 'text-xl font-medium text-gray-900',
              htmlContainer: 'text-sm text-gray-600',
              confirmButton: 'px-4 py-2 text-white rounded-lg',
              popup: 'swal2-popup'
            }
          });
        }
      });
    }
  private loadExpense(id: number): void {
    this.expenseService.getById(id).subscribe({
      next: (expenseData: ExpenseGetById) => {
        console.log('Datos recibidos:', expenseData); // Para debug
        // Mapear la respuesta al modelo Expense
        this.mapExpenseDataToModel(expenseData);
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading expense', error);
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo cargar el gasto. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#f44336', // Color rojo para el botón de error
          background: '#ffffff',
          customClass: {
            title: 'text-xl font-medium text-gray-900',
            htmlContainer: 'text-sm text-gray-600',
            confirmButton: 'px-4 py-2 text-white rounded-lg',
            popup: 'swal2-popup'
          }
        });
        this.router.navigate(['/expenses']);
      }
    });
  }

  private mapExpenseDataToModel(data: ExpenseGetById): void {
    if (!data) {
      console.error('No se recibieron datos del gasto');
      return;
    }

    try {
      
      // Determinar el número de cuotas basado en installmentList
      const installments = data.installmentList?.length || 1;
      debugger
      // Mapear al modelo Expense con validaciones para cada campo
      this.expense = {
        id: data.id ?? 0,
        description: data.description,
        providerId: data.providerId ?? 0,
        expenseDate: data.expenseDate ?? new Date().toISOString(),
        invoiceNumber: data.invoiceNumber, // Convertir a string de manera segura
        typeExpense: this.mapExpenseType(data.expenseType ?? 'COMUN'),
        categoryId: data.categoryId,
        amount: data.amount ?? 0,
        installments: installments,
        distributions: this.mapDistributions(data.distributionList),   
        fileId:data.fileId
      };
      if(this.expense.fileId!=null){
        this.loadFile(this.expense.fileId)
      }
      console.log('Expense mapeado:', this.expense); // Para debug
    } catch (error) {
      console.error('Error durante el mapeo:', error);
      // Inicializar con valores por defecto en caso de error
      this.initializeDefaultExpense();
    }
  }
  private mapDistributions(distributionList: any[]): Distributions[] {
    if (!distributionList?.length) return []; 
    return distributionList.map(dist => ({
      ownerId: dist.ownerId,
      proportion: (dist.proportion * 100) // Convertir a porcentaje
    }));
  }

  private initializeDefaultExpense(): void {
    this.expense = {
      description: '',
      providerId: 0,
      expenseDate: this.formatDate(new Date().toISOString()),
      invoiceNumber: '',
      typeExpense: 'COMUN',
      categoryId: 1,
      amount: 0,
      installments: 1,
      distributions: [],
      fileId:''
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Si la fecha no es válida, retornar la fecha actual
        const today = new Date();
        return this.formatDateToString(today);
      }
      return this.formatDateToString(date);
    } catch {
      // En caso de error, retornar la fecha actual
      const today = new Date();
      return this.formatDateToString(today);
    }
  }
  confirmCancel() {
   this.openModal(this.modalConfirmDelete)
    }
  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapExpenseType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'COMUN': 'COMUN',
      'INDIVIDUAL': 'INDIVIDUAL',
      'EXTRAORDINARIO': 'EXTRAORDINARIO'
    };
    return typeMap[type] || type;
  }
  loadInitialData() {
    this.initialForm();
  }
  //Inicializa el formulario con valores deseados
  initialForm() {
    this.loadOwners();
    // this.loadProviders();
    this.loadDate();
    //this.loadExpenseCategories();
    this.selectedOwnerId = 0;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  allowOnlyPositiveNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const inputValue: string = (event.target as HTMLInputElement).value;

    // Permitir números, la tecla de borrar (backspace), y el punto decimal (.)
    if (
      (charCode < 48 || charCode > 57) && // No es un número
      charCode !== 46 && // Permitir el punto decimal
      charCode !== 8 // Permitir borrar
    ) {
      event.preventDefault();
    }

    // Evitar que se ingrese más de un punto decimal
    if (charCode === 46 && inputValue.includes('.')) {
      event.preventDefault();
    }
    if (inputValue.includes('.')) {
      const decimalPart = inputValue.split('.')[1];
      if (decimalPart && decimalPart.length >= 2) {
        event.preventDefault(); // No permitir más de 2 dígitos después del punto
      }
    }
  }
  //Metodo para permitir solo numeros y la letra F en invoiceNumber
  onInvoiceNumberInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key.toLowerCase();
    const cursorPosition = input.selectionStart || 0;
    const currentValue = this.expense.invoiceNumber || '';

    // Permitir teclas de control siempre
    if (['backspace', 'delete', 'arrowleft', 'arrowright', 'tab'].includes(key.toLowerCase())) {
      return;
    }

    // Prevenir cualquier entrada que no sea número o 'f'
    if (!/^\d|f$/.test(key)) {
      event.preventDefault();
      return;
    }

    // Manejo especial para la letra 'f'
    if (key === 'f') {
      // Solo permitir 'f' si:
      // 1. El campo está vacío y el cursor está al inicio, o
      // 2. Estamos reemplazando todo el contenido (selección completa)
      const isFullSelection = input.selectionStart === 0 && input.selectionEnd === currentValue.length;
      
      if (!isFullSelection && (cursorPosition !== 0 || currentValue.includes('F'))) {
        event.preventDefault();
        return;
      }

      // Convertir a mayúscula
      event.preventDefault();
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      this.expense.invoiceNumber = 
        'F' + 
        currentValue.substring(end).replace(/^F/, '');
      
      // Mantener el cursor en la posición correcta
      setTimeout(() => {
        input.setSelectionRange(1, 1);
      }, 0);
      return;
    }

    // Para números
    if (/^\d$/.test(key)) {
      // Si hay una 'F' al inicio y estamos en posición 0, mover el cursor después de la F
      if (currentValue.startsWith('F') && cursorPosition === 0) {
        event.preventDefault();
        setTimeout(() => {
          const newValue = currentValue + key;
          this.expense.invoiceNumber = newValue;
          input.setSelectionRange(newValue.length, newValue.length);
        }, 0);
      }
    }
  }

  // Método para manejar el pegado de texto en invoiceNumber
  onInvoiceNumberPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const input = event.target as HTMLInputElement;
    const currentValue = this.expense.invoiceNumber || '';
    
    // Limpiar el texto pegado (solo números y posiblemente una F al inicio)
    let cleanedText = pastedText.replace(/[^0-9f]/gi, '');
    
    // Manejar la F inicial si existe
    if (cleanedText.toLowerCase().includes('f')) {
      cleanedText = cleanedText.replace(/f/gi, '');
      if (input.selectionStart === 0 && !currentValue.includes('F')) {
        cleanedText = 'F' + cleanedText;
      }
    }
    
    // Si ya hay una F al inicio, preservarla
    if (currentValue.startsWith('F') && input.selectionStart! > 0) {
      this.expense.invoiceNumber = 
        'F' + cleanedText;
    } else {
      this.expense.invoiceNumber = cleanedText;
    }
  }

  loadDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.expense.expenseDate = `${yyyy}-${mm}-${dd}`;
    this.today = `${yyyy}-${mm}-${dd}`;
    console.log(this.today);
    console.log(this.expense.expenseDate);
  }

  private loadOwners() {
    this.propietarioService.getOwners().subscribe({
      next: (owners: Owner[]) => {
        this.listOwner = owners;
      },
    });
  }
  public addDistribution(): void {
    if (this.selectedOwnerId !== 0) {
      const exists = this.expense.distributions.some(
        (distribution) => distribution.ownerId === this.selectedOwnerId
      );
      if (!exists) {
        this.alreadysent = false;
        const newDistribution = {
          ownerId: this.selectedOwnerId,
          proportion: 0,
        };
        this.expense.distributions.push(newDistribution);
      } else {
        this.alreadysent = true;
      }
      this.selectedOwnerId = 0;
    }
  }

  public getOwnerName(ownerId: number): string {
    const owner = this.listOwner.find((o) => o.id == ownerId);
    return owner ? `${owner.name} ${owner.lastname}` : '';
  }

  onProportionChange(value: number, index: number): void {
    // Mantener el valor actualizado al escribir, pero limitarlo en el evento `blur`
    this.distributions[index].proportion = value;
    this.validateTotalProportion();
  }

  onBlur(event: any, index: number): void {
    const value = this.distributions[index].proportion;
    if (value > 100) {
      this.distributions[index].proportion = 100;
    } else if (value < 1) {
      this.distributions[index].proportion = 1;
    }
    this.validateTotalProportion();
  }

  validateTotalProportion(): boolean {
    const total = this.expense.distributions.reduce(
      (sum, distribution) => sum + distribution.proportion,
      0
    );
    return total === 100;
  }

  public deleteDistribution(index: number): void {
    this.expense.distributions.splice(index, 1);
  }

  prepareDistributions(): void {
    this.expense.distributions.forEach((distribution) => {
      distribution.proportion = distribution.proportion / 100;
    });
  }
  repairDistributions(): void {
    this.expense.distributions.forEach((distribution) => {
      distribution.proportion = distribution.proportion * 100;
    });
  }
  clearForm(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdRef.detectChanges();
    this.form.controls['amount'].markAsUntouched();
    this.form.controls['description'].markAsUntouched();
    this.form.controls['invoiceNumber'].markAsUntouched();
    this.form.controls['amount'].markAsPristine();
    this.form.controls['description'].markAsPristine();
    this.form.controls['invoiceNumber'].markAsPristine();
    this.formSubmitted = false;
    this.selectedFile = null;
    this.initialForm();
  }
  validateForm(): boolean {
    this.formSubmitted = true;

    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.controls[key];
        control.markAsTouched();
        this.touchedFields[key] = true;
      });
      this.showErrorModal('Por favor, complete todos los campos requeridos.');
      return false;
    }

    if (this.expense.typeExpense === 'INDIVIDUAL') {
      if (this.expense.distributions.length === 0) {
        this.showErrorModal('Debe agregar al menos un propietario');
        return false;
      }
      if (!this.validateTotalProportion()) {
        this.showErrorModal('La suma de las proporciones debe ser igual a 100');
        return false;
      }
    }

    return true;
  }
  isCategoryValid(): boolean {
    // Probar esto
    return this.expense.categoryId>0 ? true : false;
  }


  showErrorModal(message: string): void {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.modalType = 'error';
    this.showModal = true;
  }

  closeModal1(): void {
    this.showModal = false;
    // Si fue un registro exitoso, limpiamos el formulario
    if (this.modalType === 'success') {
      this.clearForm();
    }
  }
  isLoading = false;
  save(): void {
    
    if (!this.validateForm()) {
      return; // Evita múltiples envíos
    }
    if (this.expense.typeExpense === 'INDIVIDUAL') {
      if (!this.validateTotalProportion()) {
        return;
      }
      this.prepareDistributions();
    } else {
      // Si el tipo de gasto es COMUN o EXTRAORDINARIO, vaciamos las distribuciones
      this.expense.distributions = [];
    }
    this.isLoading = true;
    debugger
    // Llamamos al servicio para registrar el gasto
    const serviceCall = this.isEditMode
    // Llamar al servicio de actualización si es true
    ? this.expenseService.updateExpense(this.expense, this.selectedFile ?? undefined)
    // Llamar al servicio de registro si es false
    : this.expenseService.registerExpense(this.expense, this.selectedFile ?? undefined);

    serviceCall.subscribe({
      next: (response) => {
        debugger
        if (response && response.status === 200) {
          // Mensaje de éxito estándar
          Swal.fire({
            icon: 'success',               // Icono de éxito
            title: 'Éxito',                // Título del mensaje
            text: 'Los cambios se guardaron correctamente', // Mensaje de confirmación
          }).then(() => {
            // Redirigir después de confirmar el alert
            this.router.navigate(['/main/expenses/view-expense-admin']);
          });
    
          this.clearForm();
          this.isLoading = false;
        } else {
          console.log('Respuesta inesperada', response);
          this.showErrorAlert('Respuesta inesperada del servidor');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error(`Error al ${this.isEditMode ? 'actualizar' : 'registrar'} el gasto`, error);
        this.isLoading = false;
        const defaultErrorMessage = 'Error al procesar la solicitud.';

        if (this.isEditMode) {
          // Errores específicos para actualización
          switch (error.status) {
            case 400:
              this.showErrorAlert('Los datos de actualización son incorrectos. Verifique los campos.');
              break;
            case 401:
              this.showErrorAlert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.');
              break;
            case 404:
              this.showErrorAlert('El gasto que intenta actualizar ya no existe.');
              break;
            case 409:
              this.showErrorAlert('El gasto fue modificado por otro usuario. Por favor, recargue la página.');
              break;
            case 422:
              this.showErrorAlert('Error en las distribuciones. Verifique que los datos sean correctos.');
              break;
            case 500:
              this.showErrorAlert('Error en el servidor. Por favor, intente más tarde.');
              break;
            default:
              this.showErrorAlert(defaultErrorMessage);
          }
        } else {
          this.isLoading = false;
          // Errores específicos para nuevo registro
          switch (error.status) {
            case 400:
              this.showErrorAlert('La expensa ya esta registrada. Verifique los campos.');
              break;
            case 401:
              this.showErrorAlert('No tiene autorización. Por favor, inicie sesión.');
              break;
            case 409:
              this.showErrorAlert('Ya existe un gasto con este número de factura.');
              break;
            case 422:
              this.showErrorAlert('Error en las distribuciones. La suma debe ser 100%.');
              break;
            case 500:
              this.showErrorAlert('Error en el servidor. Por favor, intente más tarde.');
              break;
            default:
              this.showErrorAlert(defaultErrorMessage);
          }
        }
      },
      complete: () => {
        console.log('Operación completada');
        this.isLoading = false;
      }
    });
    
  }
  showErrorAlert(message: string) {
    Swal.fire({
      title: '¡Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#f44336',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      }
    });
  }
  openModal(modal: ElementRef | HTMLDivElement) {
    console.log(modal)
    const element = modal instanceof ElementRef ? modal.nativeElement : modal;
    element.style.display = 'block';
    element.classList.add('show');
    document.body.classList.add('modal-open');
    this.cdRef.detectChanges();
  }
  closeModal(modal: ElementRef | HTMLDivElement) {
    const element = modal instanceof ElementRef ? modal.nativeElement : modal;
    element.style.display = 'none';
    element.classList.remove('show');
    document.body.classList.remove('modal-open');
    this.cdRef.detectChanges();
  }


}
