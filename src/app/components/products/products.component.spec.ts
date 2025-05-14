import { type ComponentFixture, TestBed } from "@angular/core/testing"
import { Router } from "@angular/router"
import { of } from "rxjs"
import { ProductsComponent } from "./products.component"
import { ProductService, type Product } from "../../services/product.service"
import { AuthService } from "../../services/auth.service"
import { CartService } from "../../services/cart.service"
import { CommonModule, CurrencyPipe } from "@angular/common"

describe("ProductsComponent", () => {
  let component: ProductsComponent
  let fixture: ComponentFixture<ProductsComponent>
  let productServiceSpy: jasmine.SpyObj<ProductService>
  let authServiceSpy: jasmine.SpyObj<AuthService>
  let cartServiceSpy: jasmine.SpyObj<CartService>
  let routerSpy: jasmine.SpyObj<Router>
  let confirmSpy: jasmine.Spy<any>

  // Test data
  const mockProducts: Product[] = [
    {
      id: 1,
      reference: "REF12345",
      name: "Running Shoes",
      price: 99.99,
      description: "Great running shoes",
      productType: "Sabatilles de running de carretera - Home",
      isOffer: false,
      imageUrl: "http://example.com/shoes1.jpg",
    },
    {
      id: 2,
      reference: "REF67890",
      name: "Basketball Shoes",
      price: 129.99,
      description: "Professional basketball shoes",
      productType: "Sabatilles de bàsquet",
      isOffer: true,
      imageUrl: "http://example.com/shoes2.jpg",
    },
  ]

  beforeEach(async () => {
    // Create spies for services
    productServiceSpy = jasmine.createSpyObj("ProductService", ["loadProducts", "deleteProduct"])
    authServiceSpy = jasmine.createSpyObj("AuthService", ["isAuthenticated", "getUser"])
    cartServiceSpy = jasmine.createSpyObj("CartService", ["addToCart"])
    routerSpy = jasmine.createSpyObj("Router", ["navigate"])

    // Configure spy behavior
    productServiceSpy.products$ = of(mockProducts)
    authServiceSpy.isAuthenticated.and.returnValue(of(true))
    authServiceSpy.getUser.and.returnValue({ role: "admin" })
    cartServiceSpy.addToCart.and.returnValue(of({ message: "Product added to cart" }))

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ProductsComponent // Move from declarations to imports since it's a standalone component
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy },
        CurrencyPipe,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ProductsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should load products on init", () => {
    // Verify loadProducts was called
    expect(productServiceSpy.loadProducts).toHaveBeenCalled()

    // Verify products were loaded correctly
    expect(component.products.length).toBe(2)
    expect(component.filteredProducts.length).toBe(2)
    expect(component.isLoading).toBeFalse()
  })

  it("should filter products by name", () => {
    // Set search term
    component.searchTerm = "running"

    // Call filterProducts method
    component.filterProducts()

    // Verify only matching product is shown
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].name).toBe("Running Shoes")
  })

  it("should filter products by reference", () => {
    // Set search term
    component.searchTerm = "REF678"

    // Call filterProducts method
    component.filterProducts()

    // Verify only matching product is shown
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].reference).toBe("REF67890")
  })

  it("should filter products by product type", () => {
    // Set search term
    component.searchTerm = "bàsquet"

    // Call filterProducts method
    component.filterProducts()

    // Verify only matching product is shown
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].productType).toBe("Sabatilles de bàsquet")
  })

  it("should update search term on onSearch", () => {
    // Create mock event
    const mockEvent = { target: { value: "basketball" } } as unknown as Event

    // Call onSearch method
    component.onSearch(mockEvent)

    // Verify search term was updated
    expect(component.searchTerm).toBe("basketball")

    // Verify products were filtered
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].name).toBe("Basketball Shoes")
  })

  it("should delete product when confirmed", () => {
    // Mock for window.confirm
    confirmSpy = spyOn(window, "confirm").and.returnValue(true)

    // Configure deleteProduct spy
    productServiceSpy.deleteProduct.and.returnValue(of({}))

    // Call deleteProduct method
    component.deleteProduct(1)

    // Verify service's deleteProduct was called
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(1)
  })

  it("should not delete product when confirmation is cancelled", () => {
    // Mock for window.confirm
    confirmSpy = spyOn(window, "confirm").and.returnValue(false)

    // Call deleteProduct method
    component.deleteProduct(1)

    // Verify service's deleteProduct was NOT called
    expect(productServiceSpy.deleteProduct).not.toHaveBeenCalled()
  })

  it("should navigate to admin page when editing product", () => {
    // Call editProduct method
    component.editProduct("REF12345")

    // Verify navigation to admin page with correct parameter
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin"], { queryParams: { reference: "REF12345" } })
  })

  it("should add product to cart when authenticated", () => {
    // Call addToCart method
    component.addToCart(1)

    // Verify service's addToCart was called
    expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(1)
  })

  it("should redirect to login when adding to cart while not authenticated", () => {
    // Configure spy for unauthenticated user
    authServiceSpy.isAuthenticated.and.returnValue(of(false))

    // Recreate component with new configuration
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ProductsComponent // Move from declarations to imports
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy },
        CurrencyPipe,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ProductsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    // Call addToCart method
    component.addToCart(1)

    // Verify navigation to login page
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/login"])

    // Verify service's addToCart was NOT called
    expect(cartServiceSpy.addToCart).not.toHaveBeenCalled()
  })
})