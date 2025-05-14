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
        { provide: PLATFORM_ID, useValue: "browser" },
      ],
    })

    service = TestBed.inject(ProductService)
    httpMock = TestBed.inject(HttpTestingController)
    
    // Handle the initial HTTP request that happens automatically
    const initialReq = httpMock.expectOne("http://localhost:3000/products")
    initialReq.flush([]) // Respond with empty array
  })

  afterEach(() => {
    // Verify that no requests are outstanding
    httpMock.verify()
  })

  it("should be created", () => {
    expect(service).toBeTruthy()
  })

  describe("loadProducts", () => {
    it("should fetch products from the API", () => {
      // Test data
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

      // Call loadProducts method
      service.loadProducts()

      // Expect and respond to the HTTP request
      const req = httpMock.expectOne("http://localhost:3000/products")
      expect(req.request.method).toBe("GET")
      req.flush(mockProducts)

      // Verify products were loaded correctly
      service.products$.subscribe((products) => {
        expect(products.length).toBe(2)
        expect(products[0].name).toBe("Running Shoes")
        expect(products[1].name).toBe("Basketball Shoes")

        // Verify snake_case to camelCase conversion
        expect(products[0].productType).toBe("Sabatilles de running de carretera - Home")
        expect(products[1].isOffer).toBe(true)
      })
    })
  })

  describe("addProduct", () => {
    it("should add a product and update the products list", () => {
      // Test product
      const newProduct: Product = {
        reference: "REF12345",
        name: "New Product",
        price: 99.99,
        description: "Test description",
        productType: "Sabatilles de padel",
        isOffer: false,
        imageUrl: "http://example.com/image.jpg",
      }

      // Expected server response
      const mockResponse = { id: 1, ...newProduct }

      // Call addProduct method
      service.addProduct(newProduct).subscribe((response) => {
        expect(response).toEqual(mockResponse)
      })

      // Expect and respond to the HTTP request
      const req = httpMock.expectOne("http://localhost:3000/products")
      expect(req.request.method).toBe("POST")

      // Verify data sent to server is in snake_case
      expect(req.request.body.product_type).toBe("Sabatilles de padel")
      expect(req.request.body.is_offer).toBe(false)

      req.flush(mockResponse)

      // Verify product was added to the list
      service.products$.subscribe((products) => {
        const addedProduct = products.find((p) => p.reference === "REF12345")
        expect(addedProduct).toBeTruthy()
        expect(addedProduct?.id).toBe(1)
      })
    })
  })

  describe("updateProduct", () => {
    it("should update an existing product", () => {
      // Test product
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

      // Call updateProduct method
      service.updateProduct(updatedProduct).subscribe((response) => {
        expect(response).toBeTruthy()
      })

      // Expect and respond to the HTTP request
      const req = httpMock.expectOne("http://localhost:3000/products/1")
      expect(req.request.method).toBe("PUT")

      // Verify data sent to server is in snake_case
      expect(req.request.body.product_type).toBe("Sabatilles de padel")
      expect(req.request.body.is_offer).toBe(true)

      req.flush({})
    })
  })

  describe("deleteProduct", () => {
    it("should delete a product and update the products list", () => {
      // Configure service with some products
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

      // Set initial products
      ;(service as any).products.next(initialProducts)

      // Call deleteProduct method
      service.deleteProduct(1).subscribe((response) => {
        expect(response).toBeTruthy()
      })

      // Expect and respond to the HTTP request
      const req = httpMock.expectOne("http://localhost:3000/products/1")
      expect(req.request.method).toBe("DELETE")
      req.flush({})

      // Verify product was removed from the list
      service.products$.subscribe((products) => {
        expect(products.length).toBe(0)
      })
    })
  })

  describe("uploadImage", () => {
    it("should upload an image and return the URL", () => {
      // Create a mock file
      const mockFile = new File([""], "test-image.jpg", { type: "image/jpeg" })

      // Expected server response
      const mockResponse = { imageUrl: "/uploads/test-image.jpg" }

      // Call uploadImage method
      service.uploadImage(mockFile).subscribe((response) => {
        // URL should be complete
        expect(response.imageUrl).toBe("http://192.168.11.199:3001/uploads/test-image.jpg")
      })

      // Expect and respond to the HTTP request
      const req = httpMock.expectOne("http://192.168.11.199:3001/upload")
      expect(req.request.method).toBe("POST")

      // Verify FormData with file was sent
      expect(req.request.body instanceof FormData).toBeTrue()

      req.flush(mockResponse)
    })
  })

  describe("getProductByReference", () => {
    it("should return a product by reference", () => {
      // Configure service with some products
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

      // Set products
      ;(service as any).products.next(mockProducts)

      // Call getProductByReference method
      const product = service.getProductByReference("REF12345")

      // Verify correct product was returned
      expect(product).toBeTruthy()
      expect(product?.id).toBe(1)
      expect(product?.name).toBe("Test Product")
    })

    it("should return undefined if product not found", () => {
      // Configure service with some products
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

      // Set products
      ;(service as any).products.next(mockProducts)

      // Call getProductByReference with non-existent reference
      const product = service.getProductByReference("NONEXISTENT")

      // Verify undefined was returned
      expect(product).toBeUndefined()
    })
  })
})