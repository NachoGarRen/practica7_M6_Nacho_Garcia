import { Injectable } from "@angular/core"
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router"
import { AuthService } from "./auth.service"
import { type Observable, map, take } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class AuthGuardService {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map((isAuthenticated) => {
        // Si no está autenticado, redirigir al login
        if (!isAuthenticated) {
          this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
          return false
        }

        const user = this.authService.getUser()
        
        // Verificar si la ruta requiere rol de administrador
        const requiresAdmin = route.data['requiresAdmin'] === true
        
        // Si la ruta requiere admin y el usuario no es admin, redirigir a home
        if (requiresAdmin && (!user || user.role !== "admin")) {
          this.router.navigate(["/home"])
          return false
        }
        
        // Usuario autenticado y con los permisos necesarios
        return true
      }),
    )
  }
}