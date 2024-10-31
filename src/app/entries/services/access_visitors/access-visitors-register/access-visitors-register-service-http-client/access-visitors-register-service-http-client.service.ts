import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap} from 'rxjs/operators';
import { inject } from '@angular/core';
import { AccessVisitorRecord, AccessVisitor, AccessAuthRange, AccessAllowedDay, AccessUser } from '../../../../models/access-visitors/access-visitors-models';

@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceHttpClientService {
  private readonly http: HttpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:8090';
 
  private dayMapping: { [key: string]: string } = {
    'Lun': 'MONDAY',
    'Mar': 'TUESDAY',
    'Mié': 'WEDNESDAY',
    'Jue': 'THURSDAY',
    'Vie': 'FRIDAY',
    'Sáb': 'SATURDAY',
    'Dom': 'SUNDAY'
  };
  getQRCode(visitorId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/visitor-qr/image/${visitorId}`, {
      responseType: 'blob' 
    });
  }





  getVehicleTypes(): Observable<string[]> {
    const url = 'http://localhost:8090/getAll/vehiclesType'; 
    return this.http.get<any[]>(url).pipe(
      tap(response => console.log('Respuesta completa del servidor:', response)),
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
  private readonly usersApiUrl = 'https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/users';

  getUsers(): Observable<AccessUser[]> {
    return this.http.get<AccessUser[]>(this.usersApiUrl).pipe(
      tap(response => {
        if (!Array.isArray(response)) {
          console.warn(response);
        }
      }),
      map(users => {
        console.log(users);
        return users;
      }),
    
    );
  }
  
  postVisitorRecord(visitorRecord: AccessVisitorRecord): Observable<any> {
    const transformedData = this.transformVisitorRecord(visitorRecord);
    return this.http.post(`${this.apiUrl}/visitor-qr/generate`, transformedData);
  }
private transformVisitorRecord(visitorRecord: AccessVisitorRecord): any[] {
    return visitorRecord.visitors.map(visitor => ({
        document: visitor.document,
        name: visitor.firstName,
        last_name: visitor.lastName,
        userType: 0,
        documentType: visitor.documentType,
        email: visitor.email,
        emailSent: false,
        authRanges: this.transformAuthRange(visitorRecord.authRange),
        
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
}