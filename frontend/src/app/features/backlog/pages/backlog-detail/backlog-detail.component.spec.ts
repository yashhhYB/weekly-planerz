import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { BacklogDetailComponent } from './backlog-detail.component';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { BacklogItem, BacklogCategory } from '../../../../models';

describe('BacklogDetailComponent', () => {
  let component: BacklogDetailComponent;
  let fixture: ComponentFixture<BacklogDetailComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  const mockBacklogItem: BacklogItem = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    category: BacklogCategory.ClientFocused,
    estimatedHours: 5,
    isArchived: false,
    createdAt: new Date()
  };

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BacklogDetailComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' })
          }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store<AppStoreState>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute);

    storeSpy.select.and.callFake((selector: any) => {
      if (selector === BacklogSelectors.selectBacklogLoading) {
        return of(false);
      }
      if (selector === BacklogSelectors.selectBacklogError) {
        return of(null);
      }
      return of(mockBacklogItem);
    });

    fixture = TestBed.createComponent(BacklogDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load backlog item on init', () => {
    fixture.detectChanges();
    expect(component['backlogId']).toBe('1');
  });

  it('should display backlog item details', (done) => {
    fixture.detectChanges();
    component.backlogItem$.subscribe(item => {
      expect(item?.title).toBe('Test Task');
      expect(item?.estimatedHours).toBe(5);
      done();
    });
  });

  it('should navigate to edit view', () => {
    fixture.detectChanges();
    component.navigateToEdit();
    expect(router.navigate).toHaveBeenCalledWith(['/backlog', '1', 'edit']);
  });

  it('should dispatch deleteBacklogItem with confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteItem();
    expect(store.dispatch).toHaveBeenCalledWith(
      BacklogActions.deleteBacklogItem({ id: '1' })
    );
  });

  it('should not dispatch deleteBacklogItem without confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteItem();
    expect(store.dispatch).not.toHaveBeenCalledWith(
      BacklogActions.deleteBacklogItem({ id: '1' })
    );
  });

  it('should dispatch archiveBacklogItem with confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    component.archiveItem();
    expect(store.dispatch).toHaveBeenCalledWith(
      BacklogActions.archiveBacklogItem({ id: '1' })
    );
  });

  it('should not dispatch archiveBacklogItem without confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);
    component.archiveItem();
    expect(store.dispatch).not.toHaveBeenCalledWith(
      BacklogActions.archiveBacklogItem({ id: '1' })
    );
  });

  it('should navigate back to list', () => {
    fixture.detectChanges();
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/backlog']);
  });

  it('should format datetime correctly', () => {
    fixture.detectChanges();
    const date = new Date('2026-01-07T10:30:00');
    const formatted = component.formatDateTime(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('7');
  });
});
