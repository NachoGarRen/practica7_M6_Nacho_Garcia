import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userData = {
    email: '',
    password: ''
  };
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    console.log("Sending login data to API:", this.userData);

    this.authService.login(this.userData).subscribe({
      next: (response) => {
        this.notificationMessage = 'Inicio de sesión exitoso';
        this.notificationType = 'success';
        console.log(response);
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500);
      },
      error: (error) => {
        this.notificationMessage = 'Error en el inicio de sesión: ' + (error.error?.message || 'Ocurrió un error desconocido');
        this.notificationType = 'error';
        console.error(error);
      }
    });
  }
}