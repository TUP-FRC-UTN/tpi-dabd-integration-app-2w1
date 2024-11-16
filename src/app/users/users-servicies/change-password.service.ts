import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChangePassword } from '../users-models/users/ChangePassword';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:9060/auth/changePassword';

  changePassword(changePassword: ChangePassword): Observable<{mensaje: string}>{
    return this.http.put<{mensaje: string}>(this.url, changePassword);
  }
}
