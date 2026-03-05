import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MemberBoardComponent } from './member-board.component';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { BacklogService } from '../../../../core/services/backlog.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('MemberBoardComponent', () => {
  let component: MemberBoardComponent;
  let fixture: ComponentFixture<MemberBoardComponent>;

  beforeEach(async () => {
    const weekMemberSpy = jasmine.createSpyObj('WeekMemberService', ['getWeekMember', 'assignTask', 'removeTask', 'submitPlan']);
    weekMemberSpy.getWeekMember.and.returnValue(of({ id: '1', weekId: 'w1', memberId: 'm1', memberName: 'Alice', memberRole: 1, totalPlannedHours: 0, totalActualHours: 0, hasSubmitted: false, tasks: [] }));
    const backlogSpy = jasmine.createSpyObj('BacklogService', ['getAllBacklogItems']);
    backlogSpy.getAllBacklogItems.and.returnValue(of([]));
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [MemberBoardComponent],
      providers: [
        provideRouter([]),
        { provide: WeekMemberService, useValue: weekMemberSpy },
        { provide: BacklogService, useValue: backlogSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: ActivatedRoute, useValue: { params: of({ weekId: 'w1', weekMemberId: '1' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MemberBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(component.weekMember).toBeTruthy();
    expect(component.weekMember?.memberName).toBe('Alice');
  });

  it('should have empty filtered backlog initially', () => {
    expect(component.filteredBacklog.length).toBe(0);
  });

  it('should calculate total planned hours', () => {
    expect(component.totalPlanned).toBe(0);
  });
});
