import { Injectable, Inject, PLATFORM_ID } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { BehaviorSubject, Observable, tap, catchError, of, map } from "rxjs"
import { isPlatformBrowser } from "@angular/common"

export interface Product {
  id?: number
  reference: string
  name: string
  price: number
  description: string
  productType: string
  isOffer: boolean
  imageUrl: string
  created_at?: string
  updated_at?: string
}

// Interface for API responses that use snake_case
interface ApiProduct {
  id?: number
  reference: string
  name: string
  price: number
  description: string
  product_type?: string
  productType?: string
  is_offer?: boolean | number  // Puede ser boolean o number (0/1)
  isOffer?: boolean | number   // Puede ser boolean o number (0/1)
  image_url?: string
  imageUrl?: string
  created_at?: string
  updated_at?: string
}

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private products = new BehaviorSubject<Product[]>([])
  products$ = this.products.asObservable()
  private apiUrl = "http://192.168.11.199:3001" // Raspberry Pi IP
  private productsApiUrl = "http://localhost:3000/products" // Your products API endpoint
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only load products in browser environment
    if (this.isBrowser) {
      this.loadProducts();
    }
  }

  // Get auth token for API requests
  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders()
    }

    const token = localStorage.getItem("token")
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
  }

  // Load all products from API
  loadProducts() {
    if (!this.isBrowser) {
      return
    }

    const headers = this.getAuthHeaders()
    this.http
      .get<ApiProduct[]>(this.productsApiUrl, { headers })
      .pipe(
        tap((products) => {
          // Transform API response to our Product interface
          const formattedProducts = products.map((product) => this.mapApiProductToProduct(product))
          console.log("Formatted products:", formattedProducts) // Añadido para depuración
          this.products.next(formattedProducts)
        }),
        catchError((error) => {
          console.error("Error loading products:", error)
          return of([])
        }),
      )
      .subscribe()
  }

  // Map API product (with snake_case) to our Product interface (with camelCase)
  private mapApiProductToProduct(apiProduct: ApiProduct): Product {
    // Convertir is_offer o isOffer a un valor booleano real
    const isOfferValue = this.convertToBoolean(apiProduct.isOffer || apiProduct.is_offer);
    
    console.log("Original is_offer value:", apiProduct.is_offer); // Añadido para depuración
    console.log("Converted isOffer value:", isOfferValue); // Añadido para depuración
    
    return {
      id: apiProduct.id,
      reference: apiProduct.reference,
      name: apiProduct.name,
      price: apiProduct.price,
      description: apiProduct.description,
      productType: apiProduct.productType || apiProduct.product_type || "",
      isOffer: isOfferValue,
      imageUrl: this.ensureFullImageUrl(apiProduct.imageUrl || apiProduct.image_url || ""),
      created_at: apiProduct.created_at,
      updated_at: apiProduct.updated_at,
    }
  }

  // Función auxiliar para convertir valores a booleanos
  private convertToBoolean(value: any): boolean {
    if (typeof value === "boolean") {
      return value;
    }
    // Convertir valores numéricos (0/1) a booleanos
    if (typeof value === "number") {
      return value !== 0;
    }
    // Convertir strings "0"/"1", "true"/"false" a booleanos
    if (typeof value === "string") {
      return value === "1" || value.toLowerCase() === "true";
    }
    // Si es null, undefined o cualquier otro tipo, devolver false
    return false;
  }

  // Ensure image URL has the correct base URL
  private ensureFullImageUrl(url: string): string {
    if (!url) return ""

    // If the URL already starts with http, it's already a full URL
    if (url.startsWith("http")) {
      return url
    }

    // Otherwise, prepend the Raspberry Pi URL
    return `${this.apiUrl}${url.startsWith("/") ? "" : "/"}${url}`
  }

  // Get a product by reference
  getProductByReference(reference: string): Product | undefined {
    return this.products.getValue().find((p) => p.reference === reference)
  }

  // Get a product by ID from API
  getProductById(id: number): Observable<Product> {
    const headers = this.getAuthHeaders()
    return this.http
      .get<ApiProduct>(`${this.productsApiUrl}/${id}`, { headers })
      .pipe(map((product) => this.mapApiProductToProduct(product)))
  }

  // Update the addProduct method to better handle the image URL and provide more detailed error logging
  addProduct(product: Product): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot add product on server" })
    }

    const headers = this.getAuthHeaders()

    // Prepare the product data for the API (convert to snake_case for API)
    const productData = {
      reference: product.reference,
      name: product.name,
      price: product.price,
      description: product.description,
      product_type: product.productType,
      is_offer: product.isOffer,
      image_url: product.imageUrl,
    }

    console.log("Sending product data to API:", productData)

    return this.http.post(this.productsApiUrl, productData, { headers }).pipe(
      tap((response) => {
        console.log("API response for add product:", response)
        // After successful API call, update the local BehaviorSubject
        const currentProducts = this.products.getValue()
        const newProduct = {
          ...product,
          id: (response as any).id,
        }
        this.products.next([...currentProducts, newProduct])
      }),
      catchError((error) => {
        console.error("Error adding product:", error)
        if (error.error) {
          console.error("Server error details:", error.error)
        }
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }

  // Similarly update the updateProduct method
  updateProduct(updatedProduct: Product): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot update product on server" })
    }

    const headers = this.getAuthHeaders()
    const productId = updatedProduct.id

    if (!productId) {
      console.error("Cannot update product without ID")
      return of({ error: "Product ID is required for update" })
    }

    // Prepare the product data for the API (convert to snake_case for API)
    const productData = {
      reference: updatedProduct.reference,
      name: updatedProduct.name,
      price: updatedProduct.price,
      description: updatedProduct.description,
      product_type: updatedProduct.productType,
      is_offer: updatedProduct.isOffer,
      // Send the full image URL instead of trying to extract a relative path
      image_url: updatedProduct.imageUrl,
    }

    console.log("Sending updated product data to API:", productData)

    return this.http.put(`${this.productsApiUrl}/${productId}`, productData, { headers }).pipe(
      tap((response) => {
        console.log("API response for update product:", response)
        // After successful API call, update the local BehaviorSubject
        const currentProducts = this.products.getValue()
        const index = currentProducts.findIndex((p) => p.id === productId)

        if (index !== -1) {
          currentProducts[index] = updatedProduct
          this.products.next([...currentProducts])
        }
      }),
      catchError((error) => {
        console.error("Error updating product:", error)
        if (error.error) {
          console.error("Server error details:", error.error)
        }
        return of({ error: error.message || "Unknown error occurred" })
      }),
    )
  }

  // Delete a product
  deleteProduct(id: number): Observable<any> {
    if (!this.isBrowser) {
      return of({ error: "Cannot delete product on server" })
    }

    const headers = this.getAuthHeaders()

    return this.http.delete(`${this.productsApiUrl}/${id}`, { headers }).pipe(
      tap(() => {
        // After successful API call, update the local BehaviorSubject
        const currentProducts = this.products.getValue()
        this.products.next(currentProducts.filter((p) => p.id !== id))
      }),
      catchError((error) => {
        console.error("Error deleting product:", error)
        return of({ error: error.message })
      }),
    )
  }

  // Upload an image to the Raspberry Pi
  uploadImage(image: File): Observable<{ imageUrl: string }> {
    if (!this.isBrowser) {
      return of({ imageUrl: "" })
    }

    const formData = new FormData()
    formData.append("image", image)

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload`, formData).pipe(
      map((response) => {
        // Ensure the returned URL is a full URL
        return {
          imageUrl: this.ensureFullImageUrl(response.imageUrl),
        }
      }),
      catchError((error) => {
        console.error("Error uploading image:", error)
        return of({ imageUrl: "" })
      }),
    )
  }

  // Extract the relative path from a full URL
  private getRelativeImagePath(fullUrl: string): string {
    if (!fullUrl) return ""

    // If it's already a relative path, return it as is
    if (!fullUrl.startsWith("http")) {
      return fullUrl
    }

    // Remove the Raspberry Pi base URL to get the relative path
    return fullUrl.replace(this.apiUrl, "")
  }
}