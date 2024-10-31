import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { MockUserService } from "./service/mockUser.service";



export const roleGuard: CanActivateFn = (route, state) => {
    const auth = inject(MockUserService)
    const router = inject(Router)

    const role = auth.getRol()
    console.log(role)
    if(auth.isAdmin()){
        return true
    }
    return router.navigate(['/home'])
}