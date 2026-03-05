import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { TeamListComponent } from './team-list.component';

describe('TeamListComponent', () => {
  let component: TeamListComponent;
  let fixture: ComponentFixture<TeamListComponent>;
  let store: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [TeamListComponent, RouterTestingModule],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    fixture = TestBed.createComponent(TeamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadTeamMembers on init', () => {
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should add member with valid name', () => {
    component.newName = 'Alice';
    component.addMember();
    expect(store.dispatch).toHaveBeenCalled();
    expect(component.newName).toBe('');
  });

  it('should not add member with empty name', () => {
    component.newName = '';
    const count = store.dispatch.calls.count();
    component.addMember();
    expect(store.dispatch.calls.count()).toBe(count);
  });

  it('should start and cancel editing', () => {
    const member = { id: '1', name: 'Bob', role: 1, createdAt: new Date() };
    component.startEdit(member);
    expect(component.editingId).toBe('1');
    component.cancelEdit();
    expect(component.editingId).toBeNull();
  });
});
