import { Injectable } from '@angular/core';
import { AuthService } from '../../../users/users-servicies/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

     private userId:number=0

     //private userAuthService = inject(UserAuthenticationService)
constructor(private auth:AuthService) { }

     
     getUserId(): number{
          return this.auth.getUser().id;
     }

}
