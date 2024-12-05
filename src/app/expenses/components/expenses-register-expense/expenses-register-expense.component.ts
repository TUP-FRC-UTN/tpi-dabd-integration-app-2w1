import {
  Component,
  forwardRef,
  inject,
  Inject,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
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
import { PenaltiesComplaintDashboardComponent } from '../../../penalties/components/complaintComponents/penalties-complaint-dashboard/penalties-complaint-dashboard.component';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseRegisterCategoryComponent } from "../expenses-register-category/expenses-register-category.component";
import Shepherd from 'shepherd.js';
import { TutorialService } from '../../../common/services/tutorial.service';
import { ExpenseRegisterProviderComponent } from '../expense-register-provider/expense-register-provider.component';

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
export class ExpensesRegisterExpenseComponent implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('modalConfirmDelete') modalConfirmDelete!: ElementRef;
  @ViewChild(ExpenseCategoriesNgSelectComponent) expenseCategoriesNgSelect!: ExpenseCategoriesNgSelectComponent;
  @ViewChild(ExpenseProvidersNgSelectComponent) expenseProvidersNgSelect!: ExpenseProvidersNgSelectComponent;
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
  tutorialSubscription = new Subscription();
  private tour: Shepherd.Tour;

  private cdRef = inject(ChangeDetectorRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly fileService = inject(FileService);
  private readonly propietarioService = inject(OwnerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(private tutorialService: TutorialService, private modalNG: NgbModal) {
    this.expense = {
      description: '',
      providerId: 0,
      expenseDate: '',
      invoiceNumber: '',
      typeExpense: '',
      categoryId: 1,
      amount: 0,
      installments: 0,
      distributions: this.distributions,
      fileId: ''
    };

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        arrow: false,
        canClickTarget: false,
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 10,
      },
      keyboardNavigation: false,

      useModalOverlay: true,
    });
  }


  ngOnInit(): void {
    this.loadInitialData();
    this.checkForEditMode();
    //this.initializeDefaultExpense();

    this.tutorialSubscription = this.tutorialService.tutorialTrigger$.subscribe(
      () => {
        this.startTutorial();
      }
    );
  }

  ngOnDestroy(): void {
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
    this.tour.addStep({
      id: 'table-step',
      title: 'Alta de Gasto',
      text: 'Acá puede añadir un nuevo gasto ingresando todos los campos obligatorios del formulario. Procure colocar datos correctos.',
      attachTo: {
        element: '#addExpense',
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
      id: 'table-step',
      title: 'Subir archivos',
      text: 'Acá puede seleccionar y subir todos los archivos necesarios para justificar el gasto.',
      attachTo: {
        element: '#uploadFile',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Anterior',
          action: this.tour.back,
        },
        {
          text: 'Siguiente',
          action: this.tour.next,
        }
      ]
    });

    this.tour.addStep({
      id: 'table-step',
      title: 'Registrar',
      text: 'Acá puede clickear éste botón para realizar el alta de un gasto. Este sólo se habilitará al rellenar todos los campos obligatorios del formulario.',
      attachTo: {
        element: '#register',
        on: 'auto'
      },
      buttons: [
        {
          text: 'Finalizar',
          action: this.tour.complete,
        }
      ]
    });

    this.tour.start();
  }

  checkForEditMode() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Gasto';
        this.loadExpense(id);
      } else {
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
    this.router.navigate(["/main/expenses/view-expense-admin"])
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
        fileId: data.fileId
      };
      if (this.expense.fileId != null) {
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
      fileId: ''
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

  onKeyPress(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const currentValue = input.value;
    const newChar = event.key;
    const cursorPosition = input.selectionStart;

    // Permitir números y el punto decimal
    if (!/^\d$/.test(newChar) && newChar !== '.') {
      event.preventDefault();
      return;
    }

    // Evitar múltiple punto decimal
    if (newChar === '.' && currentValue.includes('.')) {
      event.preventDefault();
      return;
    }

    // Validar formato de decimales
    const newValue = this.getNewValue(currentValue, newChar, cursorPosition);
    if (!/^\d*\.?\d{0,2}$/.test(newValue)) {
      event.preventDefault();
      return;
    }

    // Validar rango permitido
    if (parseFloat(newValue) > 100) {
      event.preventDefault();
      return;
    }
  }


  onPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text');
    if (!pastedData) {
      return;
    }

    let cleanValue = pastedData.replace(/[^0-9.]/g, ''); // Permitir solo números y punto
    if (!/^\d*\.?\d{0,2}$/.test(cleanValue)) { // Limitar a 2 decimales
      cleanValue = '0';
    }

    const value = parseFloat(cleanValue);
    const finalValue = !isNaN(value) ? Math.min(100, Math.max(0, value)) : 0;
    input.value = finalValue.toFixed(2);

    const index = parseInt(input.getAttribute('data-index') || '0', 10);
    this.onProportionChange(finalValue, index);
  }

  private getNewValue(currentValue: string, newChar: string, cursorPosition: number | null): string {
    if (cursorPosition === null) return currentValue + newChar;

    return currentValue.slice(0, cursorPosition) + newChar + currentValue.slice(cursorPosition);
  }
  onProportionChange(value: number, index: number): void {
    if (value > 100) {
      this.distributions[index].proportion = 100;
    } else {
      this.distributions[index].proportion = parseFloat(value.toFixed(2));
    }
    this.expense.distributions = [...this.distributions];
    const isValid = this.validateTotalProportion();

    const totalPercentage = this.expense.distributions.reduce(
      (sum, dist) => sum + (Number(dist.proportion) || 0),
      0
    );
    if (totalPercentage >= 100) {
      console.log("Porcentaje mayor o igual a 100");
    }
  }

  onBlur(event: any, index: number): void {
    const value = this.distributions[index].proportion;
    if (value > 100) {
      this.distributions[index].proportion = 100;
    } else if (value < 1) {
      this.distributions[index].proportion = 1;
    } else {
      this.distributions[index].proportion = parseFloat(value.toFixed(2));
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
  validateNoZeroProportion(): boolean {
    return this.expense.distributions.every(
      distribution => distribution.proportion > 0
    );
  }

  public deleteDistribution(index: number): void {
    this.expense.distributions.splice(index, 1);
  }

  // prepareDistributions(): void {
  //   this.expense.distributions.forEach(d => {
  //     console.log(this.expense.distributions)
  //     d.proportion=d.proportion/100

  //   });
  // }
  // repairDistributions(): void {
  //   this.expense.distributions.forEach((distribution) => {
  //     distribution.proportion = distribution.proportion * 100;
  //   });
  // }
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
    return this.expense.categoryId > 0 ? true : false;
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
      return;
    }
    console.log(this.expense)
    if (this.expense.typeExpense === 'INDIVIDUAL') {
      if (!this.validateTotalProportion()) {
        return;
      }
      //this.prepareDistributions();
      console.log(this.expense)
    } else {
      // Si el tipo de gasto es COMUN o EXTRAORDINARIO, vaciamos las distribuciones
      this.expense.distributions = [];
    }
    this.isLoading = true;
    // Llamamos al servicio para registrar el gasto
    const serviceCall = this.isEditMode
      // Llamar al servicio de actualización si es true
      ? this.expenseService.updateExpense(this.expense, this.selectedFile ?? undefined)
      // Llamar al servicio de registro si es false
      : this.expenseService.registerExpense(this.expense, this.selectedFile ?? undefined);

    serviceCall.subscribe({
      next: (response) => {
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

  addCategory() {
    const modalElement = this.modalNG.open(ExpenseRegisterCategoryComponent);
    modalElement.componentInstance.eventSucces.subscribe(() => {
      this.showSuccessAlert('Se registró la categoría con éxito');
      this.expenseCategoriesNgSelect.reloadCategories();
    });
    modalElement.componentInstance.eventError.subscribe((errorMessage: string) => {
      this.showErrorAlert(errorMessage);
    });
  }
  addProvider(){
    const modalElement = this.modalNG.open(ExpenseRegisterProviderComponent,{
      size: 'xl'
    });
    modalElement.componentInstance.eventSucces.subscribe(() => {
      this.showSuccessAlert('Se registró el proveedor con exito');
      this.expenseProvidersNgSelect.reloadCategories();
    });
    modalElement.componentInstance.eventError.subscribe((errorMessage: string) => {
      this.showErrorAlert(errorMessage);
    });
  }
  showSuccessAlert(message: string) {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
    });
  }
}
