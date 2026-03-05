import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { PlanningFormComponent } from './planning-form.component';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as TeamSelectors from '../../../../store/team/team.selectors';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanningWeek, PlanningStatus } from '../../../../models';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('PlanningFormComponent', () => {
  let component: PlanningFormComponent;
  let fixture: ComponentFixture<PlanningFormComponent>;
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
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const weekMemberSpy = jasmine.createSpyObj('WeekMemberService', ['addWeekMembers']);
    weekMemberSpy.addWeekMembers.and.returnValue(of([]));
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [PlanningFormComponent, ReactiveFormsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: WeekMemberService, useValue: weekMemberSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({})
          }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute);

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectPlanningError) {
        return of(null);
      }
      if (selector === PlanningSelectors.selectPlanningLoading) {
        return of(false);
      }
      if (selector === TeamSelectors.selectAllTeamMembers) {
        return of([{ id: 'm1', name: 'Alice', role: 0 }, { id: 'm2', name: 'Bob', role: 1 }]);
      }
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of([]);
      }
      return of(null);
    });

    fixture = TestBed.createComponent(PlanningFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form in create mode', () => {
    fixture.detectChanges();
    expect(component.isEdit).toBe(false);
    expect(component.form).toBeDefined();
    expect(component.form.get('planningDate')).toBeDefined();
    expect(component.form.get('clientPercent')).toBeDefined();
    expect(component.form.get('techDebtPercent')).toBeDefined();
    expect(component.form.get('rndPercent')).toBeDefined();
  });

  it('should have valid form with all required fields summing to 100', () => {
    fixture.detectChanges();
    component.form.patchValue({
      planningDate: '2026-01-07',
      clientPercent: 34,
      techDebtPercent: 33,
      rndPercent: 33
    });
    expect(component.form.valid).toBe(true);
    expect(component.getTotal()).toBe(100);
  });

  it('should invalidate form with missing required fields', () => {
    fixture.detectChanges();
    component.form.patchValue({
      planningDate: '',
      clientPercent: 0,
      techDebtPercent: 0,
      rndPercent: 0
    });
    expect(component.form.valid).toBe(false);
  });

  it('should validate clientPercent range (0-100)', () => {
    fixture.detectChanges();
    const clientPercent = component.form.get('clientPercent');
    
    clientPercent?.setValue(-1);
    expect(clientPercent?.valid).toBe(false);
    
    clientPercent?.setValue(101);
    expect(clientPercent?.valid).toBe(false);
    
    clientPercent?.setValue(50);
    expect(clientPercent?.valid).toBe(true);
  });

  it('should calculate total percentage', () => {
    fixture.detectChanges();
    component.form.patchValue({
      clientPercent: 40,
      techDebtPercent: 30,
      rndPercent: 30
    });
    expect(component.getTotal()).toBe(100);
  });

  it('should calculate hours correctly', () => {
    fixture.detectChanges();
    component.form.patchValue({
      clientPercent: 50,
      techDebtPercent: 30,
      rndPercent: 20
    });
    expect(component.getClientHours()).toBe('15.0');
    expect(component.getTechDebtHours()).toBe('9.0');
    expect(component.getRndHours()).toBe('6.0');
  });

  it('should dispatch createPlanningWeek on submit in create mode', () => {
    fixture.detectChanges();
    component.form.patchValue({
      planningDate: '2026-01-06',
      clientPercent: 34,
      techDebtPercent: 33,
      rndPercent: 33
    });
    component.onSubmit();
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: jasmine.any(String)
      })
    );
  });

  it('should dispatch updatePlanningWeek on submit in edit mode', () => {
    fixture.detectChanges();
    component.isEdit = true;
    component['planningId'] = '1';
    component.form.patchValue({
      planningDate: '2026-01-06',
      clientPercent: 50,
      techDebtPercent: 30,
      rndPercent: 20
    });
    component.onSubmit();
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: jasmine.any(String)
      })
    );
  });

  it('should not submit when total is not 100', () => {
    fixture.detectChanges();
    store.dispatch.calls.reset();
    component.form.patchValue({
      planningDate: '2026-01-06',
      clientPercent: 50,
      techDebtPercent: 30,
      rndPercent: 10
    });
    component.onSubmit();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should navigate on cancel in create mode', () => {
    fixture.detectChanges();
    component.isEdit = false;
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to detail on cancel in edit mode', () => {
    fixture.detectChanges();
    component.isEdit = true;
    component['planningId'] = '1';
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/planning', '1']);
  });
});
