import {computed, inject, Service} from '@angular/core';
import {CellText, Tile} from '../types/tile.model';
import {GridStore} from '../store/store';
import {Cell, Feature, OptionId} from '../types/entities.model';
import {CELL_TILE, CORNER_BLANK_TILE, FILLER_BLANK_TILE, LEFT_FEATURE_TILE, LEFT_OPTION_TILE, NEW_FEATURE_BUTTON_TILE, NEW_OPTION_BUTTON_TILE, RIGHT_BLANK_TILE, TOP_FEATURE_TILE, TOP_OPTION_TILE} from '../constants/tile.const';
import {BOTTOM_BORDER, RIGHT_BORDER} from '../constants/grid.const';

@Service()
export class TileService {
  store = inject(GridStore);

  /**
   * Pushes the array of tile data for the grid, one row at a time.
   * Tiles that span multiple rows are treated as existing only in their top row, in terms of tile order.
   * @see tile.const.ts for a diagram of how tiles are arranged.
   */
  tiles = computed(() => {
    const tiles: Array<Tile> = [];
    const topOptionTiles: Array<Tile> = [];
    const optionCount: number = this.store.optionCountPerFeature();
    const featuresLength = this.store.featureCount();

    this.fillTopFeatures(tiles, optionCount, topOptionTiles);
    this.fillTopOptions(tiles, topOptionTiles);
    this.fillGridRows(featuresLength, optionCount, tiles, topOptionTiles);

    return tiles;
  });

  private fillTopFeatures(tiles: Tile[], optionCount: number, topOptionTiles: Tile[]) {
    tiles.push(CORNER_BLANK_TILE);

    this.store.features().forEach((feature: Feature, index) => {
      if (index > 0) {
        tiles.push({...TOP_FEATURE_TILE, text: feature.name, entityId: feature.id, cols: optionCount});
        this.store.optionsByFeature(feature)?.forEach((option, indexInFeature) => topOptionTiles.push({
          ...TOP_OPTION_TILE,
          text: option.name,
          entityId: option.id,
          borders: this.joinBorders(TOP_OPTION_TILE.borders, indexInFeature === optionCount - 1 && RIGHT_BORDER)
        }));
      }
    });
  }

  private fillTopOptions(tiles: Tile[], topOptionTiles: Tile[]) {
    tiles.push(
      NEW_FEATURE_BUTTON_TILE,
      ...topOptionTiles,
      NEW_OPTION_BUTTON_TILE
    );
  }

  private fillGridRows(featuresLength: number, optionCount: number, tiles: Tile[], topOptionTiles: Tile[]) {
    const blanks: Array<Tile> = [];

    this.leftFeatureIndexes(featuresLength).forEach((leftFeatureIndex, blockIndex) => {
      const feature = this.store.features()[leftFeatureIndex];

      tiles.push({...LEFT_FEATURE_TILE, text: feature?.name, entityId: feature?.id, rows: optionCount});
      this.fillOptionRowsForFeature(feature, tiles, (featuresLength - 1 - blockIndex) * optionCount, topOptionTiles, blanks, optionCount);
      blanks.push({...FILLER_BLANK_TILE, cols: optionCount, rows: optionCount});
    });
  }

  /**
   * The features that get a row block on the left, in order: the first feature, then the rest from the last back to the second.
   */
  private leftFeatureIndexes(featuresLength: number): Array<number> {
    const afterTheFirst = Array.from({length: Math.max(featuresLength - 2, 0)}, (_, index) => featuresLength - 1 - index);

    return featuresLength ? [0, ...afterTheFirst] : [];
  }

  private fillOptionRowsForFeature(feature: Feature, tiles: Tile[], rowCellCount: number, topOptionTiles: Tile[], blanks: Tile[], optionCount: number) {
    const lastOptionIndex = optionCount - 1;

    this.store.optionsByFeature(feature)?.forEach((leftOption, rowInFeature) => {
      const isLastRowInBlock = rowInFeature === lastOptionIndex;

      tiles.push({
        ...LEFT_OPTION_TILE,
        text: leftOption.name,
        entityId: leftOption.id,
        borders: this.joinBorders(LEFT_OPTION_TILE.borders, isLastRowInBlock && BOTTOM_BORDER)
      });

      for (let i = 0; i < rowCellCount; i++) {
        const currCell = this.store.cellByOptions(leftOption.id, topOptionTiles[i]?.entityId as OptionId) as Cell;
        tiles.push({
          ...CELL_TILE,
          text: currCell?.userValue || CellText.EMPTY,
          entityId: currCell?.id,
          borders: this.joinBorders(i % optionCount === lastOptionIndex && RIGHT_BORDER, isLastRowInBlock && BOTTOM_BORDER)
        });
      }

      if (rowInFeature === 0) {
        tiles.push(...blanks, {...RIGHT_BLANK_TILE, rows: optionCount});
      }
    });
  }

  private joinBorders = (...borders: Array<string | false | undefined>): string => borders.filter(Boolean).join(' ');
}
