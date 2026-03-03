import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { PlanningFormComponent } from './planning-form.component';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanningWeek } from '../../../../models';

describe('PlanningFormComponent', () => {
  let component: PlanningFormComponent;
  let fixture: ComponentFixture<PlanningFormComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  const mockPlanningWeek: PlanningWeek = {
    id: '1',
    weekStartDate: new Date('2026-01-07'),
    weekEndDate: new Date('2026-01-13'),
    goals: 'Test goals',
    keyActivities: 'Test activities',
    reflection: 'Test reflection',
    healthScore: 8,
    productivity: 85,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PlanningFormComponent, ReactiveFormsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
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
    expect(component.form.get('weekStartDate')).toBeDefined();
    expect(component.form.get('goals')).toBeDefined();
    expect(component.form.get('keyActivities')).toBeDefined();
  });

  it('should have valid form with all required fields', () => {
    fixture.detectChanges();
    component.form.patchValue({
      weekStartDate: '2026-01-07',
      goals: 'Test goals',
      keyActivities: 'Test activities',
      healthScore: 8,
      productivity: 85
    });
    expect(component.form.valid).toBe(true);
  });

  it('should invalidate form with missing required fields', () => {
    fixture.detectChanges();
    component.form.patchValue({
      weekStartDate: '',
      goals: '',
      keyActivities: ''
    });
    expect(component.form.valid).toBe(false);
  });

  it('should validate health score range (1-10)', () => {
    fixture.detectChanges();
    const healthScore = component.form.get('healthScore');
    
    healthScore?.setValue(0);
    expect(healthScore?.valid).toBe(false);
    
    healthScore?.setValue(11);
    expect(healthScore?.valid).toBe(false);
    
    healthScore?.setValue(5);
    expect(healthScore?.valid).toBe(true);
  });

  it('should validate productivity range (0-100)', () => {
    fixture.detectChanges();
    const productivity = component.form.get('productivity');
    
    productivity?.setValue(-1);
    expect(productivity?.valid).toBe(false);
    
    productivity?.setValue(101);
    expect(productivity?.valid).toBe(false);
    
    productivity?.setValue(75);
    expect(productivity?.valid).toBe(true);
  });

  it('should dispatch createPlanningWeek on submit in create mode', () => {
    fixture.detectChanges();
    component.form.patchValue({
      weekStartDate: '2026-01-07',
      goals: 'Test goals',
      keyActivities: 'Test activities',
      healthScore: 8,
      productivity: 85
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
      weekStartDate: '2026-01-07',
      goals: 'Updated goals',
      keyActivities: 'Updated activities',
      healthScore: 9,
      productivity: 90
    });
    component.onSubmit();
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: jasmine.any(String)
      })
    );
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    component.form.patchValue({
      weekStartDate: '',
      goals: ''
    });
    component.onSubmit();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should navigate on cancel in create mode', () => {
    fixture.detectChanges();
    component.isEdit = false;
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/planning']);
  });

  it('should navigate to detail on cancel in edit mode', () => {
    fixture.detectChanges();
    component.isEdit = true;
    component['planningId'] = '1';
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/planning', '1']);
  });

  it('should format date correctly for input', () => {
    fixture.detectChanges();
    const date = new Date('2026-01-07');
    const formatted = component['formatDateForInput'](date);
    expect(formatted).toMatch(/2026-01-07/);
  });
});
