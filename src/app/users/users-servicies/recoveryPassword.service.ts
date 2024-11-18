import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root' 
})
export class RecoveryPasswordService {
  
  private readonly http = inject(HttpClient);

  url : string = environment.services.usersAndAddresses + '/users/recoveryPassword'

  recoveryPassword(email : string) : Observable<void>{
    return this.http.put<void>(`${this.url}/${email}`, null);
  }
}

