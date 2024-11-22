import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../users-servicies/auth.service';

//Guard para no acceder al login si ya está logueado
export const loginBlockGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  //Verifica si el usuario está logueado
  if(authService.isLoggedIn()){
    return true;
  }

  router.navigate(['/home']);
  return false;
};
