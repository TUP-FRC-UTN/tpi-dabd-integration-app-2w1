import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import * as XLSX from 'xlsx';
import { AccessVisitor, UserType } from '../../../../models/access-visitors/access-visitors-models';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-access-visitors-excel-reader',
  standalone: true,
  imports: [],
  templateUrl: './access-visitors-excel-reader.component.html',
  styleUrl: './access-visitors-excel-reader.component.css'
})
export class AccessVisitorsExcelReaderComponent implements OnInit, OnDestroy {
  @Output() visitorsLoaded = new EventEmitter<AccessVisitor[]>();

  subscription = new Subscription();
  documentTypes: string[] = ['DNI', 'Pasaporte', 'CUIT'];
  userTypes: UserType[] = [];

  constructor(
    private visitorService: AccessVisitorsRegisterServiceHttpClientService
  ) {}

  ngOnInit(): void {
    const userTypeSubscription = this.visitorService.getUsersType().subscribe({
      next: v => {
        this.userTypes = v;
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
      
      this.visitorsLoaded.emit(visitors)
    }
    reader.readAsArrayBuffer(event.target.files[0]);
  }

  mapWorkbookToVisitors(workBook: XLSX.WorkBook): AccessVisitor[] {
    const rows = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]) as any[];
    let visitors: AccessVisitor[] = [];
    let errors: string[] = [];

    if (!this.verifyHeaders(workBook.Sheets[workBook.SheetNames[0]])) {
      this.displayHeaderError();
      return [];
    }
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const visitor: AccessVisitor = {
        firstName: row['Nombre'],
        lastName: row['Apellido'],
        document: row['Documento'],
        documentType: this.getDocumentTypeId(row['Tipo Documento']),
        email: '',
        hasVehicle: false,
        userType: this.getUserTypeId(row['Tipo Ingresante'])
      };
      const visitorErrors = this.getVisitorErrors(visitor, row.__rowNum__);
      if (visitorErrors.length > 0) {
        errors = errors.concat(visitorErrors);
        continue;
      }
      visitors.push(visitor);
    }

    if (errors.length > 0) {
      this.displayRowsErrors(errors);
      return [];
    }
    return visitors;
  }

  displayRowsErrors(rowErrors: string[]) {
    alert("Error al cargar los datos. Las siguientes celdas no pueden quedar vacias: " + rowErrors);
  }

  displayHeaderError() {
    alert('NO CAMBIAR LOS HEADERS!');
  }

  getVisitorErrors(visitor: AccessVisitor, rowNumber: number) : string[] {
    let errors = [];
    if (!visitor.firstName)
      errors.push('A' + rowNumber);
    if (!visitor.lastName)
      errors.push('B' + rowNumber);
    if (!visitor.document)
      errors.push('C' + rowNumber);
    if (visitor.documentType < 0)
      errors.push('D' + rowNumber);
    if ((visitor.userType ?? -1) < 0)
      errors.push('E' + rowNumber);
    return errors;
  }

  verifyHeaders(sheet: XLSX.WorkSheet): boolean {
    if (sheet['A1']?.v != 'Nombre')
      return false;
    if (sheet['B1']?.v != 'Apellido')
      return false;
    if (sheet['C1']?.v != 'Documento')
      return false;
    if (sheet['D1']?.v != 'Tipo Documento')
      return false;
    if (sheet['E1']?.v != 'Tipo Ingresante')
      return false;
    
    return true;
  }

  getDocumentTypeId(description: string): number {
    return this.documentTypes.findIndex(v => 
      v.toLocaleLowerCase() == description?.toLocaleLowerCase().replaceAll(/\s/g, '')
    ) + 1;
  }

  getUserTypeId(description: string): number {
    return this.userTypes.find(v =>
      v.description.toLocaleLowerCase() == description?.toLocaleLowerCase().replaceAll(/\s/g, ''))?.id ?? -1;
  }
}
