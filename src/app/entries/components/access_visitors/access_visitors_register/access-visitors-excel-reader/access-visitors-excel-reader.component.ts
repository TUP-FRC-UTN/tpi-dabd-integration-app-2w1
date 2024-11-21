import { Component, OnDestroy, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
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

    console.log(workBook.Sheets[workBook.SheetNames[0]]);

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

  async downloadTemplate() {
    const workBook = new ExcelJS.Workbook();
    const sheet = workBook.addWorksheet('Invitados');
    sheet.columns = [
      { header: 'Nombre', width: 15 },
      { header: 'Apellido', width: 15 },
      { header: 'Documento', width: 15 },
      { header: 'Tipo Documento', width: 20 },
      { header: 'Tipo Visitante', width: 20 }
    ]
    sheet.getCell('D2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"' + this.documentTypes.join(',') + '"']
    }
    sheet.getCell('E2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"' + this.userTypes.map(v => v.description).join(',') + '"']
    }

    const buffer = await workBook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'lista_invitados.xlsx');
    link.click();
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
