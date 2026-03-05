import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { BacklogListComponent } from './backlog-list.component';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';
import { BacklogItem, BacklogCategory } from '../../../../models';
import { Router } from '@angular/router';

describe('BacklogListComponent', () => {
  let component: BacklogListComponent;
  let fixture: ComponentFixture<BacklogListComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;

  const mockBacklogItems: BacklogItem[] = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test description',
      category: BacklogCategory.ClientFocused,
      estimatedHours: 5,
      isArchived: false,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Tech Debt Task',
      description: 'Refactoring work',
      category: BacklogCategory.TechDebt,
      estimatedHours: 8,
      isArchived: false,
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BacklogListComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === BacklogSelectors.selectAllBacklogItems) {
        return of(mockBacklogItems);
      }
      if (selector === BacklogSelectors.selectBacklogLoading) {
        return of(false);
      }
      if (selector === BacklogSelectors.selectBacklogError) {
        return of(null);
      }
      return of(null);
    });

    fixture = TestBed.createComponent(BacklogListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadBacklogItems on ngOnInit', () => {
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(
      BacklogActions.loadBacklogItems({ skip: 0, take: 50 })
    );
  });

  it('should display all backlog items', (done) => {
    fixture.detectChanges();
    component.backlogItems$.subscribe(items => {
      expect(items.length).toBe(2);
      done();
    });
  });

  it('should filter backlog items by category', (done) => {
    fixture.detectChanges();
    component.filterByCategory(BacklogCategory.ClientFocused);
    expect(component.selectedCategory).toBe(BacklogCategory.ClientFocused);
    component.filteredItems$.subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].category).toBe(BacklogCategory.ClientFocused);
      done();
    });
  });

  it('should display all items when filtering by 0 (All)', (done) => {
    fixture.detectChanges();
    component.filterByCategory(0);
    expect(component.selectedCategory).toBe(0);
    component.filteredItems$.subscribe(items => {
      expect(items.length).toBe(2);
      done();
    });
  });

  it('should toggle archived visibility', () => {
    fixture.detectChanges();
    expect(component.showArchived).toBe(false);
    component.toggleArchived();
    expect(component.showArchived).toBe(true);
    component.toggleArchived();
    expect(component.showArchived).toBe(false);
  });

  it('should navigate to create view', () => {
    fixture.detectChanges();
    component.navigateToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['/backlog/create']);
  });

  it('should navigate to detail view', () => {
    fixture.detectChanges();
    component.navigateToDetail('1');
    expect(router.navigate).toHaveBeenCalledWith(['/backlog', '1']);
  });

  it('should navigate to edit view', () => {
    fixture.detectChanges();
    component.navigateToEdit('1');
    expect(router.navigate).toHaveBeenCalledWith(['/backlog', '1', 'edit']);
  });

  it('should dispatch archiveBacklogItem with confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    component.archiveItem('1');
    expect(store.dispatch).toHaveBeenCalledWith(
      BacklogActions.archiveBacklogItem({ id: '1' })
    );
  });

  it('should not dispatch archiveBacklogItem without confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);
    component.archiveItem('1');
    expect(store.dispatch).not.toHaveBeenCalledWith(
      BacklogActions.archiveBacklogItem({ id: '1' })
    );
  });

  it('should have category filters available', () => {
    fixture.detectChanges();
    expect(component.categoryFilters.length).toBe(4);
    expect(component.categoryFilters[0].value).toBe(0);
    expect(component.categoryFilters[0].label).toBe('All');
  });
});
