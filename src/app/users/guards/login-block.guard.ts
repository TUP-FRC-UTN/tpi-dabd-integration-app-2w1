import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../users-servicies/auth.service';

//Guard para no acceder al login si ya está logueado
export const loginBlockGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  //Verifica si el usuario está logueado
  if(authService.isLoggedIn()){

    //Lo redirige a home
    router.navigate(['/home']);

    //No lo deja ingresar
    return false;
  }

  //Sino lo deja acceder
  return true;
};
