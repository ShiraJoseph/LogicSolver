import { Component, OnInit } from '@angular/core';
import { Feature, Option } from '../model';


export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
  isCell?: boolean;
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
    this.cols = this.optionNames.length * this.featureNames.length + 4;
    this.optionNames.forEach(option => {
      this.verticalOptions.push({ text: option, cols: 1, rows: 3, color: 'lightgray' });
      this.horizontalOptions.push({ text: option, cols: 3, rows: 1, color: 'lightgray' });
    });
    this.featureNames.forEach(feature => {
      this.verticalFeatures.push({ text: feature, cols: this.optionNames.length, rows: 1, color: 'gray' });
      this.allVerticalOptions.push(...this.verticalOptions);
      this.horizontalFeatures.push({ text: feature, cols: 1, rows: this.optionNames.length, color: 'gray' });
      this.allHorizontalOptions.push(...this.horizontalOptions);
    });
    this.tiles = [{ text: null, cols: 4, rows: 4, color: 'white' },
      ...this.verticalFeatures,
      ...this.allVerticalOptions
    ];
    this.horizontalFeatures.forEach(feature => {
      let addBlank = true;
      this.rows.push(feature);
      this.horizontalOptions.forEach(option => {

        this.rows.push(option);
        this.allVerticalOptions.forEach(() => {
          this.rows.push({ text: '', cols: 1, rows: 1, color: 'white', isCell: true });
        });
        if (addBlank) {
          this.rows.push(...this.blanks);
          addBlank = false;
        }
      });
      this.allVerticalOptions.splice(this.allVerticalOptions.length - this.verticalOptions.length, this.verticalOptions.length);
      this.blanks.push({ text: null, cols: this.optionNames.length, rows: this.optionNames.length, color: 'black' });
    });

    this.tiles.push(...this.rows);

  }
}
