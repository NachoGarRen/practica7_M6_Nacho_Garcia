import { type ComponentFixture, TestBed } from "@angular/core/testing"
import { ReactiveFormsModule, FormBuilder } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { of } from "rxjs"
import { AdminComponent } from "./admin.component"
import { ProductService } from "../../services/product.service"
import { AuthService } from "../../services/auth.service"
import { CommonModule } from "@angular/common"

describe("AdminComponent", () => {
  let component: AdminComponent
  let fixture: ComponentFixture<AdminComponent>
  let productServiceSpy: jasmine.SpyObj<ProductService>
  let authServiceSpy: jasmine.SpyObj<AuthService>
  let routerSpy: jasmine.SpyObj<Router>
  let activatedRouteMock: any
  let windowSpy: jasmine.Spy

  beforeEach(async () => {
    // Crear spies para los servicios
    productServiceSpy = jasmine.createSpyObj("ProductService", [
      "addProduct",
      "updateProduct",
      "deleteProduct",
      "getProductByReference",
      "uploadImage",
    ])

    authServiceSpy = jasmine.createSpyObj("AuthService", ["getUser"])
    routerSpy = jasmine.createSpyObj("Router", ["navigate"])

    // Mock para ActivatedRoute
    activatedRouteMock = {
      queryParams: of({}),
    }

    // Configurar comportamiento de los spies
    authServiceSpy.getUser.and.returnValue({ role: "admin" })
    productServiceSpy.addProduct.and.returnValue(of({ id: 1 }))
    productServiceSpy.updateProduct.and.returnValue(of({}))
    productServiceSpy.deleteProduct.and.returnValue(of({}))
    productServiceSpy.uploadImage.and.returnValue(of({ imageUrl: "http://example.com/image.jpg" }))

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule],
      declarations: [AdminComponent],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(AdminComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should initialize form with empty values", () => {
    expect(component.productForm.get("reference")?.value).toBe("")
    expect(component.productForm.get("name")?.value).toBe("")
    expect(component.productForm.get("price")?.value).toBe("")
    expect(component.productForm.get("description")?.value).toBe("")
    expect(component.productForm.get("productType")?.value).toBe("")
    expect(component.productForm.get("isOffer")?.value).toBe(false)
    expect(component.productForm.get("imageUrl")?.value).toBe("")
  })

  it("should validate required fields", () => {
    const form = component.productForm

    // Inicialmente el formulario es inválido porque todos los campos requeridos están vacíos
    expect(form.valid).toBeFalsy()

    // Llenar los campos requeridos
    form.patchValue({
      reference: "REF12345",
      name: "Test Product",
      price: 99.99,
      description: "This is a test product description",
      productType: "Sabatilles de padel",
      imageUrl: "http://example.com/image.jpg",
    })

    expect(form.valid).toBeTruthy()
  })

  it("should call addProduct when submitting a new product", () => {
    // Configurar el formulario con datos válidos
    component.productForm.patchValue({
      reference: "REF12345",
      name: "Test Product",
      price: 99.99,
      description: "This is a test product description",
      productType: "Sabatilles de padel",
      imageUrl: "http://example.com/image.jpg",
    })

    // Asegurarse de que no estamos en modo edición
    component.isEditing = false
    component.currentProductId = null

    // Llamar al método onSubmit
    component.onSubmit()

    // Verificar que se llamó al método addProduct del servicio
    expect(productServiceSpy.addProduct).toHaveBeenCalled()

    // Verificar que se pasaron los datos correctos
    const productData = productServiceSpy.addProduct.calls.mostRecent().args[0]
    expect(productData.reference).toBe("REF12345")
    expect(productData.name).toBe("Test Product")
  })

  it("should call updateProduct when submitting an existing product", () => {
    // Configurar el formulario con datos válidos
    component.productForm.patchValue({
      reference: "REF12345",
      name: "Test Product",
      price: 99.99,
      description: "This is a test product description",
      productType: "Sabatilles de padel",
      imageUrl: "http://example.com/image.jpg",
    })

    // Configurar modo edición
    component.isEditing = true
    component.currentProductId = 1

    // Llamar al método onSubmit
    component.onSubmit()

    // Verificar que se llamó al método updateProduct del servicio
    expect(productServiceSpy.updateProduct).toHaveBeenCalled()

    // Verificar que se pasaron los datos correctos
    const productData = productServiceSpy.updateProduct.calls.mostRecent().args[0]
    expect(productData.id).toBe(1)
    expect(productData.reference).toBe("REF12345")
    expect(productData.name).toBe("Test Product")
  })

  it("should search for product by reference", () => {
    // Mock del producto que se va a encontrar
    const mockProduct = {
      id: 1,
      reference: "REF12345",
      name: "Test Product",
      price: 99.99,
      description: "This is a test product description",
      productType: "Sabatilles de padel",
      isOffer: false,
      imageUrl: "http://example.com/image.jpg",
    }

    // Configurar el spy para devolver el producto mock
    productServiceSpy.getProductByReference.and.returnValue(mockProduct)

    // Establecer la referencia en el formulario
    component.productForm.get("reference")?.setValue("REF12345")

    // Llamar al método searchByReference
    component.searchByReference()

    // Verificar que se llamó al método getProductByReference
    expect(productServiceSpy.getProductByReference).toHaveBeenCalledWith("REF12345")

    // Verificar que el formulario se actualizó con los datos del producto
    expect(component.isEditing).toBeTrue()
    expect(component.currentProductId).toBe(1)
    expect(component.productForm.get("name")?.value).toBe("Test Product")
    expect(component.productForm.get("price")?.value).toBe(99.99)
  })

  it("should handle image upload", () => {
    // Crear un mock del evento de selección de archivo
    const mockFile = new File([""], "test-image.jpg", { type: "image/jpeg" })
    const mockEvent = { target: { files: [mockFile] } as any }

    // Llamar al método onImageSelected
    component.onImageSelected(mockEvent)

    // Verificar que se llamó al método uploadImage del servicio
    expect(productServiceSpy.uploadImage).toHaveBeenCalledWith(mockFile)

    // Verificar que la URL de la imagen se estableció en el formulario
    expect(component.imageUploaded).toBeTrue()
    expect(component.productForm.get("imageUrl")?.value).toBe("http://example.com/image.jpg")
  })

  it("should delete current product when confirmed", () => {
    // Configurar el componente con un ID de producto actual
    component.currentProductId = 1

    // Mock para window.confirm
    windowSpy = spyOn(window, "confirm").and.returnValue(true)

    // Llamar al método deleteCurrentProduct
    component.deleteCurrentProduct()

    // Verificar que se llamó al método deleteProduct del servicio
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(1)

    // Verificar que se navegó a la página de productos
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/products"])
  })

  it("should not delete product when confirmation is cancelled", () => {
    // Configurar el componente con un ID de producto actual
    component.currentProductId = 1

    // Mock para window.confirm
    windowSpy = spyOn(window, "confirm").and.returnValue(false)

    // Llamar al método deleteCurrentProduct
    component.deleteCurrentProduct()

    // Verificar que NO se llamó al método deleteProduct del servicio
    expect(productServiceSpy.deleteProduct).not.toHaveBeenCalled()
  })
})