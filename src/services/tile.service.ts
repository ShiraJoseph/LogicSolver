import { Injectable } from '@angular/core';
import { DataService } from './data.service';

export interface Tile {
  color?: string;
  cols: number;
  rows: number;
  text: string;
  type?: TileType;
  objectId?: number;
  shouldShowMinus?: boolean;
}

export enum TileType {
  CELL_ACTIVE = 'CELL_ACTIVE',
  CELL_INACTIVE = 'CELL_INACTIVE',
  TOP_FEATURE_HEADER = 'TOP_FEATURE_HEADER',
  TOP_OPTION_HEADER = 'TOP_OPTION_HEADER',
  LEFT_FEATURE_HEADER = 'LEFT_FEATURE_HEADER',
  LEFT_OPTION_HEADER = 'LEFT_OPTION_HEADER',
  ADD_FEATURE = 'ADD_FEATURE',
  ADD_OPTION = 'ADD_OPTION',
  CORNER_BLANK = 'CORNER_BLANK',
  RIGHT_BLANK = 'RIGHT_BLANK',
  FILLER_BLANK = 'FILLER_BLANK',
}

@Injectable({
  providedIn: 'root'
})
export class TileService {
  tiles: Tile[] = [];
  leftFeatureTiles: Tile[] = [];

  constructor(private dataService: DataService) {
  }

  getTiles() {
    return this.tiles;
  }

  buildGrid() {
    this.buildHeaderTiles();
    this.buildRows();
  }

  buildHeaderTiles() {
    const topOptionTiles:Array<Tile> = [];
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
        this.dataService.getFeatureOptions(feature.id)?.forEach(option => {
          topOptionTiles.push({
            text: option.name,
            cols: 1,
            rows: 3,
            color: 'lightgray',
            type: TileType.TOP_OPTION_HEADER,
            objectId: option.id
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

    for (let featureIndex = this.dataService.features.length - 1; featureIndex > 1; featureIndex--) {
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

    this.leftFeatureTiles.forEach(featureTile => {
      let addBlank = true;
      this.tiles.push(featureTile);

      this.dataService.getFeatureOptions(featureTile.objectId)?.forEach(option => {
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
          this.tiles.push(
            ...blanks,
            {text: '', cols: 1, rows: this.dataService.optionCount, type: TileType.RIGHT_BLANK}
          );
          addBlank = false;
        }
      });

      rowCellCount -= this.dataService.optionCount;
      blanks.push({
        text: '',
        cols: this.dataService.optionCount,
        rows: this.dataService.optionCount,
        color: 'white',
        type: TileType.FILLER_BLANK
      });
    });
  }

  getColumnCount() {
    return this.dataService.optionCount * (this.dataService.features.length - 1) + 5;
  }
}
