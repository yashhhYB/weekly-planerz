import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { BacklogFormComponent } from './backlog-form.component';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { BacklogCategory } from '../../../../models';

describe('BacklogFormComponent', () => {
  let component: BacklogFormComponent;
  let fixture: ComponentFixture<BacklogFormComponent>;
  let store: jasmine.SpyObj<Store<AppStoreState>>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BacklogFormComponent, ReactiveFormsModule],
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
      if (selector === BacklogSelectors.selectBacklogError) {
        return of(null);
      }
      if (selector === BacklogSelectors.selectBacklogLoading) {
        return of(false);
      }
      return of(null);
    });

    fixture = TestBed.createComponent(BacklogFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form in create mode', () => {
    fixture.detectChanges();
    expect(component.isEdit).toBe(false);
    expect(component.form).toBeDefined();
    expect(component.form.get('title')).toBeDefined();
    expect(component.form.get('category')).toBeDefined();
    expect(component.form.get('estimatedHours')).toBeDefined();
  });

  it('should have valid category options', () => {
    fixture.detectChanges();
    expect(component.categoryOptions.length).toBe(3);
    expect(component.categoryOptions[0].value).toBe(BacklogCategory.ClientFocused);
  });

  it('should validate required fields', () => {
    fixture.detectChanges();
    component.form.patchValue({
      title: '',
      category: 0
    });
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form with all required fields', () => {
    fixture.detectChanges();
    component.form.patchValue({
      title: 'Test Task',
      description: 'Test description',
      category: BacklogCategory.ClientFocused,
      estimatedHours: 5
    });
    expect(component.form.valid).toBe(true);
  });

  it('should validate category must be at least 1', () => {
    fixture.detectChanges();
    const category = component.form.get('category');
    
    category?.setValue(0);
    expect(category?.valid).toBe(false);
    
    category?.setValue(BacklogCategory.ClientFocused);
    expect(category?.valid).toBe(true);
  });

  it('should validate estimated hours range (0-168)', () => {
    fixture.detectChanges();
    const hours = component.form.get('estimatedHours');
    
    hours?.setValue(-1);
    expect(hours?.valid).toBe(false);
    
    hours?.setValue(169);
    expect(hours?.valid).toBe(false);
    
    hours?.setValue(8);
    expect(hours?.valid).toBe(true);
  });

  it('should dispatch createBacklogItem on submit in create mode', () => {
    fixture.detectChanges();
    component.form.patchValue({
      title: 'Test Task',
      description: 'Test description',
      category: BacklogCategory.ClientFocused,
      estimatedHours: 5
    });
    component.onSubmit();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    component.form.patchValue({
      title: '',
      category: 0
    });
    component.onSubmit();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should navigate on cancel in create mode', () => {
    fixture.detectChanges();
    component.isEdit = false;
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/backlog']);
  });

  it('should navigate to detail on cancel in edit mode', () => {
    fixture.detectChanges();
    component.isEdit = true;
    component['backlogId'] = '1';
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/backlog', '1']);
  });

  it('should default category to 0 (unselected) in create mode', () => {
    fixture.detectChanges();
    expect(component.form.get('category')?.value).toBe(0);
  });
});
