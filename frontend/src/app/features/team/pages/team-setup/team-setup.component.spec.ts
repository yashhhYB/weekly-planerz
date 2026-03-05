import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { TeamSetupComponent } from './team-setup.component';
import { Router } from '@angular/router';
import { UserContextService } from '../../../../core/services/user-context.service';

describe('TeamSetupComponent', () => {
  let component: TeamSetupComponent;
  let fixture: ComponentFixture<TeamSetupComponent>;
  let store: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userCtxSpy = jasmine.createSpyObj('UserContextService', ['setCurrentUser', 'clearCurrentUser'], {
      currentUser$: of(null),
      currentUser: null
    });
    storeSpy.select.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [TeamSetupComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UserContextService, useValue: userCtxSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    fixture = TestBed.createComponent(TeamSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadTeamMembers on init', () => {
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should not add member with empty name', () => {
    component.newName = '  ';
    const dispatchCount = store.dispatch.calls.count();
    component.addMember();
    expect(store.dispatch.calls.count()).toBe(dispatchCount);
  });

  it('should add member with valid name', () => {
    component.newName = 'Alice';
    component.addMember();
    expect(store.dispatch).toHaveBeenCalled();
    expect(component.newName).toBe('');
  });

  it('should not remove team lead', () => {
    const lead = { id: '1', name: 'Yash', role: 2, createdAt: new Date() };
    const dispatchCount = store.dispatch.calls.count();
    component.removeMember(lead);
    expect(store.dispatch.calls.count()).toBe(dispatchCount);
  });

  it('should remove non-lead member', () => {
    const member = { id: '2', name: 'Bob', role: 1, createdAt: new Date() };
    component.removeMember(member);
    expect(store.dispatch).toHaveBeenCalled();
  });
});
