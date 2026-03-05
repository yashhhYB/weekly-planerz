import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { UserContextService } from './core/services/user-context.service';
import { DataManagementService } from './core/services/data-management.service';
import { ToastService } from './core/services/toast.service';
import { UserRole } from './models';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of([]));

    const userCtxSpy = jasmine.createSpyObj('UserContextService', ['setCurrentUser', 'clearCurrentUser', 'refreshFromMembers'], {
      currentUser$: of(null),
      currentUser: null
    });

    const dataMgmtSpy = jasmine.createSpyObj('DataManagementService', ['exportData', 'importData', 'seedData', 'resetData']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning'], { toast$: of() });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: Store, useValue: storeSpy },
        { provide: UserContextService, useValue: userCtxSpy },
        { provide: DataManagementService, useValue: dataMgmtSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation bar when not on setup', () => {
    component.hideNav = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const navbar = compiled.querySelector('nav.navbar');
    expect(navbar).toBeTruthy();
  });

  it('should display app title', () => {
    component.hideNav = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.nav-brand h1');
    expect(title?.textContent).toContain('Weekly Plan');
  });

  it('should have navigation links', () => {
    component.hideNav = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('.nav-links a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have home link', () => {
    component.hideNav = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('[routerLink="/home"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have planning weeks link when user is lead', () => {
    component.hideNav = false;
    fixture.detectChanges(); // trigger ngOnInit
    component.currentUser = { id: 'lead-1', name: 'Lead', role: UserRole.TeamLead, createdAt: new Date() };
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('[routerLink="/planning"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should not have planning link when user is member', () => {
    component.hideNav = false;
    fixture.detectChanges(); // trigger ngOnInit
    component.currentUser = { id: 'mem-1', name: 'Member', role: UserRole.TeamMember, createdAt: new Date() };
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('[routerLink="/planning"]');
    expect(links.length).toBe(0);
  });

  it('should have backlog link', () => {
    component.hideNav = false;
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
});
