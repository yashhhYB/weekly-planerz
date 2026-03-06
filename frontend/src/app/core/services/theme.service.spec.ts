import { ThemeService, Theme } from './theme.service';

/**
 * Unit tests for ThemeService
 * Validates theme toggling, persistence in localStorage, and DOM class application
 */
describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme', 'light-theme');
    service = new ThemeService();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme', 'light-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light theme when localStorage is empty', () => {
    expect(service.currentTheme).toBe('light');
  });

  it('should apply light-theme class to body by default', () => {
    expect(document.body.classList.contains('light-theme')).toBe(true);
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('should toggle from light to dark', () => {
    service.toggle();
    expect(service.currentTheme).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(document.body.classList.contains('light-theme')).toBe(false);
  });

  it('should toggle from dark back to light', () => {
    service.toggle(); // light -> dark
    service.toggle(); // dark -> light
    expect(service.currentTheme).toBe('light');
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  it('should persist theme in localStorage', () => {
    service.setTheme('dark');
    expect(localStorage.getItem('wpt-theme')).toBe('dark');
  });

  it('should load dark theme from localStorage', () => {
    localStorage.setItem('wpt-theme', 'dark');
    const svc = new ThemeService();
    expect(svc.currentTheme).toBe('dark');
  });

  it('should emit theme changes via theme$ observable', (done) => {
    const values: Theme[] = [];
    service.theme$.subscribe(t => {
      values.push(t);
      if (values.length === 2) {
        expect(values[0]).toBe('light');
        expect(values[1]).toBe('dark');
        done();
      }
    });
    service.toggle();
  });
});
