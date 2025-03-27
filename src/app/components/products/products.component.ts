import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CurrencyPipe } from "@angular/common"
import { ProductService, Product } from "../../services/product.service"

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

  constructor(private productService: ProductService) {}

  ngOnInit() {
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
}

