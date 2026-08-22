import {TestBed} from '@angular/core/testing';

import {GridStore} from './store';
import {StoreService} from './store.service';
import {GRID_SEED} from './grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {NON_CELL_COLUMN_COUNT} from '../constants/grid.const';

describe('GridStore', () => {
  let store: InstanceType<typeof GridStore>;

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

  describe('setSelectedCellId', () => {
    it('should start with nothing selected', () => {
      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should hold the cell it is given', () => {
      const cell = store.cells()[0];

      store.setSelectedCellId(cell.id);

      expect(store.selectedCellId?.()).toBe(cell.id);
    });

    it('should clear the selection when given nothing', () => {
      store.setSelectedCellId(store.cells()[0].id);

      store.setSelectedCellId(undefined);

      expect(store.selectedCellId?.()).toBeUndefined();
    });
  });
});
