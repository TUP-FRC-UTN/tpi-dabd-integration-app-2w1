import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AccessAllowedDaysDto, AuthRangeInfoDto, AccessDocumentTypeDto, AccessLastEntryUserAllowedDto, AccessLastExitUserAllowedDto, AccessNewAuthRangeDto, AccessNewMovementExitDto, AccessNewMovementsEntryDto, AccessNewUserAllowedDto, AccessNewVehicleDto, AccessUserAllowedInfoDto, AccessUserAllowedTypeDto, VehicleTypeDto, AccessVisitor } from '../../models/access-visitors/access-VisitorsModels';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AccessVisitorHelperService } from './access-visitor-helper.service';
import Swal from 'sweetalert2';
import { error } from 'jquery';
import { AccessRegistryUpdateService } from '../access-registry-update/access-registry-update.service';
import { API_ENDPOINTS } from '../../entries-environment';


@Injectable({
 providedIn: 'root'
})
export class VisitorsService {


 private readonly http: HttpClient = inject(HttpClient);
 private readonly helperService = inject(AccessVisitorHelperService);
 private readonly registryUpdate = inject(AccessRegistryUpdateService);

 constructor() {}

 validateQrCode(qrCode: string): Observable<boolean> {
   return this.http.post<boolean>(`${API_ENDPOINTS.VALIDATE_QR}/validate`, { qrCode });
 }

 //Llamadas a Endpoints de la API:
 //trae TODOS los UserAllowed
 getAllUserAllowedData(): Observable<AccessUserAllowedInfoDto[]> {
   return this.http.get<AccessUserAllowedInfoDto[]>(API_ENDPOINTS.USERS_ALLOWED_WITHOUT_MOVEMENTS);
 }
 
 getAllUserAllowedModal():Observable<AccessUserAllowedInfoDto[]> {
   return this.http.get<AccessUserAllowedInfoDto[]>(API_ENDPOINTS.USERS_ALLOWED);
 }
 
 // METODO: registerMovement_Entry(@RequestBody NewMovements_EntryDto movementsEntryDto)
 postVisitorEntry(movement: AccessNewMovementsEntryDto): Observable<any> {
   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
   return this.http.post<any>(API_ENDPOINTS.MOVEMENTS_ENTRY, movement, { headers });
 }

 // METODO: registerMovement_Exit(@RequestBody NewMovements_ExitDto movementsExitDto)
 postVisitorExit(movement: AccessNewMovementExitDto): Observable<any> {
   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
   return this.http.post<any>(API_ENDPOINTS.MOVEMENTS_EXIT, movement, { headers });
 }

  //METODOS (para registrar Ingresos y Egresos)
  RegisterExit(visitor: AccessUserAllowedInfoDto, vehiclePlate: string, userId: number): Observable<boolean> {
    return new Observable<boolean>((observer) => {

          // proceso de registro
          if (visitor.observations == undefined) {
            visitor.observations = "";
          }
          const newUserAllowedDto = this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor, vehiclePlate);
          const newAuthRangeDto = this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);
          const newMovement_ExitDto = this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto, userId);


