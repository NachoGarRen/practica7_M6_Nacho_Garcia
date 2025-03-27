import { Routes } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { ProductsComponent } from './components/products/products.component';
import { AdminComponent } from './components/admin/admin.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from "./services/auth-guard.service"

export const routes: Routes = [{path: 'home', component: HeroComponent},
                               {path: 'products', component: ProductsComponent},
                               {path: 'admin', component: AdminComponent, canActivate: [AuthGuardService],},
                               {path: 'register', component: RegisterComponent},
                               {path: 'login', component: LoginComponent},
                               {path: '', redirectTo: 'home', pathMatch: 'full'}];