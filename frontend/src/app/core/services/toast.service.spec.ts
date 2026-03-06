import { ToastService, Toast } from './toast.service';

/**
 * Unit tests for ToastService
 * Validates all toast type emissions with correct messages and durations
 */
describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit success toast with default duration', (done) => {
    service.toast$.subscribe((toast: Toast) => {
      expect(toast.message).toBe('Saved!');
      expect(toast.type).toBe('success');
      expect(toast.duration).toBe(3000);
      done();
    });
    service.success('Saved!');
  });

  it('should emit error toast with default duration', (done) => {
    service.toast$.subscribe((toast: Toast) => {
      expect(toast.message).toBe('Failed');
      expect(toast.type).toBe('error');
      expect(toast.duration).toBe(5000);
      done();
    });
    service.error('Failed');
  });

  it('should emit info toast', (done) => {
    service.toast$.subscribe((toast: Toast) => {
      expect(toast.type).toBe('info');
      expect(toast.duration).toBe(3000);
      done();
    });
    service.info('FYI');
  });

  it('should emit warning toast', (done) => {
    service.toast$.subscribe((toast: Toast) => {
      expect(toast.type).toBe('warning');
      expect(toast.duration).toBe(4000);
      done();
    });
    service.warning('Watch out');
  });

  it('should allow custom duration', (done) => {
    service.toast$.subscribe((toast: Toast) => {
      expect(toast.duration).toBe(1000);
      done();
    });
    service.success('Quick', 1000);
  });
});
