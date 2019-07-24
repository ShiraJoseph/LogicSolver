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
  object?: Cell | Feature | Option;
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

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.buildGrid();
  }

  buildGrid() {
    this.cols = this.dataService.optionCount * (this.dataService.features.length - 1) + 5;
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
            object: option,
            objectId: option.id
          });
        });
      }
      if (index !== 1) {
        this.leftFeatureTiles.push({
          text: feature.name,
          cols: 1,
          rows: this.dataService.optionCount,
          color: 'gray',
          type: TileType.LEFT_FEATURE_HEADER,
          object: feature,
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
    let rowCellCount = (this.dataService.features.length - 1) * this.dataService.optionCount;
    const blanks = [];
    this.leftFeatureTiles.forEach(featureTile => {
      let addBlank = true;
      // push a left feature
      this.tiles.push(featureTile);
      this.dataService.getFeatureOptions(featureTile.objectId)
      // featureTile.object.options
        .forEach(option => {
        // push a left option
        this.tiles.push({
          text: option.name,
          cols: 3,
          rows: 1,
          color: 'lightgray',
          type: TileType.LEFT_OPTION_HEADER,
          object: option,
          objectId: option.id,
        });
        for (let cell = 0; cell < rowCellCount && cellIndex < this.dataService.cells.length; cell++) {
          // push a cell
          this.tiles.push({
            text: '',
            cols: 1,
            rows: 1,
            color: 'white',
            object: this.dataService.cells[cellIndex],
            type: TileType.CELL_INACTIVE,
            objectId: this.dataService.cells[cellIndex].id,
          });
          cellIndex++;
        }
        // push any blanks needed to the end of the row, to fill the bottom right corner
        if (addBlank) {
          this.tiles.push(
            ...blanks,
            { text: null, cols: 1, rows: this.dataService.optionCount, type: TileType.RIGHT_BLANK }
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

  pushCell(option1?: Option, option2?: Option, text?: string,) {

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
    (<Cell>tile.object).value = text;
    tile.type = TileType.CELL_INACTIVE;
  }

  addFeature() {
    this.dataService.addFeature();
    this.buildGrid();
  }

  deleteFeature(tile: Tile) {
    this.dataService.deleteFeature(tile.objectId);
    this.buildGrid();
  }

  deleteOption(tile: Tile) {
    this.dataService.deleteOption(tile.objectId);
    this.buildGrid();
  }

  addOption() {
    this.dataService.addOption();
    this.buildGrid();
  }

  updateOption(tile: Tile, text: string) {
    this.dataService.setOption(tile.object.id, text);
    this.buildGrid();
  }

  updateFeature(tile: Tile, text: string) {
    this.dataService.setFeature(tile.object.id, text);
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
