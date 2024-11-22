import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../users-servicies/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  //Verifica si se logueo
  if(authService.isLoggedIn()){
    return true;
  }
  else{

    //Sino lo redirige a la landing
    router.navigate(['/home']);
    return false;
  }
}
