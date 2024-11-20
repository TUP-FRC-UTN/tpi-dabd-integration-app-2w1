import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { EmpPostConfiguration, EmpPostConfigurationResponse } from '../Models/emp-post-configuration';

@Injectable({
  providedIn: 'root'
})
export class PillowTimeLateArrivalService {

  private readonly BASE_URL: string = 'http://localhost:8080/employees';

 
   constructor(private http: HttpClient) {}
 
  

   actualConfig(): Observable<EmpPostConfigurationResponse> {
    return this.http.get<EmpPostConfigurationResponse>(this.BASE_URL+"/configLateArrival")
   }
 
   postConfig(request: EmpPostConfiguration): Observable<boolean> {
     return this.http.post<boolean>(this.BASE_URL+"/configLateArrival", request)
       .pipe(
         catchError((error: HttpErrorResponse) => {
           return throwError(() => error);
         })
       );
   }



}
