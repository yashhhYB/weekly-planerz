import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlanningService } from './planning.service';
import { environment } from '../../../environments/environment';
import { PlanningStatus } from '../../models';

/**
 * Unit tests for PlanningService
 * Validates HTTP calls and DTO-to-domain mapping for all planning week operations
 */
describe('PlanningService', () => {
  let service: PlanningService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/planning`;

  /** Mock DTO from API */
  const mockDto = {
    id: '1',
    planningDate: '2026-01-07T00:00:00',
    startDate: '2026-01-08T00:00:00',
    endDate: '2026-01-13T00:00:00',
    status: 2,
    isFrozen: false,
    clientPercent: 34,
    techDebtPercent: 33,
    rndPercent: 33,
    createdAt: '2026-01-06T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanningService]
    });
    service = TestBed.inject(PlanningService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all planning weeks', () => {
    service.getAllPlanningWeeks().subscribe(weeks => {
      expect(weeks.length).toBe(1);
      expect(weeks[0].id).toBe('1');
      expect(weeks[0].status).toBe(PlanningStatus.InProgress);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockDto], message: '' });
  });

  it('should return empty array when getAllPlanningWeeks response has no data', () => {
    service.getAllPlanningWeeks().subscribe(weeks => {
      expect(weeks.length).toBe(0);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush({ success: false, data: null, message: 'fail' });
  });

  it('should get planning week by id', () => {
    service.getPlanningWeekById('1').subscribe(week => {
      expect(week.id).toBe('1');
      expect(week.clientPercent).toBe(34);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should create a planning week', () => {
    const request = { planningDate: '2026-01-07', clientPercent: 34, techDebtPercent: 33, rndPercent: 33 };
    service.createPlanningWeek(request).subscribe(week => {
      expect(week.id).toBe('1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should update a planning week', () => {
    const request = { clientPercent: 50, techDebtPercent: 25, rndPercent: 25 };
    service.updatePlanningWeek('1', request).subscribe(week => {
      expect(week.id).toBe('1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should freeze a planning week', () => {
    service.freezePlanningWeek('1').subscribe(week => {
      expect(week.id).toBe('1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/freeze`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { ...mockDto, isFrozen: true }, message: '' });
  });

  it('should delete a planning week', () => {
    service.deletePlanningWeek('1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should start a planning week', () => {
    service.startPlanningWeek('1').subscribe(week => {
      expect(week.id).toBe('1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/start`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should complete a planning week', () => {
    service.completePlanningWeek('1').subscribe(week => {
      expect(week.id).toBe('1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/complete`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should archive a planning week', () => {
    service.archivePlanningWeek('1').subscribe(week => {
      expect(week.id).toBe('1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/archive`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockDto, message: '' });
  });
});
