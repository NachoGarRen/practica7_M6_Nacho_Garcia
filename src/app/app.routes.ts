import { Routes } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { ProductsComponent } from './components/products/products.component';
import { AdminComponent } from './components/admin/admin.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from "./services/auth-guard.service"
import { CartComponent } from './components/cart/cart.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PurchaseDetailsComponent } from './components/purchase-details/purchase-details.component';

export const routes: Routes = [
    { path: 'home', component: HeroComponent },
    { path: 'products', component: ProductsComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuardService],
        data: { requiresAdmin: true } // Esta ruta requiere rol de admin
    },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'cart', component: CartComponent },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuardService]
        // No requiere rol de admin, solo autenticación
    },
    {
        path: 'purchase/:id',
        component: PurchaseDetailsComponent,
        canActivate: [AuthGuardService]
        // No requiere rol de admin, solo autenticación
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];