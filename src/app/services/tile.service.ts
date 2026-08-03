import {computed, inject, Injectable, linkedSignal} from '@angular/core';
import {DataService} from './data.service';
import {Tile, TileType} from '../types/tile.model';
import {DataStore} from './data.store';
import {Cell, Feature, Option, OptionId} from '../types/entities.model';
import {
  CELL_TILE,
  CORNER_BLANK_TILE,
  FILLER_BLANK_TILE,
  LEFT_FEATURE_TILE, LEFT_OPTION_TILE,
  NEW_FEATURE_BUTTON_TILE,
  NEW_OPTION_BUTTON_TILE,
  RIGHT_BLANK_TILE,
  TOP_FEATURE_TILE,
  TOP_OPTION_TILE
} from './tile.factory';

@Injectable({
  providedIn: 'root',
})
export class TileService {
  store = inject(DataStore);

  /**
   * Pushes the array of tile data for the mat-grid, one row at a time.
   * Tiles that span multiple rows are treated as existing only in their top row, in terms of tile order
   * @see tile.factory.ts for a diagram of how tiles are arranged.
   */
  tiles2 = linkedSignal(() => {
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
        tiles.push(TOP_FEATURE_TILE(feature, optionCount, index));
        this.store.optionsByFeature(feature)?.forEach((option) => topOptionTiles.push(TOP_OPTION_TILE(option)));
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

  private fillGridRows(featuresLength: any, optionCount: number, tiles: Tile[], topOptionTiles: Tile[]) {
    let numberOfCellsInRow = (featuresLength - 1) * optionCount;
    const blanks: Array<Tile> = [];

    for (let leftFeatureIndex = 0; leftFeatureIndex != 1; leftFeatureIndex--, numberOfCellsInRow -= optionCount) {
      const feature = this.store.features()[leftFeatureIndex];

      tiles.push(LEFT_FEATURE_TILE(feature, optionCount, leftFeatureIndex));
      this.fillOptionRowsForFeature(feature, tiles, numberOfCellsInRow, topOptionTiles, blanks, optionCount);
      blanks.push(FILLER_BLANK_TILE(optionCount));

      if (leftFeatureIndex === 0) {
        leftFeatureIndex = featuresLength;
      }
    }
  }

  private fillOptionRowsForFeature(feature: any, tiles: Tile[], rowCellCount: number, topOptionTiles: Tile[], blanks: Tile[], optionCount: number) {
    this.store.optionsByFeature(feature)?.forEach((leftOption, rowInFeature) => {
      tiles.push(LEFT_OPTION_TILE(leftOption));

      for (let i = 0; i < rowCellCount; i++) {
        const currCell = this.store.cellByOptions(leftOption.id2, topOptionTiles[i].objectId2 as OptionId) as Cell;
        tiles.push(CELL_TILE(currCell));
      }

      if (rowInFeature === 0) {
        tiles.push(...blanks, RIGHT_BLANK_TILE(optionCount));
      }
    });
  }
}
