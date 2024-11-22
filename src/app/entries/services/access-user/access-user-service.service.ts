import { Injectable } from '@angular/core';
import { AccessMovementEntryDto,AccessMovementExitDto,AccessSuppEmpDto } from '../../models/access-employee-allowed/access-user-allowed';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { AccessUserAllowedInfoDto } from '../../models/access-visitors/access-VisitorsModels';
import { AccessRegistryUpdateService } from '../access-registry-update/access-registry-update.service';
import { AccessAuthRangeInfoDtoOwner } from '../../models/access-visitors/interface/access-owner';
import { API_ENDPOINTS } from '../../entries-environment';


@Injectable({
 providedIn: 'root'
})
export class AccessUserServiceService {

 // URLs originales como comentarios para referencia
 // private apiUrlPostEntry = 'http://localhost:8090/movements_entry/registerEmpSupp';
 // private apiUrlPostExit = 'http://localhost:8090/movements_exit/registerEmpSupp'
 // private apiUrl = 'http://localhost:8090/GetSuppliesAndEmployeers';
 // private apiUrlGeneric = 'http://localhost:8090';

 userList : AccessUserAllowedInfoDto[] = []

 constructor(
   private http: HttpClient, 
   private accesRegisterUpdate: AccessRegistryUpdateService
 ) {
   this.loadSuppEmpData();
 }
 
 getSuppEmpData(): Observable<AccessUserAllowedInfoDto[]> {
   return this.http.get<AccessUserAllowedInfoDto[]>(API_ENDPOINTS.GET_SUPPLIES_AND_EMPLOYERS);
 }

 registerEmpSuppEntry(movement: AccessMovementEntryDto): Observable<any> {
   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
   return this.http.post<any>(API_ENDPOINTS.REGISTER_EMP_SUPP_ENTRY, movement, { headers })
     .pipe(
       tap(() => {
         this.accesRegisterUpdate.updateTable(true);
       })
     );
 }

 registerEmpSuppExit(movement: AccessMovementExitDto): Observable<any> {
   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
   return this.http.post<any>(API_ENDPOINTS.REGISTER_EMP_SUPP_EXIT, movement, { headers })
     .pipe(
       tap(() => {
         this.accesRegisterUpdate.updateTable(true);
       })
     );
 }

 getAuthRangeByDoc(document: string, documentType: string): Observable<AccessAuthRangeInfoDtoOwner[]> {
   return this.http.get<AccessAuthRangeInfoDtoOwner[]>(
     `${API_ENDPOINTS.GET_AUTH_RANGE_BY_DOC}/${document}/${documentType}`
   );
 }

  /* Para pegarle al proyecto de empleados por el tema de asistencias */

  registerEntryEmployeers(body: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.REGISTER_ENTRY_EMPLOYEERS, body);
  }

  registerExitEmployeers(body: any): Observable<any> {
    return this.http.put(API_ENDPOINTS.REGISTER_EXIT_EMPLOYEERS, body);
  }

  fetchVisitorsByNeighbor(neighborId: number): Observable<AccessUserAllowedInfoDto[]> {
    return this.http.get<AccessUserAllowedInfoDto[]>(API_ENDPOINTS.USERS_ALLOWED).pipe(
      map(visitors => visitors.filter(visitor => 
        visitor.userType.description.toUpperCase() === 'VISITOR' && 
        visitor.authRanges.some(range => range.neighbor_id === neighborId)
      ))
    );
   }

 loadSuppEmpData(): void {
   this.getSuppEmpData().subscribe({
     next: (data: AccessUserAllowedInfoDto[]) => {
       this.userList = data;
     },
     error: (error) => {
       console.error('Error al cargar los datos:', error);
     }
   });
 }

 GetList(): AccessUserAllowedInfoDto[] {
   return [...this.userList];
 }

 getUserByDocument(document: string): AccessUserAllowedInfoDto[] {
   return this.userList.filter(user => user.document === document);
 }

 getUserByName(name: string): AccessUserAllowedInfoDto[] {
   return this.userList.filter(user => 
     user.name.toLowerCase().includes(name.toLowerCase())
   );
 }

 getUserByDocumentAndNAme(document: string, name: string): AccessUserAllowedInfoDto[] {
   return this.userList.filter(user => 
     user.document === document && user.name === name
   );
 }
}