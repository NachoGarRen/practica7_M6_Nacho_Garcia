import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CurrencyPipe } from "@angular/common"
import { Router } from "@angular/router"
import { ProductService, Product } from "../../services/product.service"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  searchTerm = ""
  isLoading = true
  isAdmin = false

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si el usuario es admin
    const user = this.authService.getUser();
    this.isAdmin = user && user.role === 'admin';
    
    // Load products from API
    this.productService.loadProducts()

    this.productService.products$.subscribe((products) => {
      this.products = products
      this.filterProducts()
      this.isLoading = false
    })
  }

  //buscador con lowercase, num referencia, nombre producto y categoria
  filterProducts() {
    if (!this.searchTerm) {
      this.filteredProducts = this.products
      return
    }

    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.productType.toLowerCase().includes(this.searchTerm.toLowerCase()),
    )
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value
    this.filterProducts()
  }

  // Método para eliminar un producto
  deleteProduct(id: number | undefined) {
    if (!id) {
      console.error('No se puede eliminar un producto sin ID');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          // El producto ya se eliminará de la lista en el servicio
          console.log('Producto eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar el producto:', error);
        }
      });
    }
  }

  // Método para editar un producto
  editProduct(reference: string) {
    // Navegar a la página de administración con el parámetro de referencia
    this.router.navigate(['/admin'], { queryParams: { reference } });
  }
}