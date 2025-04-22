import { TestBed } from "@angular/core/testing"
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing"
import { PLATFORM_ID } from "@angular/core"
import { ProductService, type Product } from "./product.service"

describe("ProductService", () => {
  let service: ProductService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductService,
        { provide: PLATFORM_ID, useValue: "browser" }, // Simular entorno de navegador
      ],
    })

    service = TestBed.inject(ProductService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    // Verificar que no hay solicitudes pendientes
    httpMock.verify()
  })

  it("should be created", () => {
    expect(service).toBeTruthy()
  })

  describe("loadProducts", () => {
    it("should fetch products from the API", () => {
      // Datos de prueba
      const mockProducts = [
        {
          id: 1,
          reference: "REF12345",
          name: "Running Shoes",
          price: 99.99,
          description: "Great running shoes",
          product_type: "Sabatilles de running de carretera - Home",
          is_offer: false,
          image_url: "http://example.com/shoes1.jpg",
        },
        {
          id: 2,
          reference: "REF67890",
          name: "Basketball Shoes",
          price: 129.99,
          description: "Professional basketball shoes",
          product_type: "Sabatilles de bàsquet",
          is_offer: true,
          image_url: "http://example.com/shoes2.jpg",
        },
      ]

      // Llamar al método loadProducts
      service.loadProducts()

      // Esperar y responder a la solicitud HTTP
      const req = httpMock.expectOne("http://localhost:3000/products")
      expect(req.request.method).toBe("GET")
      req.flush(mockProducts)

      // Verificar que los productos se cargaron correctamente
      service.products$.subscribe((products) => {
        expect(products.length).toBe(2)
        expect(products[0].name).toBe("Running Shoes")
        expect(products[1].name).toBe("Basketball Shoes")

        // Verificar la conversión de snake_case a camelCase
        expect(products[0].productType).toBe("Sabatilles de running de carretera - Home")
        expect(products[1].isOffer).toBe(true)
      })
    })
  })

  describe("addProduct", () => {
    it("should add a product and update the products list", () => {
      // Producto de prueba
      const newProduct: Product = {
        reference: "REF12345",
        name: "New Product",
        price: 99.99,
        description: "Test description",
        productType: "Sabatilles de padel",
        isOffer: false,
        imageUrl: "http://example.com/image.jpg",
      }

      // Respuesta esperada del servidor
      const mockResponse = { id: 1, ...newProduct }

      // Llamar al método addProduct
      service.addProduct(newProduct).subscribe((response) => {
        expect(response).toEqual(mockResponse)
      })

      // Esperar y responder a la solicitud HTTP
      const req = httpMock.expectOne("http://localhost:3000/products")
      expect(req.request.method).toBe("POST")

      // Verificar que los datos enviados al servidor están en snake_case
      expect(req.request.body.product_type).toBe("Sabatilles de padel")
      expect(req.request.body.is_offer).toBe(false)

      req.flush(mockResponse)

      // Verificar que el producto se añadió a la lista
      service.products$.subscribe((products) => {
        const addedProduct = products.find((p) => p.reference === "REF12345")
        expect(addedProduct).toBeTruthy()
        expect(addedProduct?.id).toBe(1)
      })
    })
  })

  describe("updateProduct", () => {
    it("should update an existing product", () => {
      // Producto de prueba
      const updatedProduct: Product = {
        id: 1,
        reference: "REF12345",
        name: "Updated Product",
        price: 129.99,
        description: "Updated description",
        productType: "Sabatilles de padel",
        isOffer: true,
        imageUrl: "http://example.com/updated-image.jpg",
      }

      // Llamar al método updateProduct
      service.updateProduct(updatedProduct).subscribe((response) => {
        expect(response).toBeTruthy()
      })

      // Esperar y responder a la solicitud HTTP
      const req = httpMock.expectOne("http://localhost:3000/products/1")
      expect(req.request.method).toBe("PUT")

      // Verificar que los datos enviados al servidor están en snake_case
      expect(req.request.body.product_type).toBe("Sabatilles de padel")
      expect(req.request.body.is_offer).toBe(true)

      req.flush({})
    })
  })

  describe("deleteProduct", () => {
    it("should delete a product and update the products list", () => {
      // Configurar el servicio con algunos productos
      const initialProducts = [
        {
          id: 1,
          reference: "REF12345",
          name: "Product to Delete",
          price: 99.99,
          description: "Test description",
          productType: "Sabatilles de padel",
          isOffer: false,
          imageUrl: "http://example.com/image.jpg",
        },
      ]

      // Establecer los productos iniciales
      ;(service as any).products.next(initialProducts)

      // Llamar al método deleteProduct
      service.deleteProduct(1).subscribe((response) => {
        expect(response).toBeTruthy()
      })

      // Esperar y responder a la solicitud HTTP
      const req = httpMock.expectOne("http://localhost:3000/products/1")
      expect(req.request.method).toBe("DELETE")
      req.flush({})

      // Verificar que el producto se eliminó de la lista
      service.products$.subscribe((products) => {
        expect(products.length).toBe(0)
      })
    })
  })

  describe("uploadImage", () => {
    it("should upload an image and return the URL", () => {
      // Crear un mock de archivo
      const mockFile = new File([""], "test-image.jpg", { type: "image/jpeg" })

      // Respuesta esperada del servidor
      const mockResponse = { imageUrl: "/uploads/test-image.jpg" }

      // Llamar al método uploadImage
      service.uploadImage(mockFile).subscribe((response) => {
        // La URL debe ser completa
        expect(response.imageUrl).toBe("http://192.168.11.199:3001/uploads/test-image.jpg")
      })

      // Esperar y responder a la solicitud HTTP
      const req = httpMock.expectOne("http://192.168.11.199:3001/upload")
      expect(req.request.method).toBe("POST")

      // Verificar que se envió un FormData con el archivo
      expect(req.request.body instanceof FormData).toBeTrue()

      req.flush(mockResponse)
    })
  })

  describe("getProductByReference", () => {
    it("should return a product by reference", () => {
      // Configurar el servicio con algunos productos
      const mockProducts = [
        {
          id: 1,
          reference: "REF12345",
          name: "Test Product",
          price: 99.99,
          description: "Test description",
          productType: "Sabatilles de padel",
          isOffer: false,
          imageUrl: "http://example.com/image.jpg",
        },
      ]

      // Establecer los productos
      ;(service as any).products.next(mockProducts)

      // Llamar al método getProductByReference
      const product = service.getProductByReference("REF12345")

      // Verificar que se devolvió el producto correcto
      expect(product).toBeTruthy()
      expect(product?.id).toBe(1)
      expect(product?.name).toBe("Test Product")
    })

    it("should return undefined if product not found", () => {
      // Configurar el servicio con algunos productos
      const mockProducts = [
        {
          id: 1,
          reference: "REF12345",
          name: "Test Product",
          price: 99.99,
          description: "Test description",
          productType: "Sabatilles de padel",
          isOffer: false,
          imageUrl: "http://example.com/image.jpg",
        },
      ]

      // Establecer los productos
      ;(service as any).products.next(mockProducts)

      // Llamar al método getProductByReference con una referencia que no existe
      const product = service.getProductByReference("NONEXISTENT")

      // Verificar que se devolvió undefined
      expect(product).toBeUndefined()
    })
  })
})