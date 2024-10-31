import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { firstValueFrom } from 'rxjs';
import { UserGet } from '../users-models/users/UserGet';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private user : UserGet = new UserGet();

  constructor() {}

  async setUser(user: UserGet): Promise<void> {
    if (this.user === null) {
        this.user = user;
    } else {
      console.error('El usuario ya ha sido establecido y no se puede modificar.');
    }
  }

  getUserId(): number | null {
    return this.user.id;
  }

  getUserRoles(): string[] | null {
    return this.user.roles;
  }
}
