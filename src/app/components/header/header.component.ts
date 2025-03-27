import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false
  user: any = null

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated
      if (isAuthenticated) {
        this.user = this.authService.getUser()
        console.log("User data from AuthService:", this.user)
      } else {
        this.user = null
      }
    })
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"])
    })
  }
}

