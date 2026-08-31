import {TestBed} from '@angular/core/testing';

import {GridStore} from './store';
import {StoreService} from '../services/store.service';
import {GRID_SEED} from './grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {buildGridAxes, findNeighborCellId, toEntityConfig} from './utils';
import {Cell, CellId, FeatureId, OptionId} from '../types/entities.model';
import {ARROW_DOWN_KEY, ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY} from '../constants/keyboard.const';

describe('store utils', () => {
  let store: InstanceType<typeof GridStore>;

  const featureIds = () => store.featureIds() as Array<FeatureId>;
  const optionIdsByFeature = (featureId: FeatureId) => store.optionIdsByFeature(featureId) as Array<OptionId>;
  const gridAxes = () => buildGridAxes(featureIds(), optionIdsByFeature);
  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;
  const featureName = (id: FeatureId) => store.featureById(id)!.name;
  const optionName = (id: OptionId) => store.optionById(id)!.name;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]});
    TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
  });

  describe('toEntityConfig', () => {
    it('should name the collection it is given', () => {
      expect(toEntityConfig<Cell, 'cell'>('cell').collection).toBe('cell');
    });

    it('should key an entity on its own id', () => {
      const cell = store.cells()[0];

      expect(toEntityConfig<Cell, 'cell'>('cell').selectId(cell)).toBe(cell.id);
    });
  });

  describe('buildGridAxes', () => {
    it('should open the left axis with the first feature and carry on in reverse', () => {
      expect(gridAxes().leftFeatureIds.map(featureName)).toEqual(['Pet', 'Name']);
    });

    it('should run the left axis options in the order their features run down it', () => {
      expect(gridAxes().leftOptionIds.map(optionName)).toEqual(['Cat', 'Dog', 'Fish', 'Alice', 'Bob', 'Carol']);
    });

    it('should run the top axis options over every feature after the first', () => {
      expect(gridAxes().topOptionIds.map(optionName)).toEqual(['Bike', 'Canoe', 'Tractor', 'Alice', 'Bob', 'Carol']);
    });

    it('should map each left axis option to its slot down that axis', () => {
      const {leftOptionIds, leftOptionPositions} = gridAxes();

      expect(leftOptionIds.map(id => leftOptionPositions.get(id))).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should map each top axis option to its slot across that axis', () => {
      const {topOptionIds, topOptionPositions} = gridAxes();

      expect(topOptionIds.map(id => topOptionPositions.get(id))).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should leave an option that only sits on the top axis off the left one', () => {
      expect(gridAxes().leftOptionPositions.get(optionId('Bike'))).toBeUndefined();
    });

    it('should leave an option that only sits on the left axis off the top one', () => {
      expect(gridAxes().topOptionPositions.get(optionId('Cat'))).toBeUndefined();
    });

    it('should hand back nothing for a grid with no features', () => {
      expect(buildGridAxes([], optionIdsByFeature).leftFeatureIds).toEqual([]);
    });
  });

  describe('findNeighborCellId', () => {
    const neighborName = (fromA: string, fromB: string, arrowKey: string) => {
      const neighborCellId = findNeighborCellId(
        store.cellById(cellId(fromA, fromB))!.optionIds as Array<OptionId>,
        arrowKey,
        gridAxes(),
        (leftOptionId, topOptionId) => store.cellIdByOptions(leftOptionId, topOptionId) as CellId
      );

      return neighborCellId && store.optionIdsByCell(neighborCellId).map(id => optionName(id as OptionId)).join('-');
    };

    it('should step along the top axis to the right', () => {
      expect(neighborName('Cat', 'Bike', ARROW_RIGHT_KEY)).toBe('Cat-Canoe');
    });

    it('should step back along the top axis to the left', () => {
      expect(neighborName('Cat', 'Canoe', ARROW_LEFT_KEY)).toBe('Cat-Bike');
    });

    it('should step down the left axis', () => {
      expect(neighborName('Cat', 'Bike', ARROW_DOWN_KEY)).toBe('Dog-Bike');
    });

    it('should step up the left axis', () => {
      expect(neighborName('Dog', 'Bike', ARROW_UP_KEY)).toBe('Cat-Bike');
    });

    it('should cross from one feature to the next along the top axis', () => {
      expect(neighborName('Cat', 'Tractor', ARROW_RIGHT_KEY)).toBe('Cat-Alice');
    });

    it('should cross from one feature to the next down the left axis', () => {
      expect(neighborName('Fish', 'Bike', ARROW_DOWN_KEY)).toBe('Alice-Bike');
    });

    it('should hand back nothing off the left edge', () => {
      expect(neighborName('Cat', 'Bike', ARROW_LEFT_KEY)).toBeUndefined();
    });

    it('should hand back nothing off the top edge', () => {
      expect(neighborName('Cat', 'Bike', ARROW_UP_KEY)).toBeUndefined();
    });

    it('should hand back nothing off the right edge', () => {
      expect(neighborName('Cat', 'Carol', ARROW_RIGHT_KEY)).toBeUndefined();
    });

    it('should hand back nothing where the grid falls away rather than at the last column', () => {
      expect(neighborName('Alice', 'Tractor', ARROW_RIGHT_KEY)).toBeUndefined();
    });

    it('should hand back nothing for a key it does not lay out', () => {
      expect(neighborName('Cat', 'Bike', 'enter')).toBeUndefined();
    });
  });
});
