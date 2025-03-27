import { type ApplicationConfig, provideZoneChangeDetection } from "@angular/core"
import { provideRouter } from "@angular/router"
import { provideClientHydration, withEventReplay } from "@angular/platform-browser"
import { provideAnimations } from "@angular/platform-browser/animations"
import { provideHttpClient, withFetch } from "@angular/common/http"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { importProvidersFrom } from "@angular/core"

import { routes } from "./app.routes"
import { ProductService } from "./services/product.service"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideHttpClient(withFetch()),
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    ProductService,
  ],
}

