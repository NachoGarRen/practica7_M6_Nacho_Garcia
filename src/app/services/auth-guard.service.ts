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
        if (!isAuthenticated) {
          this.router.navigate(["/login"])
          return false
        }

        const user = this.authService.getUser()
        if (!user || user.role !== "admin") {
          this.router.navigate(["/home"])
          return false
        }

        return true
      }),
    )
  }
}

