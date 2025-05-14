import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Asegúrate de importar HttpClientTestingModule
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  let service: PurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule] // Asegúrate de incluir HttpClientTestingModule aquí
    });
    service = TestBed.inject(PurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
