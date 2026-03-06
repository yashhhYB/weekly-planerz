import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { PlanningEffects } from './planning.effects';
import { PlanningService } from '../../core/services';
import { ToastService } from '../../core/services/toast.service';
import * as PlanningActions from './planning.actions';
import { PlanningWeek, PlanningStatus } from '../../models';

/**
 * Unit tests for Planning Effects
 * Validates side-effect handlers for all planning week CRUD and lifecycle operations
 */
describe('PlanningEffects', () => {
  let effects: PlanningEffects;
  let planningService: jasmine.SpyObj<PlanningService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let actions$: Observable<any>;

  const mockPlanningWeek: PlanningWeek = {
    id: '1',
    planningDate: new Date('2026-01-07'),
    startDate: new Date('2026-01-08'),
    endDate: new Date('2026-01-13'),
    status: PlanningStatus.InProgress,
    isFrozen: false,
    clientPercent: 34,
    techDebtPercent: 33,
    rndPercent: 33,
    createdAt: new Date()
  };

  /** Helper to re-create the TestBed with a specific actions$ stream */
  function setupEffects(actionStream: Observable<any>): void {
    actions$ = actionStream;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        PlanningEffects,
        provideMockActions(() => actions$),
        { provide: PlanningService, useValue: planningService },
        { provide: ToastService, useValue: toastService }
      ]
    });
    effects = TestBed.inject(PlanningEffects);
  }

  beforeEach(() => {
    planningService = jasmine.createSpyObj('PlanningService', [
      'getAllPlanningWeeks', 'getPlanningWeekById', 'createPlanningWeek',
      'updatePlanningWeek', 'deletePlanningWeek', 'freezePlanningWeek',
      'startPlanningWeek', 'completePlanningWeek', 'archivePlanningWeek'
    ]);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    actions$ = of({ type: 'INIT' });

    TestBed.configureTestingModule({
      providers: [
        PlanningEffects,
        provideMockActions(() => actions$),
        { provide: PlanningService, useValue: planningService },
        { provide: ToastService, useValue: toastService }
      ]
    });

    effects = TestBed.inject(PlanningEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  // --- loadPlanningWeeks$ ---
  describe('loadPlanningWeeks$', () => {
    it('should dispatch loadPlanningWeeksSuccess on success', (done) => {
      const weeks = [mockPlanningWeek];
      planningService.getAllPlanningWeeks.and.returnValue(of(weeks));
      setupEffects(of(PlanningActions.loadPlanningWeeks({})));

      effects.loadPlanningWeeks$.subscribe(action => {
        expect(action).toEqual(PlanningActions.loadPlanningWeeksSuccess({ weeks }));
        done();
      });
    });

    it('should dispatch loadPlanningWeeksFailure on error', (done) => {
      planningService.getAllPlanningWeeks.and.returnValue(throwError(() => new Error('fail')));
      setupEffects(of(PlanningActions.loadPlanningWeeks({})));

      effects.loadPlanningWeeks$.subscribe(action => {
        expect(action).toEqual(PlanningActions.loadPlanningWeeksFailure({ error: 'fail' }));
        done();
      });
    });
  });

  // --- loadPlanningWeekById$ ---
  describe('loadPlanningWeekById$', () => {
    it('should dispatch loadPlanningWeekByIdSuccess on success', (done) => {
      planningService.getPlanningWeekById.and.returnValue(of(mockPlanningWeek));
      setupEffects(of(PlanningActions.loadPlanningWeekById({ id: '1' })));

      effects.loadPlanningWeekById$.subscribe(action => {
        expect(action).toEqual(PlanningActions.loadPlanningWeekByIdSuccess({ week: mockPlanningWeek }));
        done();
      });
    });
  });

  // --- createPlanningWeek$ ---
  describe('createPlanningWeek$', () => {
    it('should dispatch createPlanningWeekSuccess on success', (done) => {
      planningService.createPlanningWeek.and.returnValue(of(mockPlanningWeek));
      const request = { planningDate: '2026-01-07', clientPercent: 34, techDebtPercent: 33, rndPercent: 33 };
      setupEffects(of(PlanningActions.createPlanningWeek({ request })));

      effects.createPlanningWeek$.subscribe(action => {
        expect(action).toEqual(PlanningActions.createPlanningWeekSuccess({ week: mockPlanningWeek }));
        done();
      });
    });
  });

  // --- updatePlanningWeek$ ---
  describe('updatePlanningWeek$', () => {
    it('should dispatch updatePlanningWeekSuccess on success', (done) => {
      const updated = { ...mockPlanningWeek, clientPercent: 50 };
      planningService.updatePlanningWeek.and.returnValue(of(updated));
      setupEffects(of(PlanningActions.updatePlanningWeek({
        id: '1', request: { clientPercent: 50, techDebtPercent: 25, rndPercent: 25 }
      })));

      effects.updatePlanningWeek$.subscribe(action => {
        expect(action).toEqual(PlanningActions.updatePlanningWeekSuccess({ week: updated }));
        done();
      });
    });
  });

  // --- deletePlanningWeek$ ---
  describe('deletePlanningWeek$', () => {
    it('should dispatch deletePlanningWeekSuccess on success', (done) => {
      planningService.deletePlanningWeek.and.returnValue(of(void 0));
      setupEffects(of(PlanningActions.deletePlanningWeek({ id: '1' })));

      effects.deletePlanningWeek$.subscribe(action => {
        expect(action).toEqual(PlanningActions.deletePlanningWeekSuccess({ id: '1' }));
        done();
      });
    });
  });

  // --- freezePlanningWeek$ ---
  describe('freezePlanningWeek$', () => {
    it('should dispatch freezePlanningWeekSuccess on success', (done) => {
      const frozen = { ...mockPlanningWeek, isFrozen: true };
      planningService.freezePlanningWeek.and.returnValue(of(frozen));
      setupEffects(of(PlanningActions.freezePlanningWeek({ id: '1' })));

      effects.freezePlanningWeek$.subscribe(action => {
        expect(action).toEqual(PlanningActions.freezePlanningWeekSuccess({ week: frozen }));
        done();
      });
    });
  });
});