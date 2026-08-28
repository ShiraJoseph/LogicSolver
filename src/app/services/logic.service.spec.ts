import {TestBed} from '@angular/core/testing';

import {LogicService} from './logic.service';
import {GridStore} from '../store/store';
import {StoreService} from './store.service';
import {GRID_SEED} from '../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {CellText} from '../types/tile.model';
import {FeatureId, OptionId} from '../types/entities.model';

describe('LogicService', () => {
  let service: LogicService;
  let store: InstanceType<typeof GridStore>;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const featureId = (name: string) => store.features().find(feature => feature.name === name)!.id;

  const setCell = (nameA: string, nameB: string, userValue: CellText) =>
    store.updateCell(store.cellByOptions(optionId(nameA), optionId(nameB))!.id, {userValue});

  const candidatesFor = (optionName: string, featureName: string) =>
    [...service.candidates().get(optionId(optionName))!.get(featureId(featureName) as FeatureId)!]
      .map(id => store.optionById(id as OptionId)!.name)
      .sort();

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]});
    TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    service = TestBed.inject(LogicService);
  });

  describe('the starting candidates', () => {
    it('should give every option a candidate set for each of the other features', () => {
      const catCandidates = service.candidates().get(optionId('Cat'))!;

      expect([...catCandidates.keys()]).toEqual([featureId('Vehicle'), featureId('Name')]);
    });

    it('should not give an option a candidate set for its own feature', () => {
      expect(service.candidates().get(optionId('Cat'))!.has(featureId('Pet') as FeatureId)).toBe(false);
    });

    it('should start every candidate set holding all the options of that feature', () => {
      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Bike', 'Canoe', 'Tractor']);
    });

    it('should leave the candidates alone for a cell with no value', () => {
      setCell('Cat', 'Bike', CellText.EMPTY);

      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Bike', 'Canoe', 'Tractor']);
    });
  });

  describe('an X', () => {
    it('should remove the other option from the candidate set', () => {
      setCell('Cat', 'Bike', CellText.X);

      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Canoe', 'Tractor']);
    });

    it('should remove the option from the other candidate set too', () => {
      setCell('Cat', 'Bike', CellText.X);

      expect(candidatesFor('Bike', 'Pet')).toEqual(['Dog', 'Fish']);
    });

    it('should leave the other options of both features alone', () => {
      setCell('Cat', 'Bike', CellText.X);

      expect(candidatesFor('Dog', 'Vehicle')).toEqual(['Bike', 'Canoe', 'Tractor']);
      expect(candidatesFor('Cat', 'Name')).toEqual(['Alice', 'Bob', 'Carol']);
    });
  });

  describe('an O', () => {
    it('should leave the matched option as the only candidate', () => {
      setCell('Cat', 'Bike', CellText.O);

      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Bike']);
    });

    it('should remove the matched option from every sibling of the other option', () => {
      setCell('Cat', 'Bike', CellText.O);

      expect(candidatesFor('Dog', 'Vehicle')).toEqual(['Canoe', 'Tractor']);
      expect(candidatesFor('Fish', 'Vehicle')).toEqual(['Canoe', 'Tractor']);
    });

    it('should rule the matched option out of the other siblings in both directions', () => {
      setCell('Cat', 'Bike', CellText.O);

      expect(candidatesFor('Canoe', 'Pet')).toEqual(['Dog', 'Fish']);
      expect(candidatesFor('Tractor', 'Pet')).toEqual(['Dog', 'Fish']);
    });
  });

  describe('a set that comes down to one candidate', () => {
    it('should be treated as a match and clear that candidate from the siblings', () => {
      setCell('Cat', 'Bike', CellText.X);
      setCell('Cat', 'Canoe', CellText.X);

      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Tractor']);
      expect(candidatesFor('Dog', 'Vehicle')).toEqual(['Bike', 'Canoe']);
      expect(candidatesFor('Fish', 'Vehicle')).toEqual(['Bike', 'Canoe']);
    });

    it('should keep deducing until a pass changes nothing', () => {
      setCell('Cat', 'Bike', CellText.O);
      setCell('Dog', 'Canoe', CellText.O);

      expect(candidatesFor('Fish', 'Vehicle')).toEqual(['Tractor']);
      expect(candidatesFor('Tractor', 'Pet')).toEqual(['Fish']);
    });
  });

  describe('an option ruled out through a third feature', () => {
    it('should be removed when none of the candidates in the middle feature allows it', () => {
      setCell('Cat', 'Tractor', CellText.X);
      setCell('Bike', 'Alice', CellText.X);
      setCell('Canoe', 'Alice', CellText.X);

      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Bike', 'Canoe']);
      expect(candidatesFor('Cat', 'Name')).toEqual(['Bob', 'Carol']);
    });

    it('should keep an option that at least one of the middle candidates still allows', () => {
      setCell('Cat', 'Tractor', CellText.X);
      setCell('Bike', 'Alice', CellText.X);

      expect(candidatesFor('Cat', 'Name')).toEqual(['Alice', 'Bob', 'Carol']);
    });
  });

  describe('recomputing', () => {
    it('should rebuild the candidates when a cell is cleared', () => {
      setCell('Cat', 'Bike', CellText.X);
      setCell('Cat', 'Bike', CellText.EMPTY);

      expect(candidatesFor('Cat', 'Vehicle')).toEqual(['Bike', 'Canoe', 'Tractor']);
    });

    it('should cover a new feature once it is added', () => {
      TestBed.inject(StoreService).addNewFeature('Sport');

      expect(service.candidates().get(optionId('Cat'))!.size).toBe(3);
    });
  });
});
