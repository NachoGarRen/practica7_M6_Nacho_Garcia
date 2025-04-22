// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando para iniciar sesión programáticamente
Cypress.Commands.add("login", (email, password) => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/users/login",
      body: {
        email,
        password,
      },
    }).then((response) => {
      // Guardar el token en localStorage
      window.localStorage.setItem("token", response.body.token)
  
      // Obtener datos del usuario
      cy.request({
        method: "GET",
        url: `http://localhost:3000/users/${response.body.id}`,
        headers: {
          Authorization: `Bearer ${response.body.token}`,
        },
      }).then((userResponse) => {
        // Guardar datos del usuario en localStorage
        window.localStorage.setItem("user", JSON.stringify(userResponse.body))
      })
    })
  })
  
  // Comando para cerrar sesión programáticamente
  Cypress.Commands.add("logout", () => {
    window.localStorage.removeItem("token")
    window.localStorage.removeItem("user")
  })
  
  // Declarar los tipos para TypeScript
  declare global {
    namespace Cypress {
      interface Chainable {
        login(email: string, password: string): Chainable<void>
        logout(): Chainable<void>
      }
    }
  }
  
  // Si estás usando cypress-file-upload, impórtalo aquí
  import "cypress-file-upload"