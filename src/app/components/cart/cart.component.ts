import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CurrencyPipe } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { CartService, Cart, CartItem } from "../../services/cart.service"

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit {
  cart: Cart | null = null
  isLoading = true

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart()
  }

  loadCart() {
    this.isLoading = true
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart
      this.isLoading = false
    })
  }

  updateQuantity(item: CartItem, event: Event) {
    const quantity = parseInt((event.target as HTMLInputElement).value)
    if (quantity > 0) {
      this.cartService.updateCartItem(item.id!, quantity).subscribe()
    }
  }

  removeItem(itemId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      this.cartService.removeCartItem(itemId).subscribe()
    }
  }

  clearCart() {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart().subscribe()
    }
  }

  checkout() {
    this.cartService.checkout().subscribe({
      next: () => {
        alert('¡Compra realizada con éxito!');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error durante el proceso de compra:', error);
        alert('Ha ocurrido un error durante el proceso de compra.');
      }
    });
  }
}