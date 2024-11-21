import { Component, OnDestroy, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { AccessVisitor, UserType } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { Subscription } from 'rxjs';
import { AccessVisitorsRegisterServiceService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service/access-visitors-register-service.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../../users/users-servicies/auth.service';

@Component({
  selector: 'app-access-visitors-excel-reader',
  standalone: true,
  imports: [],
  templateUrl: './access-visitors-excel-reader.component.html',
  styleUrl: './access-visitors-excel-reader.component.css'
})
export class AccessVisitorsExcelReaderComponent implements OnInit, OnDestroy {
  subscription = new Subscription();
  documentTypes: string[] = ['DNI', 'Pasaporte', 'CUIT'];
  userTypes: UserType[] = [];

  constructor(
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
    private visitorService: AccessVisitorsRegisterServiceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userTypeSubscription = this.visitorHttpService.getUsersType().subscribe({
      next: v => {
        this.userTypes = v.filter(ut => !['Taxi', 'Delivery'].includes(ut.description));
      },
      error: e => {
        console.error('Error al cargar tipos de usuarios:', e);
      }
    });

    this.subscription = userTypeSubscription;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fileInputed(event: any) {
    const reader = new FileReader();
    reader.onload = () => {
      const workBook = XLSX.read(reader.result);
      const visitors: AccessVisitor[] = this.mapWorkbookToVisitors(workBook);

      if (visitors.length < 1)
        return;
      
      visitors.forEach(
        v => {
          this.visitorService.addVisitorsTemporalsSubject(v);
        }
      );
    }
    reader.readAsArrayBuffer(event.target.files[0]);
  }

  mapWorkbookToVisitors(workBook: XLSX.WorkBook): AccessVisitor[] {
    const rows = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]) as any[];
    let visitors: AccessVisitor[] = [];
    let errors: string[] = [];

    const headerErrors: string[] = this.getHeadersErrors(workBook.Sheets[workBook.SheetNames[0]])

    if (headerErrors.length > 0) {
      this.displayHeaderError(headerErrors);
      return [];
    }
    let emptyRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (this.rowIsEmpty(row))
        emptyRows++;

      const visitor: AccessVisitor = {
        firstName: row['Nombre'],
        lastName: row['Apellido'],
        document: row['Documento'],
        documentType: this.getDocumentTypeId(row['Tipo Documento']),
        email: '',
        hasVehicle: false,
        userType: this.getUserTypeId(row['Tipo Visitante']),
        neighborName: this.authService.getUser().name,
        neighborLastName: this.authService.getUser().lastname
      };
      const visitorErrors = this.getVisitorErrors(visitor, row.__rowNum__);
      if (visitorErrors.length > 0) {
        errors = errors.concat(visitorErrors);
        continue;
      }
      visitors.push(visitor);
    }

    if (emptyRows == rows.length) {
      this.displaySheetEmptyError();
      return [];
    }

    if (errors.length > 0) {
      this.displayRowsErrors(errors);
      return [];
    }
    return visitors;
  }

  downloadTemplate() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.getSheetData());
    worksheet['!cols'] = [
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 15 }, // Documento
      { wch: 20 }, // Tipo Documento
      { wch: 20 }, // Tipo Visitante
      { wch: 10 },
      { wch: 25 }, // Tipos de visitantes
      { wch: 25 }  // Tipos de documentos
    ];
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
    XLSX.writeFile(workbook, `lista_invitados.xlsx`);
  }

  getSheetData(): string[][] {
    let sheetData = [['Nombre', 'Apellido', 'Documento', 'Tipo Documento', 'Tipo Visitante', '', 'Tipos de visitantes', 'Tipos de documentos']];
    const maxItems = Math.max(this.userTypes.length, this.documentTypes.length);
    for (let i = 0; i < maxItems; i++) {
      const rowData = ['', '', '', '', '', '', this.userTypes[i].description, this.documentTypes[i]];
      sheetData.push(rowData);
    }
    return sheetData;
  }

  rowIsEmpty(row: any): boolean {
    return !row['Nombre'] && !row['Apellido'] && !row['Documento'] && !row['Tipo Documento'] && !row['Tipo Visitante'];
  }

  displaySheetEmptyError() {
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar visitantes.',
      text: 'La planilla no puede estar vacia.',
      confirmButtonText: 'Entendido'
    });
  }
  

  displayRowsErrors(rowErrors: string[]) {
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar visitantes.',
      html: this.getRowsErrorsHtml(rowErrors),
      confirmButtonText: 'Entendido'
    });
  }
  

  getRowsErrorsHtml(rowErrors: string[]): string {
    let errorsHtml = '<div class="text-start">Las siguientes celdas no pueden quedar vacias:<ul>';
    rowErrors.forEach(v => {
      errorsHtml +=  `<li>${v}</li>`
    })
    errorsHtml += '</ul></div>';
    return errorsHtml;
  }

  displayHeaderError(headerErrors: string[]) {
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar visitantes.',
      html: this.getHeaderErrorsHtml(headerErrors),
      confirmButtonText: 'Entendido'
    });
  }

  getHeaderErrorsHtml(headerErrors: string[]): string {
    let errorsHtml = '<div class="text-start">Error en la primera fila de la planilla. Debe ingresar los siguientes valores: <ul>';
    headerErrors.forEach(v => {
      errorsHtml +=  `<li>${v}</li>`
    })
    errorsHtml += '</ul></div>';
    return errorsHtml;
  }

  getVisitorErrors(visitor: AccessVisitor, rowNumber: number) : string[] {
    let errors = [];
    if (!visitor.firstName)
      errors.push('A' + rowNumber + ': Ingresar un nombre.');
    if (!visitor.lastName)
      errors.push('B' + rowNumber + ': Ingresar un apellido.');
    if (!visitor.document)
      errors.push('C' + rowNumber + ': Ingresar un documento.');
    if (visitor.documentType < 0)
      errors.push('D' + rowNumber + ': Ingresar un tipo de documento válido.');
    if ((visitor.userType ?? -1) < 0)
      errors.push('E' + rowNumber + ': Ingresar un tipo de visitante válido.');
    return errors;
  }

  getHeadersErrors(sheet: XLSX.WorkSheet): string[] {
    let errors = [];
    if (sheet['A1']?.v != 'Nombre')
      errors.push('A1: Nombre');
    if (sheet['B1']?.v != 'Apellido')
      errors.push('B1: Apellido');
    if (sheet['C1']?.v != 'Documento')
      errors.push('C1: Documento');
    if (sheet['D1']?.v != 'Tipo Documento')
      errors.push('D1: Tipo Documento');
    if (sheet['E1']?.v != 'Tipo Visitante')
      errors.push('E1: Tipo Visitante');
    
    return errors;
  }

  getDocumentTypeId(description: string): number {
    return this.documentTypes.findIndex(v => 
      v.toLocaleLowerCase() == description?.toLocaleLowerCase().replaceAll(/\s/g, '')) + 1;
  }

  getUserTypeId(description: string): number {
    return this.userTypes.find(v =>
      v.description.toLocaleLowerCase().replaceAll(/\s/g, '') == description?.toLocaleLowerCase().replaceAll(/\s/g, ''))?.id ?? -1;
  }
}
