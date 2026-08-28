import {TestBed} from '@angular/core/testing';

import {UndoRedoService} from './undo-redo.service';
import {StoreService} from './store.service';
import {GridStore} from '../store/store';
import {GRID_SEED} from '../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {MoveArgs, MoveFnEnum} from '../types/move.model';
import {CellText} from '../types/tile.model';
import {CellId, FeatureId, OptionId} from '../types/entities.model';

describe('UndoRedoService', () => {
  let service: UndoRedoService;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

  const featureNames = () => store.features().map(feature => feature.name);
  const optionNames = () => store.features().map(feature => store.optionsByFeature(feature).map(option => option.name));
  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const featureId = (name: string) => store.features().find(feature => feature.name === name)!.id;

  const addFeature = (name: string) =>
    store.recordMove({moveFn: MoveFnEnum.ADD, moveArgs: storeService.addNewFeature(name)});

  const addOptionToAllFeatures = () =>
    store.recordMove({moveFn: MoveFnEnum.ADD, moveArgs: storeService.addNewOptionToAllFeatures()});

  const deleteFeature = (id: FeatureId) =>
    store.recordMove({
      moveFn: MoveFnEnum.DELETE,
      moveArgs: storeService.deleteFeature(id) as MoveArgs<MoveFnEnum.DELETE>
    });

  const deleteOption = (id: OptionId) =>
    store.recordMove({moveFn: MoveFnEnum.DELETE, moveArgs: storeService.deleteOption(id)});

  const clearCells = () => {
    store.recordMove({moveFn: MoveFnEnum.CLEAR, moveArgs: {oldCells: store.cells()}});
    storeService.clearCells();
  };

  const writeCell = (id: CellId, newValue: CellText) => {
    store.recordMove({
      moveFn: MoveFnEnum.UPDATE,
      moveArgs: {cellId: id, oldValue: store.cellById(id)!.userValue!, newValue}
    });
    store.updateCell(id, {userValue: newValue});
  };

  const renameOption = (id: OptionId, newValue: string) => {
    store.recordMove({
      moveFn: MoveFnEnum.UPDATE,
      moveArgs: {optionId: id, oldValue: store.optionById(id)!.name, newValue}
    });
    store.updateOption(id, {name: newValue});
  };

  const renameFeature = (id: FeatureId, newValue: string) => {
    store.recordMove({
      moveFn: MoveFnEnum.UPDATE,
      moveArgs: {featureId: id, oldValue: store.featureById(id)!.name, newValue}
    });
    store.updateFeature(id, {name: newValue});
  };

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]});
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    service = TestBed.inject(UndoRedoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('undo', () => {
    it('should do nothing when no move has been made', () => {
      const cellCount = store.cells().length;

      service.undo();

      expect(store.featureCount()).toBe(3);
      expect(store.cells().length).toBe(cellCount);
    });

    describe('an added feature', () => {
      it('should take the feature back off the grid', () => {
        addFeature('Sport');

        service.undo();

        expect(featureNames()).toEqual(['Pet', 'Vehicle', 'Name']);
      });

      it('should take its options and cells with it', () => {
        const cellCount = store.cells().length;
        const optionCount = store.options().length;
        addFeature('Sport');

        service.undo();

        expect(store.options().length).toBe(optionCount);
        expect(store.cells().length).toBe(cellCount);
      });

      it('should hand the move to the redo stack', () => {
        addFeature('Sport');

        service.undo();

        expect(store.canUndo()).toBe(false);
        expect(store.canRedo()).toBe(true);
      });
    });

    describe('an added option', () => {
      it('should take the option back off every feature', () => {
        const names = optionNames();
        addOptionToAllFeatures();

        service.undo();

        expect(optionNames()).toEqual(names);
      });

      it('should lower the option count back', () => {
        addOptionToAllFeatures();

        service.undo();

        expect(store.optionCountPerFeature()).toBe(3);
      });

      it('should take the new cells with it', () => {
        const cellCount = store.cells().length;
        addOptionToAllFeatures();

        service.undo();

        expect(store.cells().length).toBe(cellCount);
      });
    });

    describe('a deleted feature', () => {
      it('should put the feature back in its own slot', () => {
        deleteFeature(featureId('Vehicle'));

        service.undo();

        expect(featureNames()).toEqual(['Pet', 'Vehicle', 'Name']);
      });

      it('should put its options back', () => {
        const names = optionNames();
        deleteFeature(featureId('Vehicle'));

        service.undo();

        expect(optionNames()).toEqual(names);
      });

      it('should put its cells back', () => {
        const cellCount = store.cells().length;
        deleteFeature(featureId('Vehicle'));

        service.undo();

        expect(store.cells().length).toBe(cellCount);
      });

      it('should keep the values the restored cells were carrying', () => {
        const cell = store.cellsByFeature(featureId('Vehicle'))[0];
        store.updateCell(cell.id, {userValue: CellText.X});
        deleteFeature(featureId('Vehicle'));

        service.undo();

        expect(store.cellById(cell.id)!.userValue).toBe(CellText.X);
      });
    });

    describe('a deleted option', () => {
      it('should put the option back in its own slot in every feature', () => {
        const names = optionNames();
        deleteOption(optionId('Dog'));

        service.undo();

        expect(optionNames()).toEqual(names);
      });

      it('should raise the option count back', () => {
        deleteOption(optionId('Dog'));

        service.undo();

        expect(store.optionCountPerFeature()).toBe(3);
      });

      it('should put the cells of every restored option back', () => {
        const cellCount = store.cells().length;
        deleteOption(optionId('Dog'));

        service.undo();

        expect(store.cells().length).toBe(cellCount);
      });
    });

    describe('an updated cell', () => {
      it('should put the old value back', () => {
        const cell = store.cells()[0];
        writeCell(cell.id, CellText.X);

        service.undo();

        expect(store.cellById(cell.id)!.userValue).toBe(CellText.EMPTY);
      });

      it('should walk back one write at a time', () => {
        const cell = store.cells()[0];
        writeCell(cell.id, CellText.X);
        writeCell(cell.id, CellText.O);

        service.undo();

        expect(store.cellById(cell.id)!.userValue).toBe(CellText.X);
      });
    });

    describe('a renamed option', () => {
      it('should put the old name back', () => {
        const id = optionId('Cat');
        renameOption(id, 'Lion');

        service.undo();

        expect(store.optionById(id)!.name).toBe('Cat');
      });
    });

    describe('a renamed feature', () => {
      it('should put the old name back', () => {
        const id = featureId('Pet');
        renameFeature(id, 'Animal');

        service.undo();

        expect(store.featureById(id)!.name).toBe('Pet');
      });
    });

    describe('a cleared grid', () => {
      it('should put every value back', () => {
        const [first, second] = store.cells();
        store.updateCell(first.id, {userValue: CellText.X});
        store.updateCell(second.id, {userValue: CellText.O});
        clearCells();

        service.undo();

        expect(store.cellById(first.id)!.userValue).toBe(CellText.X);
        expect(store.cellById(second.id)!.userValue).toBe(CellText.O);
      });

      it('should leave the cells that were already empty alone', () => {
        store.updateCell(store.cells()[0].id, {userValue: CellText.X});
        clearCells();

        service.undo();

        expect(store.cells().filter(cell => cell.userValue === CellText.X).length).toBe(1);
      });
    });
  });

  describe('redo', () => {
    it('should do nothing when nothing has been undone', () => {
      const cell = store.cells()[0];
      writeCell(cell.id, CellText.X);

      service.redo();

      expect(store.cellById(cell.id)!.userValue).toBe(CellText.X);
    });

    it('should do nothing once every undone move has been made again', () => {
      const cell = store.cells()[0];
      writeCell(cell.id, CellText.X);
      service.undo();

      service.redo();
      service.redo();

      expect(store.cellById(cell.id)!.userValue).toBe(CellText.X);
    });

    describe('an added feature', () => {
      it('should put the feature back with its options and cells', () => {
        addFeature('Sport');
        const names = optionNames();
        const cellCount = store.cells().length;
        service.undo();

        service.redo();

        expect(featureNames()).toEqual(['Pet', 'Vehicle', 'Name', 'Sport']);
        expect(optionNames()).toEqual(names);
        expect(store.cells().length).toBe(cellCount);
      });
    });

    describe('an added option', () => {
      it('should raise the option count again', () => {
        addOptionToAllFeatures();
        service.undo();

        service.redo();

        expect(store.optionCountPerFeature()).toBe(4);
      });

      it('should give every feature its option back', () => {
        addOptionToAllFeatures();
        const names = optionNames();
        service.undo();

        service.redo();

        expect(optionNames()).toEqual(names);
      });
    });

    describe('a deleted feature', () => {
      it('should take the feature back off the grid', () => {
        deleteFeature(featureId('Vehicle'));
        service.undo();

        service.redo();

        expect(featureNames()).toEqual(['Pet', 'Name']);
      });
    });

    describe('a deleted option', () => {
      it('should lower the option count again', () => {
        deleteOption(optionId('Dog'));
        service.undo();

        service.redo();

        expect(store.optionCountPerFeature()).toBe(2);
      });

      it('should take the option back off every feature', () => {
        deleteOption(optionId('Dog'));
        const names = optionNames();
        service.undo();

        service.redo();

        expect(optionNames()).toEqual(names);
      });
    });

    describe('an updated cell', () => {
      it('should write the new value again', () => {
        const cell = store.cells()[0];
        writeCell(cell.id, CellText.X);
        service.undo();

        service.redo();

        expect(store.cellById(cell.id)!.userValue).toBe(CellText.X);
      });
    });

    describe('a renamed option', () => {
      it('should write the new name again', () => {
        const id = optionId('Cat');
        renameOption(id, 'Lion');
        service.undo();

        service.redo();

        expect(store.optionById(id)!.name).toBe('Lion');
      });
    });

    describe('a renamed feature', () => {
      it('should write the new name again', () => {
        const id = featureId('Pet');
        renameFeature(id, 'Animal');
        service.undo();

        service.redo();

        expect(store.featureById(id)!.name).toBe('Animal');
      });
    });

    describe('a cleared grid', () => {
      it('should empty every cell again', () => {
        store.updateCell(store.cells()[0].id, {userValue: CellText.X});
        clearCells();
        service.undo();

        service.redo();

        expect(store.cells().every(cell => cell.userValue === CellText.EMPTY)).toBe(true);
      });
    });
  });

  describe('the stacks', () => {
    it('should walk back through the moves newest first', () => {
      addFeature('Sport');
      deleteOption(optionId('Dog'));

      service.undo();

      expect(store.optionCountPerFeature()).toBe(3);
      expect(featureNames()).toEqual(['Pet', 'Vehicle', 'Name', 'Sport']);
    });

    it('should leave the grid as it was once every move is walked back', () => {
      const names = optionNames();
      const cellCount = store.cells().length;
      addFeature('Sport');
      addOptionToAllFeatures();
      deleteOption(optionId('Dog'));

      service.undo();
      service.undo();
      service.undo();

      expect(featureNames()).toEqual(['Pet', 'Vehicle', 'Name']);
      expect(optionNames()).toEqual(names);
      expect(store.cells().length).toBe(cellCount);
      expect(store.canUndo()).toBe(false);
    });

    it('should hand a move back to the undo stack once it is made again', () => {
      addFeature('Sport');
      service.undo();

      service.redo();

      expect(store.canUndo()).toBe(true);
      expect(store.canRedo()).toBe(false);
    });
  });
});
