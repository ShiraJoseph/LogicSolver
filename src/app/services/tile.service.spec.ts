import {TestBed} from '@angular/core/testing';

import {TileService} from './tile.service';
import {GridStore} from '../store/store';
import {StoreService} from './store.service';
import {GRID_SEED} from '../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {CellText, Tile, TileType} from '../types/tile.model';
import {BOTTOM_BORDER, RIGHT_BORDER} from '../constants/grid.const';
import {GridSeed} from '../types/grid.model';

describe('TileService', () => {
  let service: TileService;
  let store: InstanceType<typeof GridStore>;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const tilesOfType = (type: TileType) => service.tiles().filter(tile => tile.type === type);
  const tileFor = (name: string) => service.tiles().find(tile => tile.text === name) as Tile;

  const configure = (seed: GridSeed = MOCK_SMALL_GRID_SEED) => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: seed}]});
    TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    service = TestBed.inject(TileService);
  };

  describe('the header rows', () => {
    it('should open with the corner, a top feature per feature after the first, and the add feature button', () => {
      configure();

      expect(service.tiles().slice(0, 4).map(tile => tile.type))
        .toEqual([TileType.CORNER_BLANK, TileType.TOP_FEATURE_HEADER, TileType.TOP_FEATURE_HEADER, TileType.ADD_FEATURE]);
    });

    it('should name the top features after the features they stand for', () => {
      configure();

      expect(tilesOfType(TileType.TOP_FEATURE_HEADER).map(tile => tile.text)).toEqual(['Vehicle', 'Name']);
    });

    it('should span a top feature across its options', () => {
      configure();

      expect(tileFor('Vehicle').cols).toBe(3);
    });

    it('should follow the add feature button with every top option and then the add option button', () => {
      configure();

      expect(service.tiles().slice(4, 11).map(tile => tile.text))
        .toEqual(['Bike', 'Canoe', 'Tractor', 'Alice', 'Bob', 'Carol', '+']);
      expect(service.tiles()[10].type).toBe(TileType.ADD_OPTION);
    });

    it('should give the last top option of each feature a right border', () => {
      configure();

      expect(tileFor('Tractor').borders).toContain(RIGHT_BORDER);
      expect(tileFor('Carol').borders).toContain(RIGHT_BORDER);
    });

    it('should not give the other top options a right border', () => {
      configure();

      expect(tileFor('Bike').borders).not.toContain(RIGHT_BORDER);
    });
  });

  describe('the left headers', () => {
    it('should use the first feature and then the features from the end', () => {
      configure();

      expect(tilesOfType(TileType.LEFT_FEATURE_HEADER).map(tile => tile.text)).toEqual(['Pet', 'Name']);
    });

    it('should span a left feature down its options', () => {
      configure();

      expect(tilesOfType(TileType.LEFT_FEATURE_HEADER)[0].rows).toBe(3);
    });

    it('should list the options of each left feature', () => {
      configure();

      expect(tilesOfType(TileType.LEFT_OPTION_HEADER).map(tile => tile.text))
        .toEqual(['Cat', 'Dog', 'Fish', 'Alice', 'Bob', 'Carol']);
    });

    it('should give the last left option of each block a bottom border', () => {
      configure();

      expect(tilesOfType(TileType.LEFT_OPTION_HEADER)[2].borders).toContain(BOTTOM_BORDER);
      expect(tilesOfType(TileType.LEFT_OPTION_HEADER)[5].borders).toContain(BOTTOM_BORDER);
    });

    it('should not give the other left options a bottom border', () => {
      configure();

      expect(tilesOfType(TileType.LEFT_OPTION_HEADER)[0].borders).not.toContain(BOTTOM_BORDER);
    });
  });

  describe('the cells', () => {
    it('should lay out a cell for every pair of options on the grid', () => {
      configure();

      expect(tilesOfType(TileType.CELL).length).toBe(27);
    });

    it('should carry the id of the cell it stands for', () => {
      configure();

      const cell = store.cellByOptions(optionId('Cat'), optionId('Bike'))!;

      expect(tilesOfType(TileType.CELL)[0].entityId).toBe(cell.id);
    });

    it('should show the value the user entered', () => {
      configure();

      const cell = store.cellByOptions(optionId('Cat'), optionId('Bike'))!;

      store.updateCell(cell.id, {userValue: CellText.O});

      expect(tilesOfType(TileType.CELL)[0].text).toBe(CellText.O);
    });

    it('should show nothing for a cell with no value', () => {
      configure();

      expect(tilesOfType(TileType.CELL)[0].text).toBe(CellText.EMPTY);
    });

    it('should give the last cell of each feature block a right border', () => {
      configure();

      expect(tilesOfType(TileType.CELL)[2].borders).toContain(RIGHT_BORDER);
      expect(tilesOfType(TileType.CELL)[5].borders).toContain(RIGHT_BORDER);
    });

    it('should give the cells of the last row in a block a bottom border', () => {
      configure();

      expect(tilesOfType(TileType.CELL)[12].borders).toContain(BOTTOM_BORDER);
    });

    it('should leave a cell in the middle of a block without borders', () => {
      configure();

      expect(tilesOfType(TileType.CELL)[0].borders).toBe('');
    });
  });

  describe('the blanks', () => {
    it('should close each block row with a right blank spanning the options', () => {
      configure();

      expect(tilesOfType(TileType.RIGHT_BLANK).length).toBe(2);
      expect(tilesOfType(TileType.RIGHT_BLANK)[0].rows).toBe(3);
    });

    it('should fill the step under each finished block', () => {
      configure();

      expect(tilesOfType(TileType.FILLER_BLANK).length).toBe(1);
      expect(tilesOfType(TileType.FILLER_BLANK)[0].cols).toBe(3);
      expect(tilesOfType(TileType.FILLER_BLANK)[0].rows).toBe(3);
    });
  });

  describe('the left blocks', () => {
    it('should start with the first feature and then work back from the last', () => {
      configure({featureNames: ['A', 'B', 'C', 'D'], optionNames: ['1', '2', '3', '4', '5', '6', '7', '8']});

      expect(tilesOfType(TileType.LEFT_FEATURE_HEADER).map(tile => tile.text)).toEqual(['A', 'D', 'C']);
    });

    it('should narrow each block by one feature of columns', () => {
      configure({featureNames: ['A', 'B', 'C', 'D'], optionNames: ['1', '2', '3', '4', '5', '6', '7', '8']});
      const cellsPerRow = tilesOfType(TileType.LEFT_FEATURE_HEADER)
        .map((_, blockIndex) => (3 - blockIndex) * 2);

      expect(cellsPerRow).toEqual([6, 4, 2]);
      expect(tilesOfType(TileType.CELL).length).toBe((6 + 4 + 2) * 2);
    });

    it('should give the only left block to the first feature of a two feature grid', () => {
      configure({featureNames: ['A', 'B'], optionNames: ['1', '2', '3', '4']});

      expect(tilesOfType(TileType.LEFT_FEATURE_HEADER).map(tile => tile.text)).toEqual(['A']);
      expect(tilesOfType(TileType.CELL).length).toBe(4);
    });

    it('should lay out a single feature with no cells to pair it against', () => {
      configure({featureNames: ['A'], optionNames: ['1', '2']});

      expect(tilesOfType(TileType.LEFT_FEATURE_HEADER).map(tile => tile.text)).toEqual(['A']);
      expect(tilesOfType(TileType.CELL).length).toBe(0);
    });

    it('should lay out nothing but the corner and the add buttons for an empty grid', () => {
      configure({featureNames: [], optionNames: []});

      expect(service.tiles().map(tile => tile.type))
        .toEqual([TileType.CORNER_BLANK, TileType.ADD_FEATURE, TileType.ADD_OPTION]);
    });
  });

  describe('reacting to the grid', () => {
    it('should grow when a feature is added', () => {
      configure();

      const before = service.tiles().length;

      TestBed.inject(StoreService).addNewFeature('Sport');

      expect(service.tiles().length).toBeGreaterThan(before);
      expect(tilesOfType(TileType.CELL).length).toBe(54);
    });

    it('should shrink when a feature is deleted', () => {
      configure();

      TestBed.inject(StoreService).deleteFeature(store.features()[1].id);

      expect(tilesOfType(TileType.CELL).length).toBe(9);
    });
  });
});
