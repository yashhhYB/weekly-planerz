import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { PlanningDetailComponent } from './planning-detail.component';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanningWeek, PlanningStatus } from '../../../../models';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { ToastService } from '../../../../core/services/toast.service';
import * as TeamSelectors from '../../../../store/team/team.selectors';
import { UserContextService } from '../../../../core/services/user-context.service';

describe('PlanningDetailComponent', () => {
  let component: PlanningDetailComponent;
  let fixture: ComponentFixture<PlanningDetailComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  const mockPlanningWeek: PlanningWeek = {
    id: '1',
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

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const weekMemberSpy = jasmine.createSpyObj('WeekMemberService', ['getWeekMembers', 'addWeekMembers']);
    weekMemberSpy.getWeekMembers.and.returnValue(of([]));
    weekMemberSpy.addWeekMembers.and.returnValue(of([]));
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [PlanningDetailComponent, RouterTestingModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: WeekMemberService, useValue: weekMemberSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: UserContextService, useValue: { isLead: true } },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' })
          }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router) as any;
    spyOn(router, 'navigate');
    route = TestBed.inject(ActivatedRoute);

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectPlanningLoading) {
        return of(false);
      }
      if (selector === PlanningSelectors.selectPlanningError) {
        return of(null);
      }
      if (selector === TeamSelectors.selectAllTeamMembers) {
        return of([]);
      }
      return of(mockPlanningWeek);
    });

    fixture = TestBed.createComponent(PlanningDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load planning week on init', () => {
    fixture.detectChanges();
    expect(component['planningId']).toBe('1');
  });

  it('should display planning week details', (done) => {
    fixture.detectChanges();
    component.planningWeek$.subscribe(week => {
      expect(week?.clientPercent).toBe(34);
      expect(week?.techDebtPercent).toBe(33);
      done();
    });
  });

  it('should navigate to edit view', () => {
    fixture.detectChanges();
    component.navigateToEdit();
    expect(router.navigate).toHaveBeenCalledWith(['/planning', '1', 'edit']);
  });

  it('should dispatch deletePlanningWeek with confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    component.deletePlanning();
    expect(store.dispatch).toHaveBeenCalledWith(
      PlanningActions.deletePlanningWeek({ id: '1' })
    );
  });

  it('should not dispatch deletePlanningWeek without confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);
    component.deletePlanning();
    expect(store.dispatch).not.toHaveBeenCalledWith(
      PlanningActions.deletePlanningWeek({ id: '1' })
    );
  });

  it('should dispatch freezePlanningWeek with confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    component.freezeWeek();
    expect(store.dispatch).toHaveBeenCalledWith(
      PlanningActions.freezePlanningWeek({ id: '1' })
    );
  });

  it('should navigate back to list', () => {
    fixture.detectChanges();
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/planning']);
  });

  it('should format date correctly', () => {
    fixture.detectChanges();
    const date = new Date('2026-01-07');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('Jan');
  });

  it('should format datetime correctly', () => {
    fixture.detectChanges();
    const date = new Date('2026-01-07T10:30:00');
    const formatted = component.formatDateTime(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('7');
  });
});
