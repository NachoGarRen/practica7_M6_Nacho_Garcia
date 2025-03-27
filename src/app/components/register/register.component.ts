import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  days: number[] = [];
  months: { value: number; name: string }[] = [];
  years: number[] = [];
  countries: { code: string; name: string }[] = [];
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  userData = {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    birthdate: {
      day: "",
      month: "",
      year: "",
    },
    country_code: "",
    gender: "",
    marketing_consent: false,
    terms_accepted: false,
  };

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Initialize days array (1-31)
    for (let i = 1; i <= 31; i++) this.days.push(i);

    // Initialize months array
    this.months = [
      { value: 1, name: "Enero" },
      { value: 2, name: "Febrero" },
      { value: 3, name: "Marzo" },
      { value: 4, name: "Abril" },
      { value: 5, name: "Mayo" },
      { value: 6, name: "Junio" },
      { value: 7, name: "Julio" },
      { value: 8, name: "Agosto" },
      { value: 9, name: "Septiembre" },
      { value: 10, name: "Octubre" },
      { value: 11, name: "Noviembre" },
      { value: 12, name: "Diciembre" },
    ];

    // Initialize years array (current year down to 1920)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1920; i--) this.years.push(i);

    // Initialize countries array
    this.countries = [
      { code: "ES", name: "España" },
      { code: "MX", name: "México" },
      { code: "AR", name: "Argentina" },
      { code: "US", name: "Estados Unidos" },
      { code: "CA", name: "Canadá" },
      { code: "FR", name: "Francia" },
    ];
  }

  formatBirthDate(): string {
    const { year, month, day } = this.userData.birthdate;
    // Ensure month is padded with leading zero if needed
    const formattedMonth = month.toString().padStart(2, "0");
    // Ensure day is padded with leading zero if needed
    const formattedDay = day.toString().padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  register() {
    // Create a new object with the API expected format
    const apiData = {
      email: this.userData.email,
      password: this.userData.password,
      first_name: this.userData.first_name,
      last_name: this.userData.last_name,
      birth_date: this.formatBirthDate(),
      country_code: this.userData.country_code,
      gender: this.userData.gender,
      marketing_consent: this.userData.marketing_consent,
      terms_accepted: this.userData.terms_accepted,
    };

    console.log("Sending data to API:", apiData);

    this.authService.register(apiData).subscribe({
      next: (response) => {
        this.notificationMessage = 'Registro exitoso';
        this.notificationType = 'success';
        console.log(response);
      },
      error: (error) => {
        this.notificationMessage = 'Error en el registro: ' + (error.error?.message || 'Ocurrió un error desconocido');
        this.notificationType = 'error';
        console.error(error);
      },
    });
  }
}