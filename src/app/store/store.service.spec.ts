import {TestBed} from '@angular/core/testing';

import {StoreService} from './store.service';
import {GridStore} from './store';
import {GRID_SEED} from './grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {CellText} from '../types/tile.model';
import {FeatureId, OptionId} from '../types/entities.model';

describe('StoreService', () => {
  let service: StoreService;
  let store: InstanceType<typeof GridStore>;

  const configure = (seed = MOCK_SMALL_GRID_SEED) => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: seed}]});
    service = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
  };

  describe('the seeded grid', () => {
    it('should build a feature per seeded feature name', () => {
      configure();

      expect(store.featureCount()).toBe(3);
      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Vehicle', 'Name']);
    });

    it('should divide the seeded option names evenly between the features', () => {
      configure();

      expect(store.optionCountPerFeature()).toBe(3);
      expect(store.options().map(option => option.name))
        .toEqual(['Cat', 'Dog', 'Fish', 'Bike', 'Canoe', 'Tractor', 'Alice', 'Bob', 'Carol']);
    });

    it('should build a cell for every pair of options from different features', () => {
      configure();

      expect(store.cells().length).toBe(27);
    });

    it('should give every cell two options belonging to different features', () => {
      configure();

      store.cells().forEach(cell => {
        const [leftOptionId, topOptionId] = cell.optionIds as [OptionId, OptionId];

        expect(store.featureIdByOption(leftOptionId)).not.toBe(store.featureIdByOption(topOptionId));
      });
    });

    it('should start every cell empty', () => {
      configure();

      expect(store.cells().every(cell => cell.userValue === CellText.EMPTY)).toBe(true);
    });

    it('should build nothing when the seed has no features', () => {
      configure({featureNames: [], optionNames: []});

      expect(store.featureCount()).toBe(0);
      expect(store.options().length).toBe(0);
      expect(store.cells().length).toBe(0);
      expect(store.optionCountPerFeature()).toBe(0);
    });

    it('should build unnamed features and options when the seed has no names', () => {
      configure({featureNames: ['', ''], optionNames: ['', '', '', '']});

      expect(store.featureCount()).toBe(2);
      expect(store.optionCountPerFeature()).toBe(2);
      expect(store.cells().length).toBe(4);
      expect(store.features().every(feature => feature.name === '')).toBe(true);
    });
  });

  describe('addNewFeature', () => {
    it('should add a feature with its own full set of options', () => {
      configure();

      service.addNewFeature('Sport');

      expect(store.featureCount()).toBe(4);
      expect(store.optionsByFeature(store.features()[3]).length).toBe(3);
    });

    it('should name the feature when given a name', () => {
      configure();

      service.addNewFeature('Sport');

      expect(store.features()[3].name).toBe('Sport');
    });

    it('should leave the name empty when not given one', () => {
      configure();

      service.addNewFeature();

      expect(store.features()[3].name).toBe('');
    });

    it('should pair each new option with every option of the existing features', () => {
      configure();

      service.addNewFeature('Sport');

      expect(store.cells().length).toBe(54);
    });
  });

  describe('addNewOptionToAllFeatures', () => {
    it('should raise the option count', () => {
      configure();

      service.addNewOptionToAllFeatures();

      expect(store.optionCountPerFeature()).toBe(4);
    });

    it('should add one option to every feature', () => {
      configure();

      service.addNewOptionToAllFeatures();

      store.features().forEach(feature => expect(store.optionsByFeature(feature).length).toBe(4));
    });

    it('should pair every new option with the options of the other features', () => {
      configure();

      service.addNewOptionToAllFeatures();

      expect(store.cells().length).toBe(48);
    });
  });

  describe('deleteOption', () => {
    it('should lower the option count', () => {
      configure();

      service.deleteOption(store.options()[0].id);

      expect(store.optionCountPerFeature()).toBe(2);
    });

    it('should remove the option in that slot from every feature', () => {
      configure();

      service.deleteOption(store.options()[0].id);

      expect(store.options().map(option => option.name)).toEqual(['Dog', 'Fish', 'Canoe', 'Tractor', 'Bob', 'Carol']);
    });

    it('should remove the cells of every option it removes', () => {
      configure();

      service.deleteOption(store.options()[0].id);

      expect(store.cells().length).toBe(12);
    });
  });

  describe('deleteFeature', () => {
    it('should remove the feature', () => {
      configure();

      service.deleteFeature(store.features()[1].id);

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Name']);
    });

    it('should remove the options of that feature', () => {
      configure();

      service.deleteFeature(store.features()[1].id);

      expect(store.options().map(option => option.name)).toEqual(['Cat', 'Dog', 'Fish', 'Alice', 'Bob', 'Carol']);
    });

    it('should remove the cells of that feature', () => {
      configure();

      service.deleteFeature(store.features()[1].id);

      expect(store.cells().length).toBe(9);
    });
  });

  describe('clearCells', () => {
    it('should empty every cell', () => {
      configure();
      store.updateCell(store.cells()[0].id, {userValue: CellText.O});
      store.updateCell(store.cells()[1].id, {userValue: CellText.X});

      service.clearCells();

      expect(store.cells().every(cell => cell.userValue === CellText.EMPTY)).toBe(true);
    });

    it('should keep the features and options', () => {
      configure();

      service.clearCells();

      expect(store.featureCount()).toBe(3);
      expect(store.options().length).toBe(9);
    });
  });

  describe('cell option order', () => {
    it('should put the option of the first feature on the left', () => {
      configure();
      const firstFeatureOption = store.optionIdsByFeature(store.features()[0].id)[0] as OptionId;
      const laterFeatureOption = store.optionIdsByFeature(store.features()[2].id)[0] as OptionId;

      const cell = store.cellByOptions(firstFeatureOption, laterFeatureOption);

      expect(cell?.optionIds?.[0]).toBe(firstFeatureOption);
    });

    it('should put the option of the later feature on the left when neither is the first feature', () => {
      configure();
      const middleFeatureOption = store.optionIdsByFeature(store.features()[1].id)[0] as OptionId;
      const lastFeatureOption = store.optionIdsByFeature(store.features()[2].id)[0] as OptionId;

      const cell = store.cellByOptions(lastFeatureOption, middleFeatureOption);

      expect(cell?.optionIds?.[0]).toBe(lastFeatureOption);
    });

    it('should put the option of a feature added later on the left', () => {
      configure();
      service.addNewFeature('Sport');
      const firstFeatureOption = store.optionIdsByFeature(store.features()[0].id)[0] as OptionId;
      const newFeatureOption = store.optionIdsByFeature(store.features()[3].id as FeatureId)[0] as OptionId;

      const cell = store.cellByOptions(firstFeatureOption, newFeatureOption);

      expect(cell?.optionIds?.[0]).toBe(firstFeatureOption);
    });
  });
});
