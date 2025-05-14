import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'miProyectoAngular' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('miProyectoAngular');
  });

  // Update this test to match your actual component structure
  it('should render the app correctly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Replace this with a check that matches your actual component
    // For example, if you have a header element:
    // expect(compiled.querySelector('header')).toBeTruthy();
    
    // Or if you have a specific class or ID:
    // expect(compiled.querySelector('.app-container')).toBeTruthy();
    
    // Or if you want to check for router-outlet:
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});