import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../users-servicies/auth.service';
import { inject } from '@angular/core';

//Guard para ver si el rol del usuario puede acceder al componente
export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  //Rol que puede acceder al componente
  const requiredRoles = route.data['roles'] as string[];
  
  //Ver si el usuario tiene alguno de los roles permitidos
  const hasValidRole = requiredRoles.some((role) =>    
    authService.getActualRole() == role
  );

  //Si tiene permisos
  if (hasValidRole) {
    return true;
  } 
  
  //Si no tiene permisos
  else {
    router.navigate(['unauthorized']);
    return false;
  }
};
