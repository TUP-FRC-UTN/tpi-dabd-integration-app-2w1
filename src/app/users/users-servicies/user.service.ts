import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserGet } from '../users-models/users/UserGet';
import { RolModel } from '../users-models/users/Rol';
import { UserPost } from '../users-models/users/UserPost';
import { LoginUser } from '../users-models/users/Login';
import { UserPut } from '../users-models/users/UserPut';
import { map } from 'rxjs/operators';
import { DeleteUser } from '../users-models/owner/DeleteUser';
import { GetuserDto } from '../users-models/users/GetUserDto';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = environment.services.usersAndAddresses;

  constructor() { }

  putUser(user: UserPut, userId: number): Observable<UserPut> {
    return this.http.put<UserPut>(this.url + "/users/put/" + userId, user);
  }

  postUser(user: UserPost): Observable<UserGet> {    
    return this.http.post<UserGet>(this.url + "/users/post", user);
  } 

  getAllUsers(): Observable<UserGet[]> {
    return this.http.get<UserGet[]>(this.url + "/users/getall");
  }

  verifyLogin(user: LoginUser): Observable<LoginUser> {
    return this.http.post<LoginUser>(this.url + "/auth/login", user);
  }   

  getAllRoles(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(this.url + "/roles");
  }

  getUserById(userId: number): Observable<UserGet> {
    return this.http.get<UserGet>(this.url + "/users/getById/" + userId);
  }

  getUserById2(userId: number): Observable<GetuserDto> {
    return this.http.get<GetuserDto>(this.url + "/users/getById/" + userId);
  }

  getUserByEmail(email: string): Observable<UserGet> {
    return this.http.get<UserGet>(this.url + "/users/getByEmail/" + email);
  }

  getUsersByPlotID(plotId: number): Observable<UserGet[]> {
    return this.http.get<UserGet[]>(this.url + "/users/getall/" + plotId);
  }

  getUsersByOwner(ownerId: number): Observable<UserGet> {
    return this.http.get<UserGet>(this.url + "/users/byOwner/"+ ownerId + "/WithoutTheOwner");
  }

  deleteUser( user: DeleteUser): Observable<any> {
    return this.http.delete(this.url + '/users/delete/' + user.id + '/' + user.userIdUpdate); 
  }
}
