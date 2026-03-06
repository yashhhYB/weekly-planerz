import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReviewFreezeComponent } from './review-freeze.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { PlanningService } from '../../../../core/services/planning.service';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PlanningStatus } from '../../../../models';
import { UserContextService } from '../../../../core/services/user-context.service';

/**
 * Unit tests for ReviewFreezeComponent
 * Validates freeze conditions, category summary, member progress, and freeze action
 */
describe('ReviewFreezeComponent', () => {
  let component: ReviewFreezeComponent;
  let fixture: ComponentFixture<ReviewFreezeComponent>;
  let planningService: jasmine.SpyObj<PlanningService>;
  let weekMemberService: jasmine.SpyObj<WeekMemberService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let routeParams$: Subject<any>;

  /** Mock planning week */
  const mockWeek = {
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
  };

  /** Mock dashboard data with 2 members, each at 30h and submitted */
  const mockDashboard = {
    weekId: 'w1',
    weekLabel: 'Jan 8 – Jan 13',
    status: 2,
    isFrozen: false,
    totalPlannedHours: 60,
    totalActualHours: 0,
    completionPercent: 0,
    clientFocused: { allocatedPercent: 34, plannedHours: 20.4, actualHours: 0 },
    techDebt: { allocatedPercent: 33, plannedHours: 19.8, actualHours: 0 },
    rnD: { allocatedPercent: 33, plannedHours: 19.8, actualHours: 0 },
    members: [
      { weekMemberId: 'wm1', name: 'Alice', plannedHours: 30, actualHours: 0, progressPercent: 0, hasSubmitted: true },
      { weekMemberId: 'wm2', name: 'Bob', plannedHours: 30, actualHours: 0, progressPercent: 0, hasSubmitted: true }
    ],
    tasks: [
      { taskTitle: 'Task 1', memberName: 'Alice', plannedHours: 15, actualHours: 0, progressPercent: 0 },
      { taskTitle: 'Task 2', memberName: 'Bob', plannedHours: 15, actualHours: 0, progressPercent: 0 }
    ]
  };

  beforeEach(async () => {
    routeParams$ = new Subject<any>();

    const planningSpy = jasmine.createSpyObj('PlanningService', ['getPlanningWeekById', 'freezePlanningWeek']);
    const weekMemberSpy = jasmine.createSpyObj('WeekMemberService', ['getDashboard']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    planningSpy.getPlanningWeekById.and.returnValue(of(mockWeek));
    weekMemberSpy.getDashboard.and.returnValue(of(mockDashboard));

    await TestBed.configureTestingModule({
      imports: [ReviewFreezeComponent, RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useValue: { params: routeParams$.asObservable() } },
        { provide: PlanningService, useValue: planningSpy },
        { provide: WeekMemberService, useValue: weekMemberSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: UserContextService, useValue: { isLead: true } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewFreezeComponent);
    component = fixture.componentInstance;
    planningService = TestBed.inject(PlanningService) as jasmine.SpyObj<PlanningService>;
    weekMemberService = TestBed.inject(WeekMemberService) as jasmine.SpyObj<WeekMemberService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    // Trigger ngOnInit to subscribe to route params
    fixture.detectChanges();
  });

  /** Helper: emit route params and wait for data to load */
  function loadWithParams(id: string): void {
    routeParams$.next({ id });
    tick();
    fixture.detectChanges();
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load data when route params emit', fakeAsync(() => {
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    expect(component.weekId).toBe('w1');
    expect(planningService.getPlanningWeekById).toHaveBeenCalledWith('w1');
    expect(weekMemberService.getDashboard).toHaveBeenCalledWith('w1');
    expect(component.loading).toBe(false);
    expect(component.week).toBeTruthy();
    expect(component.dashboard).toBeTruthy();
  }));

  it('should compute category rows from week and dashboard data', fakeAsync(() => {
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    expect(component.categoryRows.length).toBe(3);
    expect(component.categoryRows[0].label).toBe('Client Focused');
    expect(component.categoryRows[1].label).toBe('Tech Debt');
    expect(component.categoryRows[2].label).toBe('R&D');
    expect(component.totalBudgetHours).toBe(60); // 2 members * 30h
  }));

  it('should compute freeze conditions correctly when all met', fakeAsync(() => {
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    expect(component.freezeConditions.length).toBe(4);
    // All members assigned
    expect(component.freezeConditions[0].met).toBe(true);
    // All submitted
    expect(component.allSubmitted).toBe(true);
    expect(component.submittedCount).toBe(2);
  }));

  it('should set canFreeze=false when week is already frozen', fakeAsync(() => {
    planningService.getPlanningWeekById.and.returnValue(of({ ...mockWeek, isFrozen: true }));
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    expect(component.canFreeze).toBe(false);
  }));

  it('should set canFreeze=false when a member has not submitted', fakeAsync(() => {
    const dashboard = {
      ...mockDashboard,
      members: [
        { ...mockDashboard.members[0], hasSubmitted: false },
        mockDashboard.members[1]
      ]
    };
    weekMemberService.getDashboard.and.returnValue(of(dashboard));
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    expect(component.allSubmitted).toBe(false);
    expect(component.canFreeze).toBe(false);
  }));

  it('should set canFreeze=false when a member does not have 30h', fakeAsync(() => {
    const dashboard = {
      ...mockDashboard,
      members: [
        { ...mockDashboard.members[0], plannedHours: 20 },
        mockDashboard.members[1]
      ]
    };
    weekMemberService.getDashboard.and.returnValue(of(dashboard));
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    // "Every member has exactly 30h" condition should not be met
    const hoursCond = component.freezeConditions.find(c => c.label.includes('30h'));
    expect(hoursCond?.met).toBe(false);
  }));

  it('should call freezeWeek and show success toast', fakeAsync(() => {
    const frozenWeek = { ...mockWeek, isFrozen: true };
    planningService.freezePlanningWeek.and.returnValue(of(frozenWeek));
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    // Force canFreeze
    component.canFreeze = true;
    component.freezeWeek();
    tick();

    expect(planningService.freezePlanningWeek).toHaveBeenCalledWith('w1');
    expect(toastService.success).toHaveBeenCalledWith('Week plan frozen successfully!');
  }));

  it('should show error toast when freeze fails', fakeAsync(() => {
    planningService.freezePlanningWeek.and.returnValue(throwError(() => ({ message: 'Freeze failed' })));
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    component.canFreeze = true;
    component.freezeWeek();
    tick();

    expect(toastService.error).toHaveBeenCalledWith('Freeze failed');
  }));

  it('should not freeze when canFreeze is false', fakeAsync(() => {
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    component.canFreeze = false;
    component.freezeWeek();
    tick();

    expect(planningService.freezePlanningWeek).not.toHaveBeenCalled();
  }));

  it('should format dates correctly', () => {
    const result = component.formatDate(new Date('2026-01-08'));
    expect(result).toContain('Jan');
    expect(result).toContain('8');
  });

  it('should handle error when loading data fails', fakeAsync(() => {
    planningService.getPlanningWeekById.and.returnValue(throwError(() => ({ error: { message: 'Not found' } })));
    weekMemberService.getDashboard.and.returnValue(throwError(() => ({ error: { message: 'Not found' } })));
    routeParams$.next({ id: 'w1' });
    tick();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.error).toBeTruthy();
  }));

  it('should return default category id from getCategoryId', () => {
    expect(component.getCategoryId('Any Task')).toBe(1);
  });
});
