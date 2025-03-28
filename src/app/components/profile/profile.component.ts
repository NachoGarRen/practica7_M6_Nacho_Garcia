import { Component, OnInit } from "@angular/core"
import { CommonModule, DatePipe, CurrencyPipe } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { PurchaseService, Purchase } from "../../services/purchase.service"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup
  user: any = null
  purchases: Purchase[] = []
  isLoading = true
  isSubmitting = false
  updateSuccess = false
  updateError = ""
  activeTab = 'profile' // 'profile' o 'purchases'

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private purchaseService: PurchaseService
  ) {
    this.profileForm = this.createForm()
  }

  ngOnInit() {
    // Cargar datos del usuario
    this.user = this.authService.getUser()
    if (this.user) {
      this.profileForm.patchValue({
        email: this.user.email,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        birth_date: this.formatDateForInput(this.user.birth_date),
        country_code: this.user.country_code,
        gender: this.user.gender,
        marketing_consent: this.user.marketing_consent
      })
    }

    // Cargar historial de compras
    this.loadPurchaseHistory()
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: [{ value: '', disabled: true }], // Email no editable
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      birth_date: ['', Validators.required],
      country_code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(3)]],
      gender: ['', Validators.required],
      marketing_consent: [false],
      current_password: [''],
      new_password: ['', [Validators.minLength(8)]],
      confirm_password: ['']
    }, { validators: this.passwordMatchValidator })
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('new_password')?.value
    const confirmPassword = form.get('confirm_password')?.value
  
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirm_password')?.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }
  
    return null
  }
  // Formatear fecha para el input type="date"
  formatDateForInput(dateString: string | undefined): string {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Cargar historial de compras
  loadPurchaseHistory() {
    this.isLoading = true
    this.purchaseService.loadPurchaseHistory().subscribe(
      (purchases) => {
        this.purchases = purchases
        this.isLoading = false
      }
    )
  }

  // Cambiar entre pestañas
  setActiveTab(tab: string) {
    this.activeTab = tab
    if (tab === 'purchases') {
      this.loadPurchaseHistory()
    }
  }

  // Enviar formulario de actualización de perfil
  onSubmit() {
    if (this.profileForm.valid && !this.isSubmitting) {
      this.isSubmitting = true
      this.updateSuccess = false
      this.updateError = ""

      // Preparar datos para enviar
      const userData = {
        first_name: this.profileForm.get('first_name')?.value,
        last_name: this.profileForm.get('last_name')?.value,
        birth_date: this.profileForm.get('birth_date')?.value,
        country_code: this.profileForm.get('country_code')?.value,
        gender: this.profileForm.get('gender')?.value,
        marketing_consent: this.profileForm.get('marketing_consent')?.value,
      }

      // Si se está cambiando la contraseña, añadir esos campos
      const newPassword = this.profileForm.get('new_password')?.value
      if (newPassword) {
        Object.assign(userData, {
          current_password: this.profileForm.get('current_password')?.value,
          new_password: newPassword
        })
      }

      // Llamar al servicio para actualizar el perfil
      // Nota: Necesitarás implementar este método en AuthService
      this.authService.updateProfile(userData).subscribe({
        next: (response) => {
          this.isSubmitting = false
          this.updateSuccess = true
          
          // Actualizar el usuario en el servicio de autenticación
          const updatedUser = { ...this.user, ...userData }
          // Necesitarás implementar este método en AuthService
          this.authService.updateUserData(updatedUser)
          
          // Actualizar el usuario local
          this.user = updatedUser
          
          // Limpiar campos de contraseña
          this.profileForm.patchValue({
            current_password: '',
            new_password: '',
            confirm_password: ''
          })
        },
        error: (error) => {
          this.isSubmitting = false
          this.updateError = error.message || "Error al actualizar el perfil"
          console.error("Error updating profile:", error)
        }
      })
    } else {
      // Marcar todos los campos como tocados para mostrar errores de validación
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key)
        control?.markAsTouched()
      })
    }
  }
}