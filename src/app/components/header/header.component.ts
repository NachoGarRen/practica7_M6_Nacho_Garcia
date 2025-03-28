import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { CartService } from '../../services/cart.service';

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
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
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
    });

    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"])
    });
  }
}

