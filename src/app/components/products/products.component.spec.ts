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

  // Datos de prueba
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
    // Crear spies para los servicios
    productServiceSpy = jasmine.createSpyObj("ProductService", ["loadProducts", "deleteProduct"])
    authServiceSpy = jasmine.createSpyObj("AuthService", ["isAuthenticated", "getUser"])
    cartServiceSpy = jasmine.createSpyObj("CartService", ["addToCart"])
    routerSpy = jasmine.createSpyObj("Router", ["navigate"])

    // Configurar comportamiento de los spies
    productServiceSpy.products$ = of(mockProducts)
    authServiceSpy.isAuthenticated.and.returnValue(of(true))
    authServiceSpy.getUser.and.returnValue({ role: "admin" })
    cartServiceSpy.addToCart.and.returnValue(of({ message: "Product added to cart" }))

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ProductsComponent],
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
    // Verificar que se llamó al método loadProducts
    expect(productServiceSpy.loadProducts).toHaveBeenCalled()

    // Verificar que los productos se cargaron correctamente
    expect(component.products.length).toBe(2)
    expect(component.filteredProducts.length).toBe(2)
    expect(component.isLoading).toBeFalse()
  })

  it("should filter products by name", () => {
    // Establecer término de búsqueda
    component.searchTerm = "running"

    // Llamar al método filterProducts
    component.filterProducts()

    // Verificar que solo se muestra el producto que coincide con la búsqueda
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].name).toBe("Running Shoes")
  })

  it("should filter products by reference", () => {
    // Establecer término de búsqueda
    component.searchTerm = "REF678"

    // Llamar al método filterProducts
    component.filterProducts()

    // Verificar que solo se muestra el producto que coincide con la búsqueda
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].reference).toBe("REF67890")
  })

  it("should filter products by product type", () => {
    // Establecer término de búsqueda
    component.searchTerm = "bàsquet"

    // Llamar al método filterProducts
    component.filterProducts()

    // Verificar que solo se muestra el producto que coincide con la búsqueda
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].productType).toBe("Sabatilles de bàsquet")
  })

  it("should update search term on onSearch", () => {
    // Crear un mock del evento
    const mockEvent = { target: { value: "basketball" } } as unknown as Event

    // Llamar al método onSearch
    component.onSearch(mockEvent)

    // Verificar que el término de búsqueda se actualizó
    expect(component.searchTerm).toBe("basketball")

    // Verificar que los productos se filtraron
    expect(component.filteredProducts.length).toBe(1)
    expect(component.filteredProducts[0].name).toBe("Basketball Shoes")
  })

  it("should delete product when confirmed", () => {
    // Mock para window.confirm
    confirmSpy = spyOn(window, "confirm").and.returnValue(true)

    // Configurar el spy para deleteProduct
    productServiceSpy.deleteProduct.and.returnValue(of({}))

    // Llamar al método deleteProduct
    component.deleteProduct(1)

    // Verificar que se llamó al método deleteProduct del servicio
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(1)
  })

  it("should not delete product when confirmation is cancelled", () => {
    // Mock para window.confirm
    confirmSpy = spyOn(window, "confirm").and.returnValue(false)

    // Llamar al método deleteProduct
    component.deleteProduct(1)

    // Verificar que NO se llamó al método deleteProduct del servicio
    expect(productServiceSpy.deleteProduct).not.toHaveBeenCalled()
  })

  it("should navigate to admin page when editing product", () => {
    // Llamar al método editProduct
    component.editProduct("REF12345")

    // Verificar que se navegó a la página de administración con el parámetro correcto
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin"], { queryParams: { reference: "REF12345" } })
  })

  it("should add product to cart when authenticated", () => {
    // Llamar al método addToCart
    component.addToCart(1)

    // Verificar que se llamó al método addToCart del servicio
    expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(1)
  })

  it("should redirect to login when adding to cart while not authenticated", () => {
    // Configurar el spy para que el usuario no esté autenticado
    authServiceSpy.isAuthenticated.and.returnValue(of(false))

    // Recrear el componente para que tome la nueva configuración
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ProductsComponent],
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

    // Llamar al método addToCart
    component.addToCart(1)

    // Verificar que se navegó a la página de login
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/login"])

    // Verificar que NO se llamó al método addToCart del servicio
    expect(cartServiceSpy.addToCart).not.toHaveBeenCalled()
  })
})