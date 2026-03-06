import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeamService } from './team.service';
import { environment } from '../../../environments/environment';
import { UserRole } from '../../models';

/**
 * Unit tests for TeamService
 * Validates HTTP calls for all team member CRUD and role operations
 */
describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/team`;

  const mockMember = {
    id: '1', name: 'Alice', role: UserRole.TeamMember, createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamService]
    });
    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all members', () => {
    service.getAllMembers().subscribe(members => {
      expect(members.length).toBe(1);
      expect(members[0].name).toBe('Alice');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockMember], message: '' });
  });

  it('should get member by id', () => {
    service.getMemberById('1').subscribe(member => {
      expect(member.name).toBe('Alice');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockMember, message: '' });
  });

  it('should create a member', () => {
    service.createMember({ name: 'Alice' }).subscribe(member => {
      expect(member.name).toBe('Alice');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockMember, message: '' });
  });

  it('should update a member', () => {
    service.updateMember('1', { name: 'Alice Updated' }).subscribe(member => {
      expect(member).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { ...mockMember, name: 'Alice Updated' }, message: '' });
  });

  it('should delete a member', () => {
    service.deleteMember('1').subscribe(result => {
      expect(result).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: true, message: '' });
  });

  it('should set team lead', () => {
    service.setTeamLead('1').subscribe(member => {
      expect(member).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1/role`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { ...mockMember, role: UserRole.TeamLead }, message: '' });
  });
});
