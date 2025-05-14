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
    // Create spies for services
    productServiceSpy = jasmine.createSpyObj("ProductService", [
      "addProduct",
      "updateProduct",
      "deleteProduct",
      "getProductByReference",
      "uploadImage",
    ])

    authServiceSpy = jasmine.createSpyObj("AuthService", ["getUser"])
    routerSpy = jasmine.createSpyObj("Router", ["navigate"])

    // Mock for ActivatedRoute
    activatedRouteMock = {
      queryParams: of({}),
    }

    // Configure spy behavior
    authServiceSpy.getUser.and.returnValue({ role: "admin" })
    productServiceSpy.addProduct.and.returnValue(of({ id: 1 }))
    productServiceSpy.updateProduct.and.returnValue(of({}))
    productServiceSpy.deleteProduct.and.returnValue(of({}))
    productServiceSpy.uploadImage.and.returnValue(of({ imageUrl: "http://example.com/image.jpg" }))

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, 
        CommonModule,
        AdminComponent // Move from declarations to imports since it's a standalone component
      ],
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

    // Initially the form is invalid because all required fields are empty
    expect(form.valid).toBeFalsy()

    // Fill in required fields
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
    // Configure form with valid data
    component.productForm.patchValue({
      reference: "REF12345",
      name: "Test Product",
      price: 99.99,
      description: "This is a test product description",
      productType: "Sabatilles de padel",
      imageUrl: "http://example.com/image.jpg",
    })

    // Make sure we're not in edit mode
    component.isEditing = false
    component.currentProductId = null

    // Call onSubmit method
    component.onSubmit()

    // Verify addProduct method was called
    expect(productServiceSpy.addProduct).toHaveBeenCalled()

    // Verify correct data was passed
    const productData = productServiceSpy.addProduct.calls.mostRecent().args[0]
    expect(productData.reference).toBe("REF12345")
    expect(productData.name).toBe("Test Product")
  })

  it("should call updateProduct when submitting an existing product", () => {
    // Configure form with valid data
    component.productForm.patchValue({
      reference: "REF12345",
      name: "Test Product",
      price: 99.99,
      description: "This is a test product description",
      productType: "Sabatilles de padel",
      imageUrl: "http://example.com/image.jpg",
    })

    // Configure edit mode
    component.isEditing = true
    component.currentProductId = 1

    // Call onSubmit method
    component.onSubmit()

    // Verify updateProduct method was called
    expect(productServiceSpy.updateProduct).toHaveBeenCalled()

    // Verify correct data was passed
    const productData = productServiceSpy.updateProduct.calls.mostRecent().args[0]
    expect(productData.id).toBe(1)
    expect(productData.reference).toBe("REF12345")
    expect(productData.name).toBe("Test Product")
  })

  it("should search for product by reference", () => {
    // Mock product to be found
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

    // Configure spy to return mock product
    productServiceSpy.getProductByReference.and.returnValue(mockProduct)

    // Set reference in form
    component.productForm.get("reference")?.setValue("REF12345")

    // Call searchByReference method
    component.searchByReference()

    // Verify getProductByReference was called
    expect(productServiceSpy.getProductByReference).toHaveBeenCalledWith("REF12345")

    // Verify form was updated with product data
    expect(component.isEditing).toBeTrue()
    expect(component.currentProductId).toBe(1)
    expect(component.productForm.get("name")?.value).toBe("Test Product")
    expect(component.productForm.get("price")?.value).toBe(99.99)
  })

  it("should handle image upload", () => {
    // Create mock file selection event
    const mockFile = new File([""], "test-image.jpg", { type: "image/jpeg" })
    const mockEvent = { target: { files: [mockFile] } as any }

    // Call onImageSelected method
    component.onImageSelected(mockEvent)

    // Verify uploadImage method was called
    expect(productServiceSpy.uploadImage).toHaveBeenCalledWith(mockFile)

    // Verify image URL was set in form
    expect(component.imageUploaded).toBeTrue()
    expect(component.productForm.get("imageUrl")?.value).toBe("http://example.com/image.jpg")
  })

  it("should delete current product when confirmed", () => {
    // Configure component with current product ID
    component.currentProductId = 1

    // Mock for window.confirm
    windowSpy = spyOn(window, "confirm").and.returnValue(true)

    // Call deleteCurrentProduct method
    component.deleteCurrentProduct()

    // Verify deleteProduct method was called
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(1)

    // Verify navigation to products page
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/products"])
  })

  it("should not delete product when confirmation is cancelled", () => {
    // Configure component with current product ID
    component.currentProductId = 1

    // Mock for window.confirm
    windowSpy = spyOn(window, "confirm").and.returnValue(false)

    // Call deleteCurrentProduct method
    component.deleteCurrentProduct()

    // Verify deleteProduct method was NOT called
    expect(productServiceSpy.deleteProduct).not.toHaveBeenCalled()
  })
})