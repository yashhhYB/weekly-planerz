import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { PlanningListComponent } from './planning-list.component';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';
import { PlanningWeek, PlanningStatus } from '../../../../models';
import { Router } from '@angular/router';
import { UserContextService } from '../../../../core/services/user-context.service';

describe('PlanningListComponent', () => {
  let component: PlanningListComponent;
  let fixture: ComponentFixture<PlanningListComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;

  const mockPlanningWeeks: PlanningWeek[] = [
    {
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
    }
  ];

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PlanningListComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UserContextService, useValue: { isLead: true } }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of(mockPlanningWeeks);
      }
      if (selector === PlanningSelectors.selectPlanningLoading) {
        return of(false);
      }
      if (selector === PlanningSelectors.selectPlanningError) {
        return of(null);
      }
      return of(null);
    });

    fixture = TestBed.createComponent(PlanningListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadPlanningWeeks on ngOnInit', () => {
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(
      PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 })
    );
  });

  it('should display planning weeks', (done) => {
    fixture.detectChanges();
    component.planningWeeks$.subscribe(weeks => {
      expect(weeks.length).toBe(1);
      expect(weeks[0].clientPercent).toBe(34);
      done();
    });
  });

  it('should navigate to create view', () => {
    fixture.detectChanges();
    component.navigateToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['/planning/create']);
  });

  it('should navigate to detail view', () => {
    fixture.detectChanges();
    component.navigateToDetail('1');
    expect(router.navigate).toHaveBeenCalledWith(['/planning', '1']);
  });

  it('should navigate to edit view', () => {
    fixture.detectChanges();
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    component.navigateToEdit('1', event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/planning', '1', 'edit']);
  });

  it('should handle loading state', (done) => {
    store.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectPlanningLoading) {
        return of(true);
      }
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of([]);
      }
      if (selector === PlanningSelectors.selectPlanningError) {
        return of(null);
      }
      return of(null);
    });
    fixture = TestBed.createComponent(PlanningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.loading$.subscribe(loading => {
      expect(loading).toBe(true);
      done();
    });
  });

  it('should handle error state', (done) => {
    const errorMsg = 'Failed to load planning weeks';
    store.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectPlanningError) {
        return of(errorMsg);
      }
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of([]);
      }
      if (selector === PlanningSelectors.selectPlanningLoading) {
        return of(false);
      }
      return of(null);
    });
    fixture = TestBed.createComponent(PlanningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.error$.subscribe(error => {
      expect(error).toBe(errorMsg);
      done();
    });
  });

  it('should format date correctly', () => {
    fixture.detectChanges();
    const date = new Date('2026-01-07');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('7');
  });
});