         let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
         if (indexAuthRange >= 0) {

           let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
           if (indexDayAllowed >= 0) {
             //Egreso en rangos autorizados (fecha y hora)
             this.postVisitorExit(newMovement_ExitDto).subscribe({
               next: (response) => {
                 console.log("RegisterExit response: ", response);
                 if(response.status !== 409){
                   this.helperService.registerExitSuccess(newMovement_ExitDto);
                   //return true;
                   observer.next(true);
                   observer.complete();
                 } else {
                   this.helperService.exitNotAllowed();
                   //return false;
                   observer.next(false);
                   observer.complete();
                 }
                 
               },
               error: (error) => {
                 console.log("RegisterExit error: ", error);
                 if(error.status != 409){
                   this.helperService.registerExitError();
                   //return false;
                   observer.next(false);
                   observer.complete();
                   
                 } else {
                   this.helperService.exitNotAllowed();
                   //return false;
                   observer.next(false);
                   observer.complete();
                 }
               }
             });

           } else {
             //Egreso en rango de fecha autorizado, pero NO en rango horario
             this.postVisitorExit(newMovement_ExitDto).subscribe({
               next: (response) => {
                 console.log("RegisterExit response: ", response);
                 if(response.status !== 409){
                   this.helperService.hourLateExitRegistered(visitor.authRanges.at(indexAuthRange));
                   //return true;
                   observer.next(true);
                   observer.complete();
                 } else {
                   this.helperService.exitNotAllowed();
                   //return false;
                   observer.next(false);
                   observer.complete();
                 }
                 
               },
               error: (error) => {
                 console.log("RegisterExit error: ", error);
                 if(error.status != 409){
                   this.helperService.registerExitError();
                   //return false;
                   observer.next(false);
                   observer.complete();
                   
                 } else {
                   this.helperService.exitNotAllowed();
                   //return false;
                   observer.next(false);
                   observer.complete();
                 }
               }
             });
           }

          } else {
              //Egreso en rangos NO autorizados (fecha y hora)
              this.postVisitorExit(newMovement_ExitDto).subscribe({
                next: (response) => {
                  console.log("RegisterExit response: ", response);
                  if(response.status !== 409){
                    this.helperService.dateLateExitRegistered(visitor);
                    //return true;
                    observer.next(true);
                    observer.complete();
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                  
                },
                error: (error) => {
                  console.log("RegisterExit error: ", error);
                  if(error.status != 409){
                    this.helperService.registerExitError();
                    //return false;
                    observer.next(false);
                    observer.complete();
                    
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                }
              });
          }
    })
    .pipe(
      tap(() => {
        this.registryUpdate.updateTable(true);
      })
    );
  }
  





  
RegisterAccess(visitor :AccessUserAllowedInfoDto, vehiclePlate: string, userId: number): Observable<boolean> {
  return new Observable<boolean>((observer) => {

           // proceso de registro
           //verifica observations
           if(visitor.observations == undefined){
             visitor.observations = "";
           }
           // verifica si esta dentro de rango (fechas permitidas)
           let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
           if(indexAuthRange >= 0){
             // verifica si esta dentro de rango (dia y horario permitido)
             let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
             console.log("(registrando el ingreso) indexDayAllowed:", indexDayAllowed);
             if(indexDayAllowed >= 0){
               
               // mapeos
               const newUserAllowedDto: AccessNewUserAllowedDto = 
                 this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor, vehiclePlate);
               const newAuthRangeDto: AccessNewAuthRangeDto = 
                 this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);

              //se crea el objeto (q se va a pasar por el body en el post)
              const newMovements_EntryDto: AccessNewMovementsEntryDto = 
                this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto, userId);

               //post en la URL
               this.postVisitorEntry(newMovements_EntryDto).subscribe({
                 next: (response) => {
                   console.log("(access-visitors-service) -> Register Access response: ", response);
                   
                   if(response.status !== 409){
                     this.helperService.registerEntrySuccess(newMovements_EntryDto);
                     //return true;
                     observer.next(true);
                     observer.complete();   

                   } else {
                     this.helperService.entryNotAllowed();
                     //return false;
                     observer.next(false);
                     observer.complete();
                   }
                 },
                 error: (error) => {
                   console.log("(access-visitors-service) -> Register Access error: ", error);

                   if(error.status != 409){
                     this.helperService.registerEntryError();
                     //return false;
                     observer.next(false);
                     observer.complete();

                   } else {
                     this.helperService.entryNotAllowed();
                     //return false;
                     observer.next(false);
                     observer.complete();
                   }
                 }
               });

             } else {
               //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
               this.helperService.entryOutOfAuthorizedHourRange(visitor.authRanges.at(indexAuthRange));
               //return false;
               observer.next(false);
               observer.complete();

             }

           } else {
             //se dispara si el Visitor esta fuera de rango (fechas permitidas)
             this.helperService.entryOutOfAuthorizedDateRange(visitor);
             //return false;
             observer.next(false);
             observer.complete();
           }
   })
   .pipe(
     tap(() => {
       this.registryUpdate.updateTable(true);
     })
   );
 }
 // FIN Registrar INGRESO de un visitante
// FIN METODOS (para registrar Ingresos y Egresos)
}