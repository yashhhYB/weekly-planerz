import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeekMemberService } from './week-member.service';
import { environment } from '../../../environments/environment';

/**
 * Unit tests for WeekMemberService
 * Validates HTTP calls for week member operations, task management, and dashboard
 */
describe('WeekMemberService', () => {
  let service: WeekMemberService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/planning`;

  const mockWeekMember = {
    id: 'wm1', weekId: 'w1', memberId: 'm1', memberName: 'Alice',
    memberRole: 1, totalPlannedHours: 30, totalActualHours: 0,
    hasSubmitted: false, tasks: []
  };

  const mockTask = {
    id: 't1', weekMemberId: 'wm1', backlogItemId: 'b1',
    backlogTitle: 'Task', backlogCategory: 1,
    estimatedHours: 5, plannedHours: 5, actualHours: 0, progressPercent: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeekMemberService]
    });
    service = TestBed.inject(WeekMemberService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get week members', () => {
    service.getWeekMembers('w1').subscribe(members => {
      expect(members.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/w1/members`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockWeekMember], message: '' });
  });

  it('should add week members', () => {
    service.addWeekMembers('w1', ['m1']).subscribe(members => {
      expect(members.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/w1/members`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: [mockWeekMember], message: '' });
  });

  it('should get single week member', () => {
    service.getWeekMember('wm1').subscribe(member => {
      expect(member.memberName).toBe('Alice');
    });

    const req = httpMock.expectOne(`${apiUrl}/members/wm1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockWeekMember, message: '' });
  });

  it('should assign task', () => {
    service.assignTask('wm1', { backlogItemId: 'b1', plannedHours: 5 }).subscribe(task => {
      expect(task.id).toBe('t1');
    });

    const req = httpMock.expectOne(`${apiUrl}/members/wm1/tasks`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockTask, message: '' });
  });

  it('should remove task', () => {
    service.removeTask('t1').subscribe(result => {
      expect(result).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/tasks/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: true, message: '' });
  });

  it('should submit plan', () => {
    service.submitPlan('wm1').subscribe(member => {
      expect(member.hasSubmitted).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/members/wm1/submit`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { ...mockWeekMember, hasSubmitted: true }, message: '' });
  });

  it('should unsubmit plan', () => {
    service.unsubmitPlan('wm1').subscribe(member => {
      expect(member.hasSubmitted).toBe(false);
    });

    const req = httpMock.expectOne(`${apiUrl}/members/wm1/unsubmit`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockWeekMember, message: '' });
  });

  it('should update progress', () => {
    service.updateProgress('t1', { actualHours: 3, progressPercent: 60 }).subscribe(task => {
      expect(task).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/tasks/t1/progress`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { ...mockTask, actualHours: 3, progressPercent: 60 }, message: '' });
  });

  it('should get dashboard', () => {
    service.getDashboard('w1').subscribe(dashboard => {
      expect(dashboard.weekId).toBe('w1');
    });

    const req = httpMock.expectOne(`${apiUrl}/w1/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        weekId: 'w1', weekLabel: 'test', status: 2, isFrozen: false,
        totalPlannedHours: 60, totalActualHours: 0, completionPercent: 0,
        clientFocused: { allocatedPercent: 34, plannedHours: 20, actualHours: 0 },
        techDebt: { allocatedPercent: 33, plannedHours: 20, actualHours: 0 },
        rnD: { allocatedPercent: 33, plannedHours: 20, actualHours: 0 },
        members: [], tasks: []
      },
      message: ''
    });
  });
});
