import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';  // REMOVE 'type'
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component'; 
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'miProyectoAngular';
  showHeaderFooter: boolean = true;

  constructor(private router: Router) {
    // Subscribe to router events to check the current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if the current route is 'login' or 'register'
      if (event.url === '/login' || event.url === '/register') {
        this.showHeaderFooter = false;
      } else {
        this.showHeaderFooter = true;
      }
    });
  }
}