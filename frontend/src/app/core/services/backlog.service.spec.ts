import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BacklogService } from './backlog.service';
import { environment } from '../../../environments/environment';
import { BacklogCategory } from '../../models';

/**
 * Unit tests for BacklogService
 * Validates HTTP calls and DTO-to-domain mapping for all backlog item operations
 */
describe('BacklogService', () => {
  let service: BacklogService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/backlog`;

  const mockDto = {
    id: '1',
    title: 'Fix bug',
    description: 'Fix the login bug',
    category: 1,
    estimatedHours: 5,
    isArchived: false,
    createdAt: '2026-01-06T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BacklogService]
    });
    service = TestBed.inject(BacklogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all backlog items', () => {
    service.getAllBacklogItems().subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('Fix bug');
      expect(items[0].category).toBe(BacklogCategory.ClientFocused);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockDto], message: '' });
  });

  it('should return empty array when response has no data', () => {
    service.getAllBacklogItems().subscribe(items => {
      expect(items.length).toBe(0);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush({ success: false, data: null, message: '' });
  });

  it('should get active backlog items', () => {
    service.getActiveBacklogItems().subscribe(items => {
      expect(items.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/active`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockDto], message: '' });
  });

  it('should get backlog item by id', () => {
    service.getBacklogItemById('1').subscribe(item => {
      expect(item.title).toBe('Fix bug');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should create a backlog item', () => {
    const request = { title: 'New', description: 'Desc', category: 1, estimatedHours: 3 };
    service.createBacklogItem(request).subscribe(item => {
      expect(item.title).toBe('Fix bug');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should update a backlog item', () => {
    const request = { title: 'Updated', description: 'Desc', category: 1, estimatedHours: 3 };
    service.updateBacklogItem('1', request).subscribe(item => {
      expect(item).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: mockDto, message: '' });
  });

  it('should archive a backlog item', () => {
    service.archiveBacklogItem('1').subscribe(item => {
      expect(item).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1/archive`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { ...mockDto, isArchived: true }, message: '' });
  });

  it('should delete a backlog item', () => {
    service.deleteBacklogItem('1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
