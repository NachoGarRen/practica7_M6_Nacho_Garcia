import { Injectable, Inject, PLATFORM_ID } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { BehaviorSubject, Observable, tap, catchError, of, map } from "rxjs"
import { isPlatformBrowser } from "@angular/common"
import { Product } from "./product.service"
import { AuthService } from "./auth.service"
import { Router } from "@angular/router"

export interface CartItem {
  id?: number
  product_id: number
  product?: Product
  quantity: number
  price: number
}

export interface Cart {
  id?: number
  user_id: number
  status: 'active' | 'purchased' | 'expired'
  expires_at: string
  items: CartItem[]
  total?: number
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cart = new BehaviorSubject<Cart | null>(null)
  cart$ = this.cart.asObservable()
  
  private cartItemCount = new BehaviorSubject<number>(0)
  cartItemCount$ = this.cartItemCount.asObservable()
  
  private apiUrl = "http://localhost:3000/cart" // Tu API endpoint para el carrito
  private isBrowser: boolean

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId)
    
    // Solo cargar el carrito en el navegador y si el usuario está autenticado
    if (this.isBrowser) {
      this.authService.isAuthenticated().subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.loadCart()
        } else {
          this.cart.next(null)
          this.cartItemCount.next(0)
        }
      })
    }
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

  // Cargar el carrito del usuario
  loadCart() {
    if (!this.isBrowser) {
      return
    }

    const headers = this.getAuthHeaders()
    this.http
      .get<Cart>(this.apiUrl, { headers })
      .pipe(
        tap((cart) => {
          this.cart.next(cart)
          this.updateCartItemCount(cart)
        }),
        catchError((error) => {
          console.error("Error loading cart:", error)
          return of(null)
        }),
      )
      .subscribe()
  }

  // Actualizar el contador de elementos del carrito
  private updateCartItemCount(cart: Cart | null) {
    if (!cart || !cart.items) {
      this.cartItemCount.next(0)
      return
    }
    
    const count = cart.items.reduce((total, item) => total + item.quantity, 0)
    this.cartItemCount.next(count)
  }

  // Añadir un producto al carrito
  addToCart(productId: number, quantity: number = 1): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot add to cart on server" })
    }

    // Verificar si el usuario está autenticado
    if (!this.authService.getUser()) {
      this.router.navigate(['/login'])
      return of({ error: "User not authenticated" })
    }

    const headers = this.getAuthHeaders()
    const data = { product_id: productId, quantity }

    return this.http.post(this.apiUrl, data, { headers }).pipe(
      tap((response) => {
        console.log("Product added to cart:", response)
        this.loadCart() // Recargar el carrito después de añadir
      }),
      catchError((error) => {
        console.error("Error adding product to cart:", error)
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }

  // Actualizar la cantidad de un elemento del carrito
  updateCartItem(itemId: number, quantity: number): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot update cart on server" })
    }

    const headers = this.getAuthHeaders()
    const data = { quantity }

    return this.http.put(`${this.apiUrl}/items/${itemId}`, data, { headers }).pipe(
      tap((response) => {
        console.log("Cart item updated:", response)
        this.loadCart() // Recargar el carrito después de actualizar
      }),
      catchError((error) => {
        console.error("Error updating cart item:", error)
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }

  // Eliminar un elemento del carrito
  removeCartItem(itemId: number): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot remove from cart on server" })
    }

    const headers = this.getAuthHeaders()

    return this.http.delete(`${this.apiUrl}/items/${itemId}`, { headers }).pipe(
      tap((response) => {
        console.log("Cart item removed:", response)
        this.loadCart() // Recargar el carrito después de eliminar
      }),
      catchError((error) => {
        console.error("Error removing cart item:", error)
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }

  // Vaciar el carrito
  clearCart(): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot clear cart on server" })
    }

    const headers = this.getAuthHeaders()

    return this.http.delete(this.apiUrl, { headers }).pipe(
      tap((response) => {
        console.log("Cart cleared:", response)
        this.cart.next(null)
        this.cartItemCount.next(0)
      }),
      catchError((error) => {
        console.error("Error clearing cart:", error)
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }

  // Finalizar la compra
  checkout(): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot checkout on server" })
    }

    const headers = this.getAuthHeaders()

    return this.http.post(`${this.apiUrl}/checkout`, {}, { headers }).pipe(
      tap((response) => {
        console.log("Checkout completed:", response)
        this.cart.next(null)
        this.cartItemCount.next(0)
      }),
      catchError((error) => {
        console.error("Error during checkout:", error)
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }
}