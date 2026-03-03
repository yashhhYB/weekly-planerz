import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation bar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const navbar = compiled.querySelector('nav.navbar');
    expect(navbar).toBeTruthy();
  });

  it('should display app title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.nav-brand h1');
    expect(title?.textContent).toContain('Weekly Planner');
  });

  it('should have navigation links', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('.nav-links a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have dashboard link', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('[routerLink="/dashboard"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have planning weeks link', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('[routerLink="/planning"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have backlog link', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('[routerLink="/backlog"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render router outlet', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const outlet = compiled.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should render footer', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const footer = compiled.querySelector('footer.footer');
    expect(footer).toBeTruthy();
  });

  it('should display copyright text', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const footer = compiled.querySelector('footer');
    expect(footer?.textContent).toContain('Weekly Planner');
    expect(footer?.textContent).toContain('2026');
  });
});
