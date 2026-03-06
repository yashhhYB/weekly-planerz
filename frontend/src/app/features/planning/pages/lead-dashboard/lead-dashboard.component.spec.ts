import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LeadDashboardComponent } from './lead-dashboard.component';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { PlanningService } from '../../../../core/services/planning.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserContextService } from '../../../../core/services/user-context.service';

describe('LeadDashboardComponent', () => {
  let component: LeadDashboardComponent;
  let fixture: ComponentFixture<LeadDashboardComponent>;

  const mockDashboard = {
    weekId: 'w1', weekLabel: 'Jan 7, 2026', status: 2, isFrozen: false,
    totalPlannedHours: 60, totalActualHours: 30, completionPercent: 50,
    clientFocused: { allocatedPercent: 34, plannedHours: 20, actualHours: 10 },
    techDebt: { allocatedPercent: 33, plannedHours: 20, actualHours: 10 },
    rnD: { allocatedPercent: 33, plannedHours: 20, actualHours: 10 },
    members: [{ weekMemberId: 'wm1', name: 'Alice', plannedHours: 30, actualHours: 15, progressPercent: 50, hasSubmitted: true }],
    tasks: [{ taskTitle: 'Task 1', memberName: 'Alice', plannedHours: 10, actualHours: 5, progressPercent: 50 }]
  };

  beforeEach(async () => {
    const weekMemberSpy = jasmine.createSpyObj('WeekMemberService', ['getDashboard']);
    weekMemberSpy.getDashboard.and.returnValue(of(mockDashboard));
    const planningSpy = jasmine.createSpyObj('PlanningService', ['freezePlanningWeek', 'startPlanningWeek', 'completePlanningWeek']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [LeadDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: WeekMemberService, useValue: weekMemberSpy },
        { provide: PlanningService, useValue: planningSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: UserContextService, useValue: { isLead: true } },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'w1' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data', () => {
    expect(component.dashboard).toBeTruthy();
    expect(component.dashboard?.totalPlannedHours).toBe(60);
  });

  it('should have members in dashboard', () => {
    expect(component.dashboard?.members.length).toBe(1);
    expect(component.dashboard?.members[0].name).toBe('Alice');
  });

  it('should not be loading after data loads', () => {
    expect(component.loading).toBeFalse();
  });
});
