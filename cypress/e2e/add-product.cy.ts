describe("Add Product Form", () => {
    beforeEach(() => {
      // Interceptar la solicitud de login para simular un inicio de sesión exitoso
      cy.intercept("POST", "http://localhost:3000/users/login", {
        statusCode: 200,
        body: {
          token: "fake-jwt-token",
          id: 1,
        },
      }).as("loginRequest")
  
      // Interceptar la solicitud para obtener datos del usuario
      cy.intercept("GET", "http://localhost:3000/users/1", {
        statusCode: 200,
        body: {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
      }).as("getUserRequest")
  
      // Visitar la página de login
      cy.visit("/login")
  
      // Rellenar el formulario de login
      cy.get('input[type="email"]').type("admin@example.com")
      cy.get('input[type="password"]').type("password123")
      cy.get('button[type="submit"]').click()
  
      // Esperar a que se complete la solicitud de login
      cy.wait("@loginRequest")
      cy.wait("@getUserRequest")
  
      // Navegar a la página de administración
      cy.visit("/admin")
    })
  
    it("should validate form fields", () => {
      // Intentar enviar el formulario sin rellenar campos
      cy.get(".submit-button").click()
  
      // Verificar que aparecen mensajes de error para los campos requeridos
      cy.get(".error-message").should("be.visible")
      cy.get(".error-message").should("contain", "obligatorio")
  
      // Verificar que el formulario no se envió
      cy.url().should("include", "/admin")
    })
  
    it("should add a new product successfully", () => {
      // Interceptar la solicitud de subida de imagen
      cy.intercept("POST", "http://192.168.11.199:3001/upload", {
        statusCode: 200,
        body: {
          imageUrl: "/uploads/test-image.jpg",
        },
      }).as("uploadImage")
  
      // Interceptar la solicitud de añadir producto
      cy.intercept("POST", "http://localhost:3000/products", {
        statusCode: 201,
        body: {
          id: 999,
          reference: "TEST12345",
          name: "Test Product",
          price: 99.99,
          description: "This is a test product",
          product_type: "Sabatilles de padel",
          is_offer: false,
          image_url: "http://192.168.11.199:3001/uploads/test-image.jpg",
        },
      }).as("addProduct")
  
      // Rellenar el formulario
      cy.get("#reference").type("TEST12345")
      cy.get("#name").type("Test Product")
      cy.get("#price").type("99.99")
      cy.get("#description").type("This is a test product for Cypress testing")
      cy.get("#productType").select("Sabatilles de padel")
  
      // Simular la carga de una imagen
      cy.get("#image").selectFile("cypress/fixtures/test-image.jpg", { force: true })
  
      // Esperar a que se complete la subida de la imagen
      cy.wait("@uploadImage")
  
      // Verificar que se muestra el mensaje de éxito para la imagen
      cy.get(".success-message").should("be.visible")
      cy.get(".success-message").should("contain", "Imagen subida correctamente")
  
      // Enviar el formulario
      cy.get(".submit-button").click()
  
      // Esperar a que se complete la solicitud de añadir producto
      cy.wait("@addProduct")
  
      // Verificar que el formulario se ha reseteado
      cy.get("#reference").should("have.value", "")
      cy.get("#name").should("have.value", "")
    })
  
    it("should edit an existing product", () => {
      // Interceptar la búsqueda de producto por referencia
      cy.intercept("GET", "http://localhost:3000/products*", {
        statusCode: 200,
        body: [
          {
            id: 1,
            reference: "EDIT12345",
            name: "Product to Edit",
            price: 79.99,
            description: "This product will be edited",
            product_type: "Sabatilles de padel",
            is_offer: false,
            image_url: "http://example.com/image.jpg",
          },
        ],
      }).as("getProducts")
  
      // Interceptar la solicitud de actualizar producto
      cy.intercept("PUT", "http://localhost:3000/products/1", {
        statusCode: 200,
        body: {
          id: 1,
          reference: "EDIT12345",
          name: "Updated Product",
          price: 89.99,
          description: "This product has been updated",
          product_type: "Sabatilles de padel",
          is_offer: true,
          image_url: "http://example.com/image.jpg",
        },
      }).as("updateProduct")
  
      // Cargar la página y esperar a que se carguen los productos
      cy.visit("/admin?reference=EDIT12345")
      cy.wait("@getProducts")
  
      // Verificar que el formulario se ha rellenado con los datos del producto
      cy.get("#reference").should("have.value", "EDIT12345")
      cy.get("#name").should("have.value", "Product to Edit")
  
      // Modificar algunos campos
      cy.get("#name").clear().type("Updated Product")
      cy.get("#price").clear().type("89.99")
      cy.get("#description").clear().type("This product has been updated")
      cy.get('input[type="checkbox"]').check()
  
      // Enviar el formulario
      cy.get(".submit-button").contains("ACTUALIZAR PRODUCTO").click()
  
      // Esperar a que se complete la solicitud de actualizar producto
      cy.wait("@updateProduct")
    })
  })