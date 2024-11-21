import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap} from 'rxjs/operators';
import { inject } from '@angular/core';
import { AccessVisitorRecord, AccessAuthRange, AccessAllowedDay, AccessUser, UserType, accessTempRegist } from '../../../../models/access-visitors/access-visitors-models';
import { QrDto } from '../../../../models/access-visitors/access-visitors-models';
import { AccessRegistryUpdateService } from '../../../access-registry-update/access-registry-update.service';
import { API_ENDPOINTS } from '../../../../entries-environment';


@Injectable({
 providedIn: 'root'
})
export class AccessVisitorsRegisterServiceHttpClientService {
 private readonly http: HttpClient = inject(HttpClient);
 private readonly registryUpdatedService = inject(AccessRegistryUpdateService); 

 private dayMapping: { [key: string]: string } = {
   'Lun': 'MONDAY',
   'Mar': 'TUESDAY',
   'Mié': 'WEDNESDAY',
   'Jue': 'THURSDAY',
   'Vie': 'FRIDAY',
   'Sáb': 'SATURDAY',
   'Dom': 'SUNDAY'
 };

 private userTypeMapping: { [key: string]: string } = {
   'Visitor': 'Visitante',
   'Delivery': 'Delivery',
   'Taxi': 'Taxi',
   'Gardener': 'Jardinero',
   'Worker': 'Obrero',
   'Cleaning': 'Personal de limpieza'
 };
 
 getQRCode(visitorId: string): Observable<Blob> {
   return this.http.get(`${API_ENDPOINTS.VISITOR_QR}/${visitorId}`, {
     responseType: 'blob' 
   });
 }

 getUidQrByQrId(visitorId: string): Observable<QrDto> {
   return this.http.post<QrDto>(`${API_ENDPOINTS.VALIDATE_QR}/${visitorId}`, null).pipe(
     map(response => response)
   );
 }

 getVehicleTypes(): Observable<string[]> {
   return this.http.get<any[]>(API_ENDPOINTS.VEHICLE_TYPES).pipe(
     map(response => {
       if (Array.isArray(response)) {
         return response.map(item => item.description || 'Descripción no disponible');
       } else {
         console.error('La respuesta no es un array:', response);
         return [];
       }
     })
   );
 }

 getUsersType(): Observable<UserType[]> {
   return this.http.get<UserType[]>(API_ENDPOINTS.USERS_TYPE).pipe(
     map(response => {
       if (Array.isArray(response)) {
         return response.map(item => ({
           id: item.id, 
           description: this.userTypeMapping[item.description] || item.description
         }));
       } else {
         console.error('La respuesta no es un array:', response);
         return [];
       }
     })
   );
 }
 getUsersType2(): Observable<UserType[]> {
  return this.http.get<UserType[]>(API_ENDPOINTS.USERS_TYPE).pipe(
    map(response => {
      if (Array.isArray(response)) {
        return response
          .filter(item => 
            item.description.toUpperCase() !== 'TAXI' && 
            item.description.toUpperCase() !== 'DELIVERY'
          )
          .map(item => ({
            id: item.id,
            description: this.userTypeMapping[item.description] || item.description
          }));
      } else {
        console.error('La respuesta no es un array:', response);
        return [];
      }
    })
  );
 }

 getUsers(): Observable<AccessUser[]> {
   return this.http.get<AccessUser[]>(API_ENDPOINTS.USERS).pipe(
     tap(response => {
       if (!Array.isArray(response)) {
         console.warn(response);
       }
     }),
     map(users => {
       return users;
     })
   );
 }
 
 postVisitorRecord(visitorRecord: AccessVisitorRecord): Observable<any> {
   const transformedData = this.transformVisitorRecord(visitorRecord);
   return this.http.post(API_ENDPOINTS.GENERATE_QR, transformedData);
 }


 private transformVisitorRecord(visitorRecord: AccessVisitorRecord): any[] {
   return visitorRecord.visitors.map(visitor => ({
     document: visitor.document,
     name: visitor.firstName,
     last_name: visitor.lastName,
     userType: visitor.userType,
     documentType: visitor.documentType,
     email: visitor.email,
     emailSent: false,
     authRanges: this.transformAuthRange(visitorRecord.authRange),
     neighbor_name: visitor.neighborName,
     neighbor_last_name: visitor.neighborLastName,
     newVehicleDto: visitor.hasVehicle ? { 
       plate: visitor.vehicle?.licensePlate,
       vehicle_Type: visitor.vehicle?.vehicleType,
       insurance: visitor.vehicle?.insurance
     } : null
   }));
 }

 private transformAuthRange(authRange: AccessAuthRange | null): any {
   if (!authRange) return null;
   
   return {
     neighbor_id: authRange.neighbourId,
     init_date: this.formatDate(authRange.initDate),
     end_date: this.formatDate(authRange.endDate),
     allowedDaysDtos: authRange.allowedDays.map(this.transformAllowedDay.bind(this))
   };
 }

 private transformAllowedDay(allowedDay: AccessAllowedDay): any {
   return {
     day: this.dayMapping[allowedDay.day.name] || allowedDay.day.name,
     init_hour: this.transformTime(allowedDay.startTime),
     end_hour: this.transformTime(allowedDay.endTime)
   };
 }

 private transformTime(date: Date): string {
   return date.toTimeString().slice(0, 8); 
 }

 private formatDate(date: Date): string {
   return date.toISOString().split('T')[0]; 
 }

 giveTempRange(visitor: accessTempRegist): Observable<any> {
   return this.http.put(API_ENDPOINTS.GIVE_TEMP_RANGE, visitor).pipe(
     tap(response => {
       this.registryUpdatedService.updateTable(true);
     })
   );
 }
}