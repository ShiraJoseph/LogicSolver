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
  tiles: Tile[];
  leftFeatureTiles: Tile[];

  constructor(private dataService: DataService) {
  }

  getTiles () {
    return this.tiles;
  }
  buildGrid() {
    this.buildHeaderTiles();
    this.buildRows();
  }

  buildHeaderTiles() {
    const topOptionTiles = [];
    const topFeatureTiles = [];
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
          object: feature,
          objectId: feature.id,
        });
        this.dataService.getFeatureOptions(feature.id).forEach(option => {
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
    // push the first left feature
    this.leftFeatureTiles.push({
      text: this.dataService.features[0].name,
      cols: 1,
      rows: this.dataService.optionCount,
      color: 'gray',
      type: TileType.LEFT_FEATURE_HEADER,
      objectId: this.dataService.features[0].id,
    });
    // push the remaining left features using the feature list in reverse order
    for (let fCount = this.dataService.features.length - 1; fCount > 1; fCount--) {
      this.leftFeatureTiles.push({
        text: this.dataService.features[fCount].name,
        cols: 1,
        rows: this.dataService.optionCount,
        color: 'gray',
        type: TileType.LEFT_FEATURE_HEADER,
        objectId: this.dataService.features[fCount].id,
      });
    }
    // insert all the headers and the add buttons to the grid
    this.tiles.push(
      {text: null, cols: 4, rows: 4, color: 'white', type: TileType.CORNER_BLANK},
      ...topFeatureTiles,
      {text: '+', cols: 1, rows: 1, type: TileType.ADD_FEATURE},
      ...topOptionTiles,
      {text: '+', cols: 1, rows: 3, type: TileType.ADD_OPTION},
    );
  }

  buildRows() {
    let cellIndex = 0;
    let rowCellCount = (this.dataService.features.length - 1) * this.dataService.optionCount;
    const blanks = [];
    this.leftFeatureTiles.forEach(featureTile => {
      let addBlank = true;
      // push a left feature
      this.tiles.push(featureTile);
      this.dataService.getFeatureOptions(featureTile.objectId).forEach(option => {
        // push a left option
        this.tiles.push({
          text: option.name,
          cols: 3,
          rows: 1,
          color: 'lightgray',
          type: TileType.LEFT_OPTION_HEADER,
          objectId: option.id,
        });
        for (let cell = 0; cell < rowCellCount && cellIndex < this.dataService.cells.length; cell++) {
          // push a cell
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
        // push any blanks needed to the end of the row, to fill the bottom right corner
        if (addBlank) {
          this.tiles.push(
            ...blanks,
            {text: null, cols: 1, rows: this.dataService.optionCount, type: TileType.RIGHT_BLANK}
          );
          addBlank = false;
        }
      });
      // take away one feature's worth of cells, so we don't have too many cells in the next row
      rowCellCount -= this.dataService.optionCount;
      // add another blank so the next row will have the right number of blanks
      blanks.push({
        text: null,
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
