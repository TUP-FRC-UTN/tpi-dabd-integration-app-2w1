import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, take, tap } from 'rxjs';
import { AccessNewMovementsEntryDtoOwner, AccessUserAllowedInfoDtoOwner } from '../../models/access-visitors/interface/access-owner';
import { AccessRegistryUpdateService } from '../access-registry-update/access-registry-update.service';
import { API_ENDPOINTS } from '../../entries-environment';
import { AccessesUpdateAccesDto } from '../../models/access-visitors/access-VisitorsModels';



@Injectable({
 providedIn: 'root'
})
export class AccessOwnerRenterserviceService {
 // URLs originales como comentarios para referencia
 // private BASE_URL = "http://localhost:8090";
 // private URL_POST_OwnerRenterInList = "http://localhost:8090/movements_entry/register";
 // private URL_GET_UserAllowedVisitors = `${this.BASE_URL}/user_Allowed/ownersAndTenants/`;
 // private URL_POST_OwnerExit="http://localhost:8090/movements_exit/registerOwnerExit"

 private httpClient: HttpClient = inject(HttpClient);
 private readonly registryUpdate = inject(AccessRegistryUpdateService);
 private readonly UPDATE_ACCESES=API_ENDPOINTS.UPDATE_ACCESS; 
 private movemenSubject = new BehaviorSubject<{ document: string, movement: string, plate: string }>({
   document: '',
   movement: '',
   plate: ''
 });
 
 private modalSubject = new Subject<string>();
 modalState$ = this.modalSubject.asObservable();
 movementState$ = this.movemenSubject.asObservable();

 constructor() {}

 openModal(visitorDocument: string) {
   console.log(visitorDocument)
   const cleanedDocument = visitorDocument
     .replace(/^[CDP]-/, "")  // Elimina "C-" o "D-" o "P-" al principio
     .trim(); 

   console.log(cleanedDocument); 
   this.modalSubject.next(cleanedDocument);
 }
 
 onMOvement(visitorDocument: string, movement: string, plate: string) {
   const cleanedDocument = visitorDocument
     .replace(/^[CDP]-/, "")  // Elimina "C-" o "D-" o "P-" al principio
     .trim(); 

   this.movemenSubject.next({ document: cleanedDocument, movement: movement, plate: plate });
 }

 registerOwnerRenterEntry(movement: AccessNewMovementsEntryDtoOwner): Observable<any> {
   const headers = new HttpHeaders({'Content-Type': 'application/json'});
   return this.httpClient.post<any>(API_ENDPOINTS.OWNER_RENTER_ENTRY, movement, { headers })
     .pipe(
       tap(() => {
         this.registryUpdate.updateTable(true);
       })
     );
 }

 getAllOwnerRenterList(): Observable<AccessUserAllowedInfoDtoOwner[]> {
   return this.httpClient.get<AccessUserAllowedInfoDtoOwner[]>(API_ENDPOINTS.OWNER_RENTER_LIST);
 }

 registerExitOwner(movement: AccessNewMovementsEntryDtoOwner): Observable<any> {
   const headers = new HttpHeaders({'Content-Type': 'application/json'});
   return this.httpClient.post<any>(API_ENDPOINTS.OWNER_EXIT, movement, { headers })
     .pipe(
       tap(() => {
         this.registryUpdate.updateTable(true);
       })
     );
 }
 updateAccess(document:string,documentType:string,updateAccesDto:any):Observable<any>{
  const headers = new HttpHeaders({'Content-Type': 'application/json'});
  return this.httpClient.put<any>(`${this.UPDATE_ACCESES}/${document}/${documentType}`,updateAccesDto,{headers});
 }
}