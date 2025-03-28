import { Injectable, Inject, PLATFORM_ID } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { BehaviorSubject, Observable, of } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { isPlatformBrowser } from "@angular/common"
import { AuthService } from "./auth.service"

export interface PurchaseItem {
  id: number
  product_id: number
  product_name: string
  product_reference: string
  product_image: string
  quantity: number
  price: number
}

export interface Purchase {
  id: number
  user_id: number
  purchase_date: string
  total: number
  status: string
  items: PurchaseItem[]
}

@Injectable({
  providedIn: "root",
})
export class PurchaseService {
  private purchases = new BehaviorSubject<Purchase[]>([])
  purchases$ = this.purchases.asObservable()
  
  private apiUrl = "http://localhost:3000/purchases" // Tu API endpoint para compras
  private isBrowser: boolean

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId)
  }

  // Obtener los headers de autenticación
  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders()
    }

    const token = localStorage.getItem("token")
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
  }

  // Cargar el historial de compras del usuario
  loadPurchaseHistory(): Observable<Purchase[]> {
    if (!this.isBrowser) {
      return of([])
    }

    const headers = this.getAuthHeaders()
    return this.http
      .get<Purchase[]>(this.apiUrl, { headers })
      .pipe(
        tap((purchases) => {
          this.purchases.next(purchases)
        }),
        catchError((error) => {
          console.error("Error loading purchase history:", error)
          return of([])
        }),
      )
  }

  // Obtener detalles de una compra específica
  getPurchaseDetails(purchaseId: number): Observable<Purchase> {
    if (!this.isBrowser) {
      return of({} as Purchase)
    }

    const headers = this.getAuthHeaders()
    return this.http
      .get<Purchase>(`${this.apiUrl}/${purchaseId}`, { headers })
      .pipe(
        catchError((error) => {
          console.error(`Error loading purchase details for ID ${purchaseId}:`, error)
          return of({} as Purchase)
        }),
      )
  }
}