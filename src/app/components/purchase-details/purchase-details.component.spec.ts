import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PurchaseDetailsComponent } from './purchase-details.component';

describe('PurchaseDetailsComponent', () => {
  let component: PurchaseDetailsComponent;
  let fixture: ComponentFixture<PurchaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        PurchaseDetailsComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }),
            queryParams: of({}),
            snapshot: {
              paramMap: {
                get: () => '123'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
