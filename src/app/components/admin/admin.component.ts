import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  productForm: FormGroup;

  //tipos de producto select
  productTypes = [
    'Sabatilles de running de carretera - Home',
    'Sabatilles de running de carretera - Dona',
    'Sabatilles de padel',
    'Sabatilles de bàsquet'
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void { }

  createForm(): FormGroup {
    return this.fb.group({
      reference: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      price: ['', [Validators.required, Validators.min(0), Validators.max(1000)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      productType: ['', Validators.required],
      isOffer: [false],
      imageUrl: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const existingProduct = this.productService.getProductByReference(this.productForm.get('reference')?.value);

      //Si existe el numero referencia, modifica valores, sino crea uno
      if (existingProduct) {
        this.productService.updateProduct({
          ...existingProduct,
          ...this.productForm.value
        });
      } else {
        this.productService.addProduct(this.productForm.value);
      }

      this.productForm.reset();
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  searchByReference() {
    const reference = this.productForm.get('reference')?.value;
    const product = this.productService.getProductByReference(reference);

    if (product) {
      this.productForm.patchValue(product);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.productService.uploadImage(file).subscribe(response => {
        this.productForm.patchValue({
          imageUrl: response.imageUrl
        });
      }, error => {
        console.error("Error al subir la imagen:", error);
      });
    }
  }

}