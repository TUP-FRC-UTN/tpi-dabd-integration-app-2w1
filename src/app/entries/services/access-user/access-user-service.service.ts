import { Injectable } from '@angular/core';
import { AccessMovementEntryDto,AccessMovementExitDto,AccessSuppEmpDto } from '../../models/access-employee-allowed/access-user-allowed';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessUserAllowedInfoDto } from '../../models/access-visitors/access-VisitorsModels';

@Injectable({
  providedIn: 'root'
})
export class AccessUserServiceService {

  private apiUrlPostEntry = 'http://localhost:8090/movements_entry/registerEmpSupp';
  private apiUrlPostExit = 'http://localhost:8090/movements_exit/registerEmpSupp'
  private apiUrl = 'http://localhost:8090/GetSuppliesAndEmployeers';

  constructor(private http: HttpClient) {
    this.loadSuppEmpData();
  }

  userList : AccessUserAllowedInfoDto[] = []
  
  getSuppEmpData(): Observable<AccessUserAllowedInfoDto[]> {
    return this.http.get<AccessUserAllowedInfoDto[]>(this.apiUrl);
  }

  registerEmpSuppEntry(movement: AccessMovementEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrlPostEntry, movement, { headers });
  }

  registerEmpSuppExit(movement: AccessMovementExitDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrlPostExit, movement, { headers });
  }

  loadSuppEmpData(): void {
    this.getSuppEmpData().subscribe({
      next: (data: AccessUserAllowedInfoDto[]) => {
        this.userList = data; // Asigna los datos una vez que se reciban
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      }
    });
  }

  GetList(): AccessUserAllowedInfoDto[]{
    return [...this.userList]
  }

  getUserByDocument(document: string): AccessUserAllowedInfoDto[] {
    return this.userList.filter(user => user.document === document);
  }

  getUserByName(name: string): AccessUserAllowedInfoDto[] {
    return this.userList.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  getUserByDocumentAndNAme(document: string, name: string): AccessUserAllowedInfoDto[] {
    return this.userList.filter(user => user.document === document && user.name === name);
  }


}
