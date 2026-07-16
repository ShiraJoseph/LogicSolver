import {computed, inject, Injectable} from '@angular/core';
import {DataService} from './data.service';
import {Tile, TileType} from './tile.model';
import {DataStore} from './data.store';
import {Cell, Feature, Option, OptionId} from './entities.model';
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
  tiles: Tile[] = [];
  leftFeatureTiles: Tile[] = [];

  /**
   * Pushes the array of tile data for the mat-grid, one row at a time.
   * Tiles that span multiple rows are treated as existing only in their top row, in terms of tile order
   * @see tile.factory.ts for a diagram of how tiles are arranged.
   */
  tiles2 = computed(() => {
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
        tiles.push(TOP_FEATURE_TILE(feature, optionCount));
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

      tiles.push(LEFT_FEATURE_TILE(feature, optionCount));
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

  constructor(private dataService: DataService) {}

  getTiles() {
    return this.tiles;
  }

  buildGrid() {
    this.buildHeaderTiles();
    this.buildRows();
  }

  buildHeaderTiles() {
    const topOptionTiles: Array<Tile> = [];
    const topFeatureTiles: Array<Tile> = [];
    this.leftFeatureTiles = [];
    this.tiles = [];

    this.dataService.features.forEach((feature, index) => {
      if (index > 0) {
        topFeatureTiles.push({
          text: feature.name,
          cols: this.dataService.optionCount,
          rows: 1,
          color: 'gray',
          type: TileType.TOP_FEATURE_HEADER,
          objectId: feature.id,
        });
        this.dataService.getFeatureOptions(feature.id)?.forEach((option) => {
          topOptionTiles.push({
            text: option.name,
            cols: 1,
            rows: 3,
            color: 'lightgray',
            type: TileType.TOP_OPTION_HEADER,
            objectId: option.id,
          });
        });
      }
    });

    this.leftFeatureTiles.push({
      text: this.dataService.features[0].name,
      cols: 1,
      rows: this.dataService.optionCount,
      color: 'gray',
      type: TileType.LEFT_FEATURE_HEADER,
      objectId: this.dataService.features[0].id,
    });

    for (
      let featureIndex = this.dataService.features.length - 1;
      featureIndex > 1;
      featureIndex--
    ) {
      this.leftFeatureTiles.push({
        text: this.dataService.features[featureIndex].name,
        cols: 1,
        rows: this.dataService.optionCount,
        color: 'gray',
        type: TileType.LEFT_FEATURE_HEADER,
        objectId: this.dataService.features[featureIndex].id,
      });
    }

    this.tiles.push(
      {text: '', cols: 4, rows: 4, color: 'white', type: TileType.CORNER_BLANK},
      ...topFeatureTiles,
      {text: '+', cols: 1, rows: 1, type: TileType.ADD_FEATURE},
      ...topOptionTiles,
      {text: '+', cols: 1, rows: 3, type: TileType.ADD_OPTION},
    );
  }

  /**
   * Builds the staircase of cell rows. Each left feature gets one fewer
   * feature's worth of cells than the one above it, so every row sheds one
   * feature's cells and gains one filler blank to keep the grid square.
   */
  buildRows() {
    let cellIndex = 0;
    let rowCellCount = (this.dataService.features.length - 1) * this.dataService.optionCount;
    const blanks: Array<Tile> = [];

    this.leftFeatureTiles.forEach((featureTile) => {
      let addBlank = true;
      this.tiles.push(featureTile);

      this.dataService.getFeatureOptions(featureTile.objectId)?.forEach((option) => {
        this.tiles.push({
          text: option.name,
          cols: 3,
          rows: 1,
          color: 'lightgray',
          type: TileType.LEFT_OPTION_HEADER,
          objectId: option.id,
        });

        for (let i = 0; i < rowCellCount && cellIndex < this.dataService.cells.length; i++) {
          this.tiles.push({
            text: this.dataService.cells[cellIndex].value,
            cols: 1,
            rows: 1,
            color: 'white',
            type: TileType.CELL_INACTIVE,
            objectId: this.dataService.cells[cellIndex].id,
          });
          cellIndex++;
        }

        if (addBlank) {
          this.tiles.push(...blanks, {
            text: '',
            cols: 1,
            rows: this.dataService.optionCount,
            type: TileType.RIGHT_BLANK,
          });
          addBlank = false;
        }
      });

      rowCellCount -= this.dataService.optionCount;
      blanks.push({
        text: '',
        cols: this.dataService.optionCount,
        rows: this.dataService.optionCount,
        color: 'white',
        type: TileType.FILLER_BLANK,
      });
    });
  }

  getColumnCount() {
    return this.dataService.optionCount * (this.dataService.features.length - 1) + 5;
  }
}
