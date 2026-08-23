import {TestBed} from '@angular/core/testing';

import {ColorService} from './color.service';
import {GridStore} from '../store/store';
import {StoreService} from './store.service';
import {GRID_SEED} from '../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../mocks/grid.mock';
import {BLACK, FEATURE_COLORS, WHITE} from '../constants/colors.const';
import {Tile, TileType} from '../types/tile.model';
import {CellId, OptionId} from '../types/entities.model';

describe('ColorService', () => {
  let service: ColorService;
  let store: InstanceType<typeof GridStore>;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

  const cellTile = (id: CellId | undefined): Tile => ({text: '', cols: 1, rows: 1, type: TileType.CELL, entityId: id});
  const optionTile = (name: string, type: TileType): Tile =>
    ({text: name, cols: 1, rows: 1, type, entityId: optionId(name)});

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]});
    TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    service = TestBed.inject(ColorService);
  });

  describe('the hovered cell', () => {
    it('should have no hovered options while nothing is hovered', () => {
      expect(service.hoveredLeftOptionId()).toBeUndefined();
      expect(service.hoveredTopOptionId()).toBeUndefined();
    });

    it('should read its two options once a cell is hovered', () => {
      const hovered = store.cellById(cellId('Cat', 'Bike'))!;

      service.hoveredCellId.set(hovered.id);

      expect(service.hoveredLeftOptionId()).toBe(hovered.optionIds![0]);
      expect(service.hoveredTopOptionId()).toBe(hovered.optionIds![1]);
    });
  });

  describe('getCellColor', () => {
    it('should be white for the selected cell', () => {
      const selected = cellId('Cat', 'Bike');
      store.setSelectedCellId(selected);
      service.hoveredCellId.set(selected);

      expect(service.getCellColor(cellTile(selected))).toBe(WHITE);
    });

    it('should be white for a cell on neither hovered line', () => {
      service.hoveredCellId.set(cellId('Cat', 'Bike'));

      expect(service.getCellColor(cellTile(cellId('Dog', 'Canoe')))).toBe(WHITE);
    });

    it('should be white when the cell does not exist', () => {
      service.hoveredCellId.set(cellId('Cat', 'Bike'));

      expect(service.getCellColor(cellTile(undefined))).toBe(WHITE);
    });

    it('should mix both feature colors for the hovered cell itself', () => {
      const hovered = cellId('Cat', 'Bike');
      service.hoveredCellId.set(hovered);

      expect(service.getCellColor(cellTile(hovered)))
        .toBe(`color-mix(in oklab, color-mix(in oklab, ${FEATURE_COLORS[1].background}, ${FEATURE_COLORS[0].background}), white 80%)`);
    });

    it('should tint a cell sharing the hovered row', () => {
      service.hoveredCellId.set(cellId('Cat', 'Bike'));

      expect(service.getCellColor(cellTile(cellId('Cat', 'Alice'))))
        .toBe(`color-mix(in oklab, ${FEATURE_COLORS[0].background}, white 90%)`);
    });

    it('should tint a cell sharing the hovered column', () => {
      service.hoveredCellId.set(cellId('Dog', 'Bike'));

      expect(service.getCellColor(cellTile(cellId('Cat', 'Bike'))))
        .toBe(`color-mix(in oklab, ${FEATURE_COLORS[1].background}, white 90%)`);
    });
  });

  describe('getOptionColor', () => {
    it('should mix the feature color with white for an option that is not hovered', () => {
      expect(service.getOptionColor(optionTile('Cat', TileType.LEFT_OPTION_HEADER)))
        .toBe(`color-mix(in oklab, ${WHITE} 70%, ${FEATURE_COLORS[0].background})`);
    });

    it('should use less white for a hovered left option', () => {
      service.hoveredCellId.set(cellId('Cat', 'Bike'));

      expect(service.getOptionColor(optionTile('Cat', TileType.LEFT_OPTION_HEADER)))
        .toBe(`color-mix(in oklab, ${WHITE} 40%, ${FEATURE_COLORS[0].background})`);
    });

    it('should use less white for a hovered top option', () => {
      service.hoveredCellId.set(cellId('Cat', 'Bike'));

      expect(service.getOptionColor(optionTile('Bike', TileType.TOP_OPTION_HEADER)))
        .toBe(`color-mix(in oklab, ${WHITE} 40%, ${FEATURE_COLORS[1].background})`);
    });

    it('should not use the hovered mix when the option is hovered on the other axis', () => {
      service.hoveredCellId.set(cellId('Cat', 'Bike'));

      expect(service.getOptionColor(optionTile('Cat', TileType.TOP_OPTION_HEADER)))
        .toBe(`color-mix(in oklab, ${WHITE} 70%, ${FEATURE_COLORS[0].background})`);
    });

    it('should be white for an option that belongs to no feature', () => {
      const tile: Tile = {text: '', cols: 1, rows: 1, type: TileType.LEFT_OPTION_HEADER, entityId: 'missing' as OptionId};

      expect(service.getOptionColor(tile)).toBe(WHITE);
    });
  });

  describe('getFeatureColor', () => {
    it('should return the color for that position', () => {
      expect(service.getFeatureColor(2)).toBe(FEATURE_COLORS[2].background);
    });

    it('should wrap around when there are more features than colors', () => {
      expect(service.getFeatureColor(FEATURE_COLORS.length)).toBe(FEATURE_COLORS[0].background);
    });

    it('should be transparent without a position', () => {
      expect(service.getFeatureColor(undefined)).toBe('transparent');
    });

    it('should be transparent for a negative position', () => {
      expect(service.getFeatureColor(-1)).toBe('transparent');
    });
  });

  describe('getFeatureTextColor', () => {
    it('should return the text color for that position', () => {
      expect(service.getFeatureTextColor(2)).toBe(FEATURE_COLORS[2].text);
    });

    it('should wrap around when there are more features than colors', () => {
      expect(service.getFeatureTextColor(FEATURE_COLORS.length)).toBe(FEATURE_COLORS[0].text);
    });

    it('should be black without a position', () => {
      expect(service.getFeatureTextColor(undefined)).toBe(BLACK);
    });

    it('should be black for a negative position', () => {
      expect(service.getFeatureTextColor(-1)).toBe(BLACK);
    });
  });
});
