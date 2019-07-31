import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Cell, Feature, Option } from '../model';

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

export interface Tile {
  color?: string;
  cols: number;
  rows: number;
  text: string;
  type?: TileType;
  objectId?: number;
  shouldShowMinus?: boolean;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
  cols;
  leftFeatureTiles = [];
  tiles: Tile[] = [];
  disableDelete = false;

  constructor(private dS: DataService) {
  }

  ngOnInit() {
    this.buildGrid();
  }

  buildGrid() {
    this.buildHeaderTiles();
    this.buildRows();
    this.cols = this.dS.optionCount * (this.dS.features.length - 1) + 5;
  }

  buildHeaderTiles() {
    const topOptionTiles = [];
    const topFeatureTiles = [];
    this.leftFeatureTiles = [];
    this.tiles = [];
    this.dS.features.forEach((feature, index) => {
      if (index > 0) {
        topFeatureTiles.push({
          text: feature.name,
          cols: this.dS.optionCount,
          rows: 1,
          color: 'gray',
          type: TileType.TOP_FEATURE_HEADER,
          object: feature,
          objectId: feature.id,
        });
        this.dS.getFeatureOptions(feature.id).forEach(option => {
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
      text: this.dS.features[0].name,
      cols: 1,
      rows: this.dS.optionCount,
      color: 'gray',
      type: TileType.LEFT_FEATURE_HEADER,
      objectId: this.dS.features[0].id,
    });
    // push the remaining left features using the feature list in reverse order
    for (let fCount = this.dS.features.length - 1; fCount > 1; fCount--) {
      this.leftFeatureTiles.push({
        text: this.dS.features[fCount].name,
        cols: 1,
        rows: this.dS.optionCount,
        color: 'gray',
        type: TileType.LEFT_FEATURE_HEADER,
        objectId: this.dS.features[fCount].id,
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
    let rowCellCount = (this.dS.features.length - 1) * this.dS.optionCount;
    const blanks = [];
    this.leftFeatureTiles.forEach(featureTile => {
      let addBlank = true;
      // push a left feature
      this.tiles.push(featureTile);
      this.dS.getFeatureOptions(featureTile.objectId).forEach(option => {
        // push a left option
        this.tiles.push({
          text: option.name,
          cols: 3,
          rows: 1,
          color: 'lightgray',
          type: TileType.LEFT_OPTION_HEADER,
          objectId: option.id,
        });
        for (let cell = 0; cell < rowCellCount && cellIndex < this.dS.cells.length; cell++) {
          // push a cell
          this.tiles.push({
            text: this.dS.cells[cellIndex].value,
            cols: 1,
            rows: 1,
            color: 'white',
            type: TileType.CELL_INACTIVE,
            objectId: this.dS.cells[cellIndex].id,
          });
          cellIndex++;
        }
        // push any blanks needed to the end of the row, to fill the bottom right corner
        if (addBlank) {
          this.tiles.push(
            ...blanks,
            {text: null, cols: 1, rows: this.dS.optionCount, type: TileType.RIGHT_BLANK}
          );
          addBlank = false;
        }
      });
      // take away one feature's worth of cells, so we don't have too many cells in the next row
      rowCellCount -= this.dS.optionCount;
      // add another blank so the next row will have the right number of blanks
      blanks.push({
        text: null,
        cols: this.dS.optionCount,
        rows: this.dS.optionCount,
        color: 'white',
        type: TileType.FILLER_BLANK
      });
    });
  }



  addFeature() {
    this.dS.addFeature();
    this.buildGrid();
  }


  addOption() {
    this.dS.addOption();
    this.buildGrid();
  }

  updateFeature(event, tile: Tile) {
    setTimeout(() => {
      if (tile.shouldShowMinus) {
        console.log(event.target.value);
        this.dS.setFeature(tile.objectId, event.target.value);
        this.buildGrid();
        tile.shouldShowMinus = false;
      }
    }, 100);
  }

  updateOption(event, tile: Tile) {
    setTimeout(() => {
      if (tile.shouldShowMinus) {
        console.log(event.target.value);
        this.dS.setOption(tile.objectId, event.target.value);
        this.buildGrid();
        tile.shouldShowMinus = false;
      }
    }, 100);
  }

  deleteFeature(tile: Tile) {
    console.log('deleteFeature');
    tile.shouldShowMinus = false;
    this.dS.deleteFeature(tile.objectId);
    if (this.dS.features.length <= 2) {
      this.disableDelete = true;
    }
    this.buildGrid();
  }

  deleteOption(tile: Tile) {
    console.log('deleteOption');
    tile.shouldShowMinus = false;
    this.dS.deleteOption(tile.objectId);
    this.buildGrid();
  }

  // deactivates all tiles except the currently selected one.
  switchOut(newTile: Tile) {
    this.tiles.forEach((tile) => {
      if (tile.type === TileType.CELL_ACTIVE) {
        tile.type = TileType.CELL_INACTIVE;
      }
    });
    newTile.type = TileType.CELL_ACTIVE;
  }

  updateTile(tile: Tile, text: string) {
    tile.text = text;
    this.dS.setCell(tile.objectId, text);
    tile.type = TileType.CELL_INACTIVE;
  }
}
