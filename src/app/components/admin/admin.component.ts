import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { ProductService, Product } from "../../services/product.service"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  productForm: FormGroup
  isEditing = false
  currentProductId: number | null = null
  submitButtonText = "AGREGAR PRODUCTO"
  isSubmitting = false
  imageUploaded = false
  uploadError = ""

  //tipos de producto select
  productTypes = [
    "Sabatilles de running de carretera - Home",
    "Sabatilles de running de carretera - Dona",
    "Sabatilles de padel",
    "Sabatilles de bàsquet",
  ]

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.productForm = this.createForm()
  }

  ngOnInit(): void {
    // Double-check authorization in component initialization
    const user = this.authService.getUser()
    if (!user || user.role !== "admin") {
      this.router.navigate(["/home"])
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      reference: ["", [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      name: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      price: ["", [Validators.required, Validators.min(0), Validators.max(1000)]],
      description: ["", [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      productType: ["", Validators.required],
      isOffer: [false],
      imageUrl: ["", Validators.required],
    })
  }

  onSubmit() {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true

      const productData: Product = {
        reference: this.productForm.get("reference")?.value,
        name: this.productForm.get("name")?.value,
        price: this.productForm.get("price")?.value,
        description: this.productForm.get("description")?.value,
        productType: this.productForm.get("productType")?.value,
        isOffer: this.productForm.get("isOffer")?.value,
        imageUrl: this.productForm.get("imageUrl")?.value,
      }

      if (this.isEditing && this.currentProductId) {
        // Update existing product
        productData.id = this.currentProductId
        this.productService.updateProduct(productData).subscribe({
          next: () => {
            this.resetForm()
            this.isSubmitting = false
          },
          error: (error) => {
            console.error("Error updating product:", error)
            this.isSubmitting = false
          },
        })
      } else {
        // Add new product
        this.productService.addProduct(productData).subscribe({
          next: () => {
            this.resetForm()
            this.isSubmitting = false
          },
          error: (error) => {
            console.error("Error adding product:", error)
            this.isSubmitting = false
          },
        })
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach((key) => {
        const control = this.productForm.get(key)
        if (control?.invalid) {
          control.markAsTouched()
        }
      })
    }
  }

  searchByReference() {
    const reference = this.productForm.get("reference")?.value
    if (!reference) return

    const product = this.productService.getProductByReference(reference)

    if (product) {
      this.isEditing = true
      this.currentProductId = product.id || null
      this.submitButtonText = "ACTUALIZAR PRODUCTO"
      this.imageUploaded = true

      this.productForm.patchValue({
        name: product.name,
        price: product.price,
        description: product.description,
        productType: product.productType,
        isOffer: product.isOffer,
        imageUrl: product.imageUrl,
      })
    } else {
      // If no product found, reset form except for the reference
      this.resetFormExceptReference()
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.uploadError = ""
      this.imageUploaded = false

      this.productService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.imageUrl) {
            this.productForm.patchValue({
              imageUrl: response.imageUrl,
            })
            this.imageUploaded = true
            console.log("Image uploaded successfully:", response.imageUrl)
          } else {
            this.uploadError = "No se pudo obtener la URL de la imagen"
            console.error("No image URL returned from server")
          }
        },
        error: (error) => {
          this.uploadError = "Error al subir la imagen"
          console.error("Error al subir la imagen:", error)
        },
      })
    }
  }

  resetForm() {
    this.productForm.reset()
    this.isEditing = false
    this.currentProductId = null
    this.submitButtonText = "AGREGAR PRODUCTO"
    this.imageUploaded = false
  }

  resetFormExceptReference() {
    const reference = this.productForm.get("reference")?.value
    this.productForm.reset()
    this.productForm.patchValue({ reference })
    this.isEditing = false
    this.currentProductId = null
    this.submitButtonText = "AGREGAR PRODUCTO"
    this.imageUploaded = false
  }
}

