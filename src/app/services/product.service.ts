import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  reference: string;
  name: string;
  price: number;
  description: string;
  productType: string;
  isOffer: boolean;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = new BehaviorSubject<Product[]>([]);
  products$ = this.products.asObservable();
  private apiUrl = 'http://172.17.22.153:3000'; // Cambia esto a la IP de tu Raspberry

  constructor(private http: HttpClient) {}

  addProduct(product: Product) {
    const currentProducts = this.products.getValue();
    this.products.next([...currentProducts, product]);
  }

  updateProduct(updatedProduct: Product) {
    const currentProducts = this.products.getValue();
    const index = currentProducts.findIndex(p => p.reference === updatedProduct.reference);
    
    if (index !== -1) {
      currentProducts[index] = updatedProduct;
      this.products.next([...currentProducts]);
    }
  }

  getProductByReference(reference: string): Product | undefined {
    return this.products.getValue().find(p => p.reference === reference);
  }

  uploadImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload`, formData);
  }
}
