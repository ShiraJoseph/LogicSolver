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
  color: string;
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
  // headerDirection: 'vertical';
  // option1: Option = { name: 'O1' };
  // option2: Option = { name: 'O2' };
  // option3: Option = { name: 'O3' };
  // options: Option[] = [this.option1, this.option2, this.option3];
  // feature1: Feature = { name: 'F1', options: this.options };
  // feature2: Feature = { name: 'F2', options: this.options };
  // feature3: Feature = { name: 'F3', options: this.options };
  // feature4: Feature = { name: 'F4', options: this.options };
  // features: Feature[] = [this.feature1, this.feature2, this.feature3, this.feature4];
  // allOptions: Option[] = [...this.options, ...this.options, ...this.options];

  optionNames = ['option'];
  featureNames = ['feature'];
  cols;
  topFeatures = [];
  topOptions = [];
  leftOptions = [];
  leftFeatures = [];
  allTopOptions = [];
  allLeftOptions = [];
  rows = [];
  blanks = [];
  tiles: Tile[] = [];
  features: Feature[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.features = this.dataService.features;
    this.buildGrid();
  }

  buildGrid() {
    this.cols = this.optionNames.length * this.featureNames.length + 5;
    // this.dataService.features[0].options.forEach(option => {
    //
    // });
    // build fake option tile sets (uses the same option list for each set of options)
    this.optionNames.forEach(option => {
      this.topOptions.push({
        text: option,
        cols: 1,
        rows: 3,
        color: 'lightgray',
        type: TileType.TOP_OPTION_HEADER
      });
      this.leftOptions.push({
        text: option,
        cols: 3,
        rows: 1,
        color: 'lightgray',
        type: TileType.LEFT_OPTION_HEADER
      });
    });
    this.featureNames.forEach(feature => {
      // push a feature to the top feature list
      this.topFeatures.push({
        text: feature,
        cols: this.optionNames.length,
        rows: 1,
        color: 'gray',
        type: TileType.TOP_FEATURE_HEADER
      });
      // push a set of options to the top options
      this.allTopOptions.push(...this.topOptions);
      // push a feature to the left feature list
      this.leftFeatures.push({
        text: feature,
        cols: 1,
        rows: this.optionNames.length,
        color: 'gray',
        type: TileType.LEFT_FEATURE_HEADER,
      });
      // push a set of options to the left options
      this.allLeftOptions.push(...this.leftOptions);
    });
    // push the corner, all the top features, and a plus button
    // push all the top options and a plus button
    this.tiles = [{ text: null, cols: 4, rows: 4, color: 'white', type: TileType.CORNER_BLANK },
      ...this.topFeatures,
      { text: '+', cols: 1, rows: 1, type: TileType.ADD_FEATURE },
      ...this.allTopOptions,
      { text: '+', cols: 1, rows: 3, type: TileType.ADD_OPTION },
    ];

    this.leftFeatures.forEach(feature => {
      let addBlank = true;
      // push a left feature
      this.rows.push(feature);
      this.leftOptions.forEach(option => {
        // push the next left option in the option set
        this.rows.push(option);
        this.allTopOptions.forEach(() => {
          // push a cell, one for each of the top options
          this.rows.push({
            text: '',
            cols: 1,
            rows: 1,
            color: 'white',
            cell: new Cell(),
            type: TileType.CELL_INACTIVE
          });
        });
        // push any blanks needed to the end of the row, to fill the bottom right corner
        if (addBlank) {
          this.rows.push(...this.blanks, { text: null, cols: 1, rows: this.leftOptions.length, type: TileType.RIGHT_BLANK });
          addBlank = false;
        }
      });
      // take away one feature's worth of cells, so we don't have too many cells in the next row
      this.allTopOptions.splice(this.allTopOptions.length - this.topOptions.length, this.topOptions.length);
      // add another blank so the next row will have the right number of blanks
      this.blanks.push({
        text: null,
        cols: this.optionNames.length,
        rows: this.optionNames.length,
        color: 'white',
        type: TileType.FILLER_BLANK
      });
    });
    // add all the cells we just made to the mat-grid-list
    this.tiles.push(...this.rows);
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
