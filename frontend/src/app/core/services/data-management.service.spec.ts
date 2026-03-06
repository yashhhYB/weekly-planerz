import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataManagementService } from './data-management.service';
import { environment } from '../../../environments/environment';

/**
 * Unit tests for DataManagementService
 * Validates HTTP calls for admin export, import, seed, and reset operations
 */
describe('DataManagementService', () => {
  let service: DataManagementService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataManagementService]
    });
    service = TestBed.inject(DataManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should export data', () => {
    service.exportData().subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/export`);
    expect(req.request.method).toBe('GET');
    req.flush({ teams: [], weeks: [] });
  });

  it('should import data', () => {
    const payload = { teams: [{ name: 'Test' }] };
    service.importData(payload).subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/import`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('should seed data', () => {
    service.seedData().subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/seed`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should reset data', () => {
    service.resetData().subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/reset`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
