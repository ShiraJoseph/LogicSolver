import { Component, OnInit } from '@angular/core';
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
  isCell?: boolean;
  isHeader?: boolean;
  isVertical?: boolean;
  active?: boolean;
  cell?: Cell;
  type?: TileType;
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

  optionNames = ['O1', 'O2'];
  featureNames = ['F1', 'F2', 'F3', 'F4'];
  cols;
  verticalFeatures = [];
  verticalOptions = [];
  horizontalOptions = [];
  horizontalFeatures = [];
  allVerticalOptions = [];
  allHorizontalOptions = [];
  rows = [];
  blanks = [];
  tiles: Tile[] = [];

  ngOnInit() {
    this.cols = this.optionNames.length * this.featureNames.length + 5;
    this.optionNames.forEach(option => {
      this.verticalOptions.push({
        text: option,
        cols: 1,
        rows: 3,
        color: 'lightgray',
        isHeader: true,
        isVertical: true,
        type: TileType.TOP_OPTION_HEADER
      });
      this.horizontalOptions.push({
        text: option,
        cols: 3,
        rows: 1,
        color: 'lightgray',
        isHeader: true,
        type: TileType.LEFT_OPTION_HEADER
      });
    });
    this.featureNames.forEach(feature => {
      this.verticalFeatures.push({
        text: feature,
        cols: this.optionNames.length,
        rows: 1,
        color: 'gray',
        isHeader: true,
        type: TileType.TOP_FEATURE_HEADER
      });
      this.allVerticalOptions.push(...this.verticalOptions);
      this.horizontalFeatures.push({
        text: feature,
        cols: 1,
        rows: this.optionNames.length,
        color: 'gray',
        type: TileType.LEFT_FEATURE_HEADER,
        isHeader: true,
        isVertical: true
      });
      this.allHorizontalOptions.push(...this.horizontalOptions);
    });

    this.tiles = [{ text: null, cols: 4, rows: 4, color: 'white', type: TileType.CORNER_BLANK },
      ...this.verticalFeatures,
      { text: '+', cols: 1, rows: 1, type: TileType.ADD_FEATURE },
      ...this.allVerticalOptions,
      { text: '+', cols: 1, rows: 3, type: TileType.ADD_OPTION },
    ];

    this.horizontalFeatures.forEach(feature => {
      let addBlank = true;
      this.rows.push(feature);
      this.horizontalOptions.forEach(option => {
        this.rows.push(option);
        this.allVerticalOptions.forEach(() => {
          this.rows.push({
            text: '',
            cols: 1,
            rows: 1,
            color: 'white',
            isCell: true,
            active: false,
            cell: new Cell(),
            type: TileType.CELL_INACTIVE
          });
        });
        if (addBlank) {
          this.rows.push(...this.blanks, { text: null, cols: 1, rows: this.horizontalOptions.length, type: TileType.RIGHT_BLANK });
          addBlank = false;
        }
      });
      this.allVerticalOptions.splice(this.allVerticalOptions.length - this.verticalOptions.length, this.verticalOptions.length);
      this.blanks.push({
        text: null,
        cols: this.optionNames.length,
        rows: this.optionNames.length,
        color: 'white',
        type: TileType.FILLER_BLANK
      });
    });

    this.tiles.push(...this.rows);
  }

  switchOut(newTile: Tile) {
    this.tiles.forEach((tile) => {
      if (tile.type === TileType.CELL_ACTIVE) {
        tile.type = TileType.CELL_INACTIVE;
      }
    });
    newTile.type = TileType.CELL_ACTIVE;
  }

  getCellIndex(verticalOption: Option, horizontalOption: Option): number {
    return this.tiles.findIndex(tile => tile.cell
      && tile.cell.horizontalOption && tile.cell.horizontalOption === horizontalOption
      && tile.cell.verticalOption && tile.cell.verticalOption === verticalOption
    )[0];
  }

  setCellValue(verticalOption: Option, horizontalOption: Option, value: string) {
    const index = this.getCellIndex(verticalOption, horizontalOption);
    if (this.tiles[index]) {
      this.tiles[index].cell.value = value;
    }

  }
}
