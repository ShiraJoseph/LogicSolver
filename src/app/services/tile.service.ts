import {computed, inject, Service} from '@angular/core';
import {Tile} from '../types/tile.model';
import {GridStore} from '../store/store';
import {Cell, Feature, OptionId} from '../types/entities.model';
import {createAddFeatureButtonTile, createAddOptionButtonTile, createCellTile, createCornerBlankTile, createFillerBlankTile, createLeftFeatureTile, createLeftOptionTile, createRightBlankTile, createTopFeatureTile, createTopOptionTile} from './tile.factory';

@Service()
export class TileService {
  store = inject(GridStore);

  /**
   * Pushes the array of tile data for the grid, one row at a time.
   * Tiles that span multiple rows are treated as existing only in their top row, in terms of tile order.
   * @see tile.factory.ts for a diagram of how tiles are arranged.
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
    tiles.push(createCornerBlankTile());

    this.store.features().forEach((feature: Feature, index) => {
      if (index > 0) {
        tiles.push(createTopFeatureTile(feature, optionCount, index));
        this.store.optionsByFeature(feature)?.forEach((option) => topOptionTiles.push(createTopOptionTile(option)));
      }
    });
  }

  private fillTopOptions(tiles: Tile[], topOptionTiles: Tile[]) {
    tiles.push(
      createAddFeatureButtonTile(),
      ...topOptionTiles,
      createAddOptionButtonTile()
    );
  }

  private fillGridRows(featuresLength: number, optionCount: number, tiles: Tile[], topOptionTiles: Tile[]) {
    let numberOfCellsInRow = (featuresLength - 1) * optionCount;
    const blanks: Array<Tile> = [];

    for (let leftFeatureIndex = 0; leftFeatureIndex != 1; leftFeatureIndex--, numberOfCellsInRow -= optionCount) {
      const feature = this.store.features()[leftFeatureIndex];

      tiles.push(createLeftFeatureTile(feature, optionCount, leftFeatureIndex));
      this.fillOptionRowsForFeature(feature, tiles, numberOfCellsInRow, topOptionTiles, blanks, optionCount);
      blanks.push(createFillerBlankTile(optionCount));

      if (leftFeatureIndex === 0) {
        leftFeatureIndex = featuresLength;
      }
    }
  }

  private fillOptionRowsForFeature(feature: Feature, tiles: Tile[], rowCellCount: number, topOptionTiles: Tile[], blanks: Tile[], optionCount: number) {
    this.store.optionsByFeature(feature)?.forEach((leftOption, rowInFeature) => {
      tiles.push(createLeftOptionTile(leftOption));

      for (let i = 0; i < rowCellCount; i++) {
        const currCell = this.store.cellByOptions(leftOption.id, topOptionTiles[i]?.entityId as OptionId) as Cell;
        tiles.push(createCellTile(currCell));
      }

      if (rowInFeature === 0) {
        tiles.push(...blanks, createRightBlankTile(optionCount));
      }
    });
  }
}
