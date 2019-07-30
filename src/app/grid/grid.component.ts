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
  DELETE_FEATURE = 'DELETE_FEATURE',
  DELETE_OPTION = 'DELETE_OPTION',
}

export interface Tile {
  color?: string;
  cols: number;
  rows: number;
  text: string;
  type?: TileType;
  // object?: Cell | Feature | Option;
  objectId?: number;
  showMinus?: boolean;
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

  constructor(private dS: DataService) {
  }

  ngOnInit() {
    this.buildGrid();
  }

  buildGrid() {
    this.cols = this.dS.optionCount * (this.dS.features.length - 1) + 5;
    this.buildHeaderTiles();
    this.buildRows();
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
      if (index !== 1) {
        this.leftFeatureTiles.push({
          text: feature.name,
          cols: 1,
          rows: this.dS.optionCount,
          color: 'gray',
          type: TileType.LEFT_FEATURE_HEADER,
          objectId: feature.id,
        });
      }
    });

    this.tiles.push(
      { text: null, cols: 4, rows: 4, color: 'white', type: TileType.CORNER_BLANK },
      ...topFeatureTiles,
      { text: '+', cols: 1, rows: 1, type: TileType.ADD_FEATURE },
      ...topOptionTiles,
      { text: '+', cols: 1, rows: 3, type: TileType.ADD_OPTION },
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
      this.dS.getFeatureOptions(featureTile.objectId)
      // featureTile.object.options
        .forEach(option => {
        // push a left option
        this.tiles.push({
          text: option.name,
          cols: 3,
          rows: 1,
          color: 'lightgray',
          type: TileType.LEFT_OPTION_HEADER,
          // object: option,
          objectId: option.id,
        });
        for (let cell = 0; cell < rowCellCount && cellIndex < this.dS.cells.length; cell++) {
          // push a cell
          this.tiles.push({
            text: this.dS.cells[cellIndex].value,
            cols: 1,
            rows: 1,
            color: 'white',
            // object: this.dS.cells[cellIndex],
            type: TileType.CELL_INACTIVE,
            objectId: this.dS.cells[cellIndex].id,
          });
          cellIndex++;
        }
        // push any blanks needed to the end of the row, to fill the bottom right corner
        if (addBlank) {
          this.tiles.push(
            ...blanks,
            { text: null, cols: 1, rows: this.dS.optionCount, type: TileType.RIGHT_BLANK }
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

  addFeature() {
    this.dS.addFeature();
    this.buildGrid();
  }

  deleteFeature(tile: Tile) {
    this.dS.deleteFeature(tile.objectId);
    this.buildGrid();
  }

  deleteOption(tile: Tile) {
    this.dS.deleteOption(tile.objectId);
    this.buildGrid();
  }

  addOption() {
    this.dS.addOption();
    this.buildGrid();
  }

  updateOption(tile: Tile, text: string) {
    this.dS.setOption(tile.objectId, text);
    this.buildGrid();
  }

  updateFeature(tile: Tile, text: string) {
    this.dS.setFeature(tile.objectId, text);
    this.buildGrid();
  }

  // showMinus(tile: Tile) {
    // const index = this.tiles.findIndex(foundTile => foundTile === tile);
    // const deleteTile = <Tile>{ text: '-', cols: 1, rows: 1 };
    //
    // switch (tile.type) {
    //   case TileType.LEFT_FEATURE_HEADER: {
    //     deleteTile.type = TileType.DELETE_FEATURE;
    //     tile.rows--;
    //     this.tiles.splice(index, 0, deleteTile);
    //     break;
    //   }
    //   case TileType.LEFT_OPTION_HEADER: {
    //     deleteTile.type = TileType.DELETE_OPTION;
    //     tile.cols--;
    //     this.tiles.splice(index, 0, deleteTile);
    //     break;
    //   }
    //   case TileType.TOP_FEATURE_HEADER: {
    //     deleteTile.type = TileType.DELETE_FEATURE;
    //     tile.cols--;
    //     this.tiles.splice(index, 0, deleteTile);
    //     break;
    //   }
    //   case TileType.TOP_OPTION_HEADER: {
    //     deleteTile.type = TileType.DELETE_OPTION;
    //     tile.rows--;
    //     this.tiles.splice(index, 0, deleteTile);
    //     break;
    //   }
    // }
  // }
}
