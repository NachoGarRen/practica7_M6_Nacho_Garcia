import { Routes } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { ProductsComponent } from './components/products/products.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [{path: 'home', component: HeroComponent},
                               {path: 'products', component: ProductsComponent},
                               {path: 'admin', component: AdminComponent},
                               {path: '', redirectTo: 'home', pathMatch: 'full'}];