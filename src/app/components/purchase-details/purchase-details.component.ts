import { Component, OnInit } from "@angular/core"
import { CommonModule, DatePipe, CurrencyPipe } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"
import { PurchaseService, Purchase } from "../../services/purchase.service"

@Component({
  selector: "app-purchase-details",
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: "./purchase-details.component.html",
  styleUrls: ["./purchase-details.component.css"],
})
export class PurchaseDetailsComponent implements OnInit {
  purchase: Purchase | null = null
  isLoading = true
  error = ""

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const purchaseId = +params['id'] // Convertir a número
      if (purchaseId) {
        this.loadPurchaseDetails(purchaseId)
      } else {
        this.error = "ID de compra no válido"
        this.isLoading = false
      }
    })
  }

  loadPurchaseDetails(purchaseId: number) {
    this.isLoading = true
    this.purchaseService.getPurchaseDetails(purchaseId).subscribe({
      next: (purchase) => {
        this.purchase = purchase
        this.isLoading = false
      },
      error: (error) => {
        this.error = "Error al cargar los detalles de la compra"
        this.isLoading = false
        console.error("Error loading purchase details:", error)
      }
    })
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'processing':
        return 'En proceso'
      case 'shipped':
        return 'Enviado'
      default:
        return 'Pendiente'
    }
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase()
  }
}