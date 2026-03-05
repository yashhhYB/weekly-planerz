import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of, BehaviorSubject } from 'rxjs';
import { HomeComponent } from './home.component';
import { AppStoreState } from '../store';
import * as PlanningSelectors from '../store/planning/planning.selectors';
import * as TeamSelectors from '../store/team/team.selectors';
import { Router, provideRouter } from '@angular/router';
import { PlanningWeek, PlanningStatus, TeamMember, UserRole } from '../models';
import { UserContextService } from '../core/services/user-context.service';
import { WeekMemberService } from '../core/services/week-member.service';
import { PlanningService } from '../core/services/planning.service';
import { ToastService } from '../core/services/toast.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: Router;
  let userSubject: BehaviorSubject<TeamMember | null>;

  const mockLead: TeamMember = {
    id: 'lead-1', name: 'Acc', role: UserRole.TeamLead, createdAt: new Date()
  };

  const mockMember: TeamMember = {
    id: 'mem-1', name: 'Kim', role: UserRole.TeamMember, createdAt: new Date()
  };

  const mockWeeks: PlanningWeek[] = [
    {
      id: 'w1',
      planningDate: new Date('2026-01-07'),
      startDate: new Date('2026-01-08'),
      endDate: new Date('2026-01-13'),
      status: PlanningStatus.InProgress,
      isFrozen: false,
      clientPercent: 34,
      techDebtPercent: 33,
      rndPercent: 33,
      createdAt: new Date()
    }
  ];

  function setup(user: TeamMember | null, weeks: PlanningWeek[] = mockWeeks) {
    userSubject = new BehaviorSubject<TeamMember | null>(user);
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const weekMemberSpy = jasmine.createSpyObj('WeekMemberService', ['getWeekMembers']);
    weekMemberSpy.getWeekMembers.and.returnValue(of([]));

    const planningServiceSpy = jasmine.createSpyObj('PlanningService', ['deletePlanningWeek']);
    planningServiceSpy.deletePlanningWeek.and.returnValue(of(undefined));

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info'], {
      toast$: of()
    });

    const userCtxSpy = jasmine.createSpyObj('UserContextService', ['setCurrentUser', 'clearCurrentUser'], {
      currentUser$: userSubject.asObservable(),
      currentUser: user
    });

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of(weeks);
      }
      if (selector === TeamSelectors.selectAllTeamMembers) {
        return of([mockLead, mockMember]);
      }
      return of([]);
    });

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: UserContextService, useValue: userCtxSpy },
        { provide: WeekMemberService, useValue: weekMemberSpy },
        { provide: PlanningService, useValue: planningServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        provideRouter([])
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup(mockLead);
    expect(component).toBeTruthy();
  });

  it('should show lead view with 6 cards when active week exists', () => {
    setup(mockLead);
    expect(component.isLead).toBeTrue();
    expect(component.activeWeek).toBeTruthy();
    const compiled = fixture.nativeElement;
    const actions = compiled.querySelectorAll('.action-card');
    expect(actions.length).toBe(6);
  });

  it('should show lead view with 4 cards when no active week', () => {
    setup(mockLead, []);
    expect(component.isLead).toBeTrue();
    expect(component.activeWeek).toBeNull();
    const compiled = fixture.nativeElement;
    const actions = compiled.querySelectorAll('.action-card');
    expect(actions.length).toBe(4);
  });

  it('should show member view with 3 cards when active week exists', () => {
    setup(mockMember);
    expect(component.isLead).toBeFalse();
    expect(component.activeWeek).toBeTruthy();
    const compiled = fixture.nativeElement;
    const actions = compiled.querySelectorAll('.action-card');
    expect(actions.length).toBe(3);
  });

  it('should show member view with 2 cards when no active week', () => {
    setup(mockMember, []);
    expect(component.isLead).toBeFalse();
    expect(component.activeWeek).toBeNull();
    const compiled = fixture.nativeElement;
    const actions = compiled.querySelectorAll('.action-card');
    expect(actions.length).toBe(2);
  });

  it('should display greeting with user name', () => {
    setup(mockLead);
    const compiled = fixture.nativeElement;
    const greeting = compiled.querySelector('.greeting-name');
    expect(greeting?.textContent).toContain('Acc');
  });

  it('should display Team Lead tag for lead', () => {
    setup(mockLead);
    const compiled = fixture.nativeElement;
    const tag = compiled.querySelector('.role-tag');
    expect(tag?.textContent).toContain('Team Lead');
  });

  it('should display Team Member tag for member', () => {
    setup(mockMember);
    const compiled = fixture.nativeElement;
    const tag = compiled.querySelector('.role-tag');
    expect(tag?.textContent).toContain('Team Member');
  });

  it('should show Start a New Week card for lead without active week', () => {
    setup(mockLead, []);
    const compiled = fixture.nativeElement;
    const startCard = compiled.querySelector('.start-card');
    expect(startCard).toBeTruthy();
    expect(startCard?.textContent).toContain('Start a New Week');
  });

  it('should not show Start a New Week card for lead with active week', () => {
    setup(mockLead);
    const compiled = fixture.nativeElement;
    const startCard = compiled.querySelector('.start-card');
    expect(startCard).toBeFalsy();
  });

  it('should navigate to correct path', () => {
    setup(mockLead);
    component.navigateTo('/planning/create');
    expect(router.navigate).toHaveBeenCalledWith(['/planning/create']);
  });

  it('should navigate to backlog', () => {
    setup(mockLead);
    component.navigateTo('/backlog');
    expect(router.navigate).toHaveBeenCalledWith(['/backlog']);
  });

  it('should show no-plan message for member with no active plan', () => {
    setup(mockMember);
    const compiled = fixture.nativeElement;
    // Member has action cards but no active plan card when memberWeekMember is null
    const planCard = compiled.querySelector('.active-plan-card');
    expect(planCard).toBeFalsy();
  });

  it('should show active week for lead', () => {
    setup(mockLead);
    expect(component.activeWeek).toBeTruthy();
    expect(component.activeWeek?.id).toBe('w1');
  });

  it('should format dates correctly', () => {
    setup(mockLead);
    const result = component.formatDate(new Date('2026-01-08'));
    expect(result).toContain('Jan');
  });

  it('should return correct status label', () => {
    setup(mockLead);
    expect(component.getStatusLabel(PlanningStatus.InProgress)).toBe('In Progress');
    expect(component.getStatusLabel(PlanningStatus.Setup)).toBe('Setup');
    expect(component.getStatusLabel(PlanningStatus.Completed)).toBe('Completed');
  });
});
