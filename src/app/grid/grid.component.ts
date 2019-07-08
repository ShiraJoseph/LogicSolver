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
  cell?: Cell;
  type?: TileType;
  object?: {};
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
  cols;
  topFeatureTiles = [];
  topOptionTiles = [];
  leftOptionTiles = [];
  leftFeatureTiles = [];
  allTopOptions = [];
  rows = [];
  blanks = [];
  tiles: Tile[] = [];
  features: Feature[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.features = this.dataService.features;
   // this.buildGrid();
  }

  buildHeaderTiles() {
    this.dataService.features.forEach((feature, index) => {
      if (index > 0) {
        this.topFeatureTiles.push({
          text: feature.name,
          cols: this.dataService.optionCount,
          rows: 1,
          color: 'gray',
          type: TileType.TOP_FEATURE_HEADER
        });
        feature.options.forEach(option => {
          this.topOptionTiles.push({
            text: option.name,
            cols: 1,
            rows: 3,
            color: 'lightgray',
            type: TileType.TOP_OPTION_HEADER
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
        });
        feature.options.forEach(option => {
          this.leftOptionTiles.push({
            text: option.name,
            cols: 3,
            rows: 1,
            color: 'lightgray',
            type: TileType.LEFT_OPTION_HEADER
          });
        });
      }
    });
  }

  buildGrid() {
    this.cols = this.dataService.optionCount * (this.dataService.features.length - 1) + 5;
    this.buildHeaderTiles();

    // push the corner, all the top features, and a plus button then
    // push all the top options and a plus button
    this.tiles = [{ text: null, cols: 4, rows: 4, color: 'white', type: TileType.CORNER_BLANK },
      ...this.topFeatureTiles,
      { text: '+', cols: 1, rows: 1, type: TileType.ADD_FEATURE },
      ...this.topOptionTiles,
      { text: '+', cols: 1, rows: 3, type: TileType.ADD_OPTION },
    ];

    // TODO: error is happening somewhere in this set of code.
    let cellIndex = 0;
    let rowCellCount = this.dataService.cells.length;
    this.allTopOptions = this.topOptionTiles;
    this.leftFeatureTiles.forEach(feature => {
      let addBlank = true;
      // push a left feature
      this.tiles.push(feature);
      this.leftOptionTiles.forEach(option => {
        // push the next left option in the option set
        this.tiles.push(option);
        for(let i=0; i< this.allTopOptions.length; i++){
          // push a cell, one for each of the top options
          console.log('cellIndex =', cellIndex);
          console.log(this.dataService.cells[cellIndex]);
          this.tiles.push({
            text: this.dataService.cells[cellIndex].value,
            cols: 1,
            rows: 1,
            color: 'white',
            cell: this.dataService.cells[cellIndex],
            type: TileType.CELL_INACTIVE
          });
          cellIndex++;
        };
        // push any blanks needed to the end of the row, to fill the bottom right corner
        if (addBlank) {
          this.tiles.push(...this.blanks,
          { text: null, cols: 1, rows: this.dataService.optionCount, type: TileType.RIGHT_BLANK });
          addBlank = false;
        }
      });
      // take away one feature's worth of cells, so we don't have too many cells in the next row
      rowCellCount-=this.dataService.optionCount;
      this.allTopOptions.splice(this.allTopOptions.length - this.dataService.optionCount, this.allTopOptions.length);
      // add another blank so the next row will have the right number of blanks
      this.blanks.push({
        text: null,
        cols: this.dataService.optionCount,
        rows: this.dataService.optionCount,
        color: 'white',
        type: TileType.FILLER_BLANK
      });
    });
    // add all the cells we just made to the mat-grid-list
    // this.tiles.push(...this.rows);
    console.log('tiles: ', this.tiles);
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

  getTileIndex(verticalOption: Option, horizontalOption: Option): number {
    return this.tiles.findIndex(tile => tile.cell
      && tile.cell.leftOption && tile.cell.leftOption === horizontalOption
      && tile.cell.topOption && tile.cell.topOption === verticalOption
    )[0];
  }

  setCellValue(verticalOption: Option, horizontalOption: Option, value: string) {
    const index = this.getTileIndex(verticalOption, horizontalOption);
    if (this.tiles[index]) {
      this.tiles[index].cell.value = value;
    }
  }

  updateTile(tile: Tile, text: string) {
    tile.text = text;
    tile.type = TileType.CELL_INACTIVE;
  }
}
