import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { AppStoreState } from '../store';
import * as PlanningSelectors from '../store/planning/planning.selectors';
import * as BacklogSelectors from '../store/backlog/backlog.selectors';
import { Router } from '@angular/router';
import { PlanningWeek, BacklogItem, BacklogCategory, BacklogStatus } from '../models';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;

  const mockPlanningWeeks: PlanningWeek[] = [
    {
      id: '1',
      weekStartDate: new Date('2026-01-07'),
      weekEndDate: new Date('2026-01-13'),
      goals: 'Test goals',
      keyActivities: 'Test activities',
      reflection: 'Test reflection',
      healthScore: 8,
      productivity: 85,
      isFrozenAtCreation: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockBacklogItems: BacklogItem[] = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test description',
      category: BacklogCategory.Work,
      priority: 3,
      estimatedHours: 5,
      status: BacklogStatus.Pending,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'In Progress Task',
      description: 'Currently working',
      category: BacklogCategory.Learning,
      priority: 4,
      estimatedHours: 8,
      status: BacklogStatus.InProgress,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of(mockPlanningWeeks);
      }
      if (selector === BacklogSelectors.selectAllBacklogItems) {
        return of(mockBacklogItems);
      }
      return of([]);
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display planning week count', (done) => {
    fixture.detectChanges();
    component.planningWeekCount$.subscribe(count => {
      expect(count).toBe(1);
      done();
    });
  });

  it('should display total backlog item count', (done) => {
    fixture.detectChanges();
    component.backlogItemCount$.subscribe(count => {
      expect(count).toBe(2);
      done();
    });
  });

  it('should calculate active backlog items (InProgress status)', (done) => {
    fixture.detectChanges();
    component.activeBacklogCount$.subscribe(count => {
      expect(count).toBe(1);
      done();
    });
  });

  it('should navigate to planning page', () => {
    fixture.detectChanges();
    component.navigateTo('/planning');
    expect(router.navigate).toHaveBeenCalledWith(['/planning']);
  });

  it('should navigate to create planning week', () => {
    fixture.detectChanges();
    component.navigateTo('/planning/create');
    expect(router.navigate).toHaveBeenCalledWith(['/planning/create']);
  });

  it('should navigate to backlog page', () => {
    fixture.detectChanges();
    component.navigateTo('/backlog');
    expect(router.navigate).toHaveBeenCalledWith(['/backlog']);
  });

  it('should navigate to create backlog item', () => {
    fixture.detectChanges();
    component.navigateTo('/backlog/create');
    expect(router.navigate).toHaveBeenCalledWith(['/backlog/create']);
  });

  it('should handle empty planning weeks', (done) => {
    store.select.and.callFake((selector: any) => {
      if (selector === PlanningSelectors.selectAllPlanningWeeks) {
        return of([]);
      }
      return of([]);
    });
    fixture.detectChanges();
    component.planningWeekCount$.subscribe(count => {
      expect(count).toBe(0);
      done();
    });
  });

  it('should handle empty backlog items', (done) => {
    store.select.and.callFake((selector: any) => {
      if (selector === BacklogSelectors.selectAllBacklogItems) {
        return of([]);
      }
      return of([]);
    });
    fixture.detectChanges();
    component.backlogItemCount$.subscribe(count => {
      expect(count).toBe(0);
      done();
    });
  });
});
