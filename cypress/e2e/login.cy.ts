describe("Login Functionality", () => {
    beforeEach(() => {
      // Visitar la página de login antes de cada test
      cy.visit("/login")
    })
  
    it("should display login form", () => {
      // Verificar que el formulario de login se muestra correctamente
      cy.get("form").should("be.visible")
      cy.get('input[type="email"]').should("be.visible")
      cy.get('input[type="password"]').should("be.visible")
      cy.get('button[type="submit"]').should("be.visible")
    })
  
    it("should validate required fields", () => {
      // Intentar enviar el formulario sin rellenar campos
      cy.get('button[type="submit"]').click()
  
      // Verificar que aparecen mensajes de error
      cy.get(".error-message").should("be.visible")
    })
  
    it("should show error message for invalid credentials", () => {
      // Interceptar la solicitud de login para simular un error de autenticación
      cy.intercept("POST", "http://localhost:3000/users/login", {
        statusCode: 401,
        body: {
          message: "Credenciales inválidas",
        },
      }).as("loginFailure")
  
      // Rellenar el formulario con credenciales incorrectas
      cy.get('input[type="email"]').type("wrong@example.com")
      cy.get('input[type="password"]').type("wrongpassword")
      cy.get('button[type="submit"]').click()
  
      // Esperar a que se complete la solicitud
      cy.wait("@loginFailure")
  
      // Verificar que se muestra un mensaje de error
      cy.get(".alert-error").should("be.visible")
      cy.get(".alert-error").should("contain", "Credenciales inválidas")
  
      // Verificar que seguimos en la página de login
      cy.url().should("include", "/login")
    })
  
    it("should login successfully and redirect to home", () => {
      // Interceptar la solicitud de login para simular un inicio de sesión exitoso
      cy.intercept("POST", "http://localhost:3000/users/login", {
        statusCode: 200,
        body: {
          token: "fake-jwt-token",
          id: 1,
        },
      }).as("loginSuccess")
  
      // Interceptar la solicitud para obtener datos del usuario
      cy.intercept("GET", "http://localhost:3000/users/1", {
        statusCode: 200,
        body: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      }).as("getUserData")
  
      // Rellenar el formulario con credenciales correctas
      cy.get('input[type="email"]').type("test@example.com")
      cy.get('input[type="password"]').type("password123")
      cy.get('button[type="submit"]').click()
  
      // Esperar a que se completen las solicitudes
      cy.wait("@loginSuccess")
      cy.wait("@getUserData")
  
      // Verificar que se redirige a la página principal
      cy.url().should("include", "/home")
  
      // Verificar que el token se ha guardado en localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.eq("fake-jwt-token")
        expect(win.localStorage.getItem("user")).to.not.be.null
      })
    })
  
    it("should redirect admin users to admin dashboard", () => {
      // Interceptar la solicitud de login para simular un inicio de sesión exitoso como admin
      cy.intercept("POST", "http://localhost:3000/users/login", {
        statusCode: 200,
        body: {
          token: "fake-admin-token",
          id: 2,
        },
      }).as("adminLoginSuccess")
  
      // Interceptar la solicitud para obtener datos del usuario admin
      cy.intercept("GET", "http://localhost:3000/users/2", {
        statusCode: 200,
        body: {
          id: 2,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
      }).as("getAdminData")
  
      // Rellenar el formulario con credenciales de admin
      cy.get('input[type="email"]').type("admin@example.com")
      cy.get('input[type="password"]').type("adminpass")
      cy.get('button[type="submit"]').click()
  
      // Esperar a que se completen las solicitudes
      cy.wait("@adminLoginSuccess")
      cy.wait("@getAdminData")
  
      // Verificar que se redirige al dashboard de admin
      cy.url().should("include", "/admin")
    })
  })