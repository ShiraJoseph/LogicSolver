import {TestBed} from '@angular/core/testing';

import {BruteForceService} from './brute-force.service';
import {GridStore} from '../store/store';
import {StoreService} from './store.service';
import {UndoRedoService} from './undo-redo.service';
import {LogicService} from './logic.service';
import {GRID_SEED} from '../store/grid.token';
import {MOCK_FIVE_BY_FIVE_GRID_SEED, MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {SOLUTION_LIMIT} from '../constants/grid.const';
import {CellText} from '../types/tile.model';
import {TRANSLATION_PROVIDERS} from '../app.config';

/**
 * A puzzle the deduction rules cannot finish on their own, so the solver has to guess to reach the one
 * solution. Each entry names the two options a cell sits between, then the value that cell holds.
 */
const STALLED_PUZZLE: Array<[string, string, CellText]> = [
  ['Cat', 'Dave', CellText.X],
  ['Dog', 'Alice', CellText.X],
  ['Dog', 'Dave', CellText.X],
  ['Snake', 'Erin', CellText.O],
  ['Cat', 'Driver', CellText.X],
  ['Dog', 'Driver', CellText.X],
  ['Snake', 'Driver', CellText.X],
  ['Fish', 'Fedora', CellText.O],
  ['Bike', 'Erin', CellText.X],
  ['Kayak', 'Editor', CellText.O],
  ['Scooter', 'Farmer', CellText.O],
  ['Canoe', 'Beret', CellText.X],
  ['Tractor', 'Beret', CellText.X],
  ['Tractor', 'Cap', CellText.X],
  ['Bob', 'Cook', CellText.O],
  ['Dave', 'Baker', CellText.X],
  ['Dave', 'Driver', CellText.X],
  ['Carol', 'Beret', CellText.X],
  ['Erin', 'Cap', CellText.X],
  ['Erin', 'Helmet', CellText.X],
  ['Baker', 'Cap', CellText.X],
  ['Baker', 'Visor', CellText.X],
  ['Editor', 'Helmet', CellText.O],
];

describe('BruteForceService', () => {
  let service: BruteForceService;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;
  let logicService: LogicService;
  let undoRedoService: UndoRedoService;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;

  const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

  const openCellCount = () =>
    store.cells().filter(cell => logicService.deducedValue(cell.id) === CellText.EMPTY).length;

  const valuedCellCount = () => store.cells().filter(cell => cell.userValue).length;

  const startTestBed = (seed: unknown) => {
    TestBed.configureTestingModule({
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: seed}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    logicService = TestBed.inject(LogicService);
    undoRedoService = TestBed.inject(UndoRedoService);
    service = TestBed.inject(BruteForceService);
  };

  describe('a grid with more than one solution', () => {
    beforeEach(() => startTestBed(MOCK_SMALL_GRID_SEED));

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should count past what the button can name rather than pick one of them', () => {
      service.solve();

      expect(store.solutionCount()).toBeGreaterThan(SOLUTION_LIMIT);
    });

    it('should leave every cell as it found it', () => {
      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.X);
      const valuedBefore = valuedCellCount();

      service.solve();

      expect(valuedCellCount()).toBe(valuedBefore);
      expect(store.cellById(cellId('Cat', 'Bike'))!.userValue).toBe(CellText.X);
    });

    it('should leave the move stacks as it found them', () => {
      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.X);

      service.solve();

      expect(store.undoStack().length).toBe(1);
      expect(store.redoStack().length).toBe(0);
    });

    it('should count the solutions out while there are few enough to name', () => {
      ['Bike', 'Alice'].forEach(name => storeService.updateCellValue(cellId('Cat', name), CellText.O));
      storeService.updateCellValue(cellId('Bike', 'Alice'), CellText.O);

      service.solve();

      expect(store.solutionCount()).toBe(4);
    });

    it('should mark no cell as its own work', () => {
      service.solve();

      expect(store.solvedCellIds().size).toBe(0);
    });

    it('should drop the count once the user changes a cell', () => {
      service.solve();

      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.X);

      expect(store.solutionCount()).toBeUndefined();
    });

    it('should drop the count once the user walks a move back', () => {
      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.X);
      service.solve();

      undoRedoService.undo();

      expect(store.solutionCount()).toBeUndefined();
    });
  });

  describe('a grid the deductions cannot finish on their own', () => {
    beforeEach(() => {
      startTestBed(MOCK_FIVE_BY_FIVE_GRID_SEED);
      STALLED_PUZZLE.forEach(([nameA, nameB, value]) => storeService.updateCellValue(cellId(nameA, nameB), value));
    });

    it('should leave the deductions short of the answer before the solver runs', () => {
      expect(openCellCount()).toBeGreaterThan(0);
    });

    it('should fill in every cell the deductions left open', () => {
      service.solve();

      expect(openCellCount()).toBe(0);
      expect(store.solutionCount()).toBeUndefined();
    });

    it('should mark the cells it had to guess as its own work', () => {
      service.solve();

      expect(store.solvedCellIds().size).toBeGreaterThan(0);
      store.solvedCellIds().forEach(solvedCellId => expect(store.cellById(solvedCellId)!.userValue).toBeTruthy());
    });

    it('should put its whole answer on the grid as one move', () => {
      const movesBefore = store.undoStack().length;

      service.solve();

      expect(store.undoStack().length).toBe(movesBefore + 1);
      expect(store.redoStack().length).toBe(0);
    });

    it('should come back off the grid in one undo', () => {
      const valuedBefore = valuedCellCount();
      const openBefore = openCellCount();
      service.solve();

      undoRedoService.undo();

      expect(valuedCellCount()).toBe(valuedBefore);
      expect(openCellCount()).toBe(openBefore);
      expect(store.solvedCellIds().size).toBe(0);
    });

    it('should go back on the grid in one redo', () => {
      service.solve();
      const solvedCount = store.solvedCellIds().size;
      undoRedoService.undo();

      undoRedoService.redo();

      expect(openCellCount()).toBe(0);
      expect(store.solvedCellIds().size).toBe(solvedCount);
    });

    it('should leave the puzzle the user entered alone', () => {
      service.solve();

      STALLED_PUZZLE.filter(([, , value]) => value === CellText.O)
        .forEach(([nameA, nameB]) => expect(store.cellById(cellId(nameA, nameB))!.userValue).toBe(CellText.O));
    });
  });
});
