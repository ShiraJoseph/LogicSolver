import {TestBed} from '@angular/core/testing';

import {GridStore} from './store';
import {StoreService} from '../services/store.service';
import {GRID_SEED} from './grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {NON_CELL_COLUMN_COUNT} from '../constants/grid.const';
import {Move, MoveFnEnum} from '../types/move.model';
import {ARROW_LEFT_KEY, ARROW_RIGHT_KEY} from '../constants/keyboard.const';

describe('GridStore', () => {
  let store: InstanceType<typeof GridStore>;

  const clearMove: Move = {moveFn: MoveFnEnum.CLEAR, moveArgs: {oldCells: [], oldInvalidCellValues: new Map()}};
  const renameMove: Move = {moveFn: MoveFnEnum.UPDATE, moveArgs: {featureId: 'a-b-c-d-e', oldValue: 'Pet', newValue: 'Animal'}};

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]});
    TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
  });

  describe('featurePositions', () => {
    it('should map each feature to the order it appears in', () => {
      store.features().forEach((feature, index) => expect(store.featurePositions().get(feature.id)).toBe(index));
    });

    it('should hold one entry per feature', () => {
      expect(store.featurePositions().size).toBe(3);
    });

    it('should have no entry for a feature that is not on the grid', () => {
      expect(store.featurePositions().get('missing')).toBeUndefined();
    });

    it('should renumber the remaining features when one is deleted', () => {
      const lastFeature = store.features()[2];

      TestBed.inject(StoreService).deleteFeature(store.features()[0].id);

      expect(store.featurePositions().get(lastFeature.id)).toBe(1);
    });
  });

  describe('columnCount', () => {
    it('should give a column to every option of every feature after the first', () => {
      expect(store.columnCount()).toBe(3 * 2 + NON_CELL_COLUMN_COUNT);
    });

    it('should grow when a feature is added', () => {
      TestBed.inject(StoreService).addNewFeature('Sport');

      expect(store.columnCount()).toBe(3 * 3 + NON_CELL_COLUMN_COUNT);
    });

    it('should grow when an option is added to every feature', () => {
      TestBed.inject(StoreService).addNewOptionToAllFeatures();

      expect(store.columnCount()).toBe(4 * 2 + NON_CELL_COLUMN_COUNT);
    });
  });

  describe('setOptionCountPerFeature', () => {
    it('should hold the count it is given', () => {
      store.setOptionCountPerFeature(7);

      expect(store.optionCountPerFeature()).toBe(7);
    });
  });

  describe('tabStopCellId', () => {
    const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
    const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

    it('should open on the cell where the first left option crosses the first top option', () => {
      expect(store.tabStopCellId()).toBe(cellId('Cat', 'Bike'));
    });

    it('should follow the active cell', () => {
      store.setSelectedCellId(cellId('Dog', 'Canoe'));

      expect(store.tabStopCellId()).toBe(cellId('Dog', 'Canoe'));
    });

    it('should stay on the cell that was active last once the keyboard leaves the grid', () => {
      store.setSelectedCellId(cellId('Dog', 'Canoe'));

      store.setSelectedCellId(undefined);

      expect(store.tabStopCellId()).toBe(cellId('Dog', 'Canoe'));
    });

    it('should fall back to the corner once the remembered cell has left the grid', () => {
      store.setSelectedCellId(cellId('Dog', 'Canoe'));
      store.setSelectedCellId(undefined);

      TestBed.inject(StoreService).deleteOption(optionId('Dog'));

      expect(store.tabStopCellId()).toBe(cellId('Cat', 'Bike'));
    });

    it('should be nothing for a grid with no cells', () => {
      store.features().forEach(feature => TestBed.inject(StoreService).deleteFeature(feature.id));

      expect(store.tabStopCellId()).toBeUndefined();
    });
  });

  describe('selectNeighborCell', () => {
    const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
    const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

    it('should hand the keyboard to the neighbour', () => {
      store.selectNeighborCell(cellId('Cat', 'Bike'), ARROW_RIGHT_KEY);

      expect(store.selectedCellId?.()).toBe(cellId('Cat', 'Canoe'));
    });

    it('should leave the selection alone where the grid runs out', () => {
      store.setSelectedCellId(cellId('Cat', 'Bike'));

      store.selectNeighborCell(cellId('Cat', 'Bike'), ARROW_LEFT_KEY);

      expect(store.selectedCellId?.()).toBe(cellId('Cat', 'Bike'));
    });
  });

  describe('setSelectedCellId', () => {
    it('should remember the cell after the keyboard leaves it', () => {
      const cell = store.cells()[0];

      store.setSelectedCellId(cell.id);
      store.setSelectedCellId(undefined);

      expect(store.lastSelectedCellId?.()).toBe(cell.id);
    });

    it('should start with the keyboard on no cell', () => {
      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should hold the cell it is given', () => {
      const cell = store.cells()[0];

      store.setSelectedCellId(cell.id);

      expect(store.selectedCellId?.()).toBe(cell.id);
    });

    it('should take the keyboard off every cell when given nothing', () => {
      store.setSelectedCellId(store.cells()[0].id);

      store.setSelectedCellId(undefined);

      expect(store.selectedCellId?.()).toBeUndefined();
    });
  });

  describe('recordMove', () => {
    it('should put the move on the undo stack', () => {
      store.recordMove(clearMove);

      expect(store.undoStack()).toEqual([clearMove]);
    });

    it('should keep the moves in the order they were made', () => {
      store.recordMove(clearMove);
      store.recordMove(renameMove);

      expect(store.undoStack()).toEqual([clearMove, renameMove]);
    });

    it('should drop the moves waiting to be made again', () => {
      store.recordMove(clearMove);
      store.popUndoMove();

      store.recordMove(renameMove);

      expect(store.redoStack()).toEqual([]);
    });
  });

  describe('popUndoMove', () => {
    it('should hand back the newest move', () => {
      store.recordMove(clearMove);
      store.recordMove(renameMove);

      expect(store.popUndoMove()).toEqual(renameMove);
    });

    it('should move it over to the redo stack', () => {
      store.recordMove(clearMove);

      store.popUndoMove();

      expect(store.undoStack()).toEqual([]);
      expect(store.redoStack()).toEqual([clearMove]);
    });

    it('should leave the older moves where they are', () => {
      store.recordMove(clearMove);
      store.recordMove(renameMove);

      store.popUndoMove();

      expect(store.undoStack()).toEqual([clearMove]);
    });

    it('should hand back nothing when there is no move to walk back', () => {
      expect(store.popUndoMove()).toBeUndefined();
    });

    it('should leave the stacks alone when there is no move to walk back', () => {
      store.popUndoMove();

      expect(store.redoStack()).toEqual([]);
    });
  });

  describe('popRedoMove', () => {
    it('should hand back the newest undone move', () => {
      store.recordMove(clearMove);
      store.popUndoMove();

      expect(store.popRedoMove()).toEqual(clearMove);
    });

    it('should move it back to the undo stack', () => {
      store.recordMove(clearMove);
      store.popUndoMove();

      store.popRedoMove();

      expect(store.undoStack()).toEqual([clearMove]);
      expect(store.redoStack()).toEqual([]);
    });

    it('should hand back nothing when there is no undone move', () => {
      expect(store.popRedoMove()).toBeUndefined();
    });

    it('should leave the stacks alone when there is no undone move', () => {
      store.popRedoMove();

      expect(store.undoStack()).toEqual([]);
    });
  });

  describe('canUndo', () => {
    it('should be false on a grid nobody has touched', () => {
      expect(store.canUndo()).toBe(false);
    });

    it('should be true once a move is recorded', () => {
      store.recordMove(clearMove);

      expect(store.canUndo()).toBe(true);
    });

    it('should be false again once every move is walked back', () => {
      store.recordMove(clearMove);

      store.popUndoMove();

      expect(store.canUndo()).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('should be false while nothing has been walked back', () => {
      store.recordMove(clearMove);

      expect(store.canRedo()).toBe(false);
    });

    it('should be true once a move is walked back', () => {
      store.recordMove(clearMove);

      store.popUndoMove();

      expect(store.canRedo()).toBe(true);
    });

    it('should be false once the undone move is made again', () => {
      store.recordMove(clearMove);
      store.popUndoMove();

      store.popRedoMove();

      expect(store.canRedo()).toBe(false);
    });
  });
});
