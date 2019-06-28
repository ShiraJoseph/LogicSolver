import { Injectable, OnInit } from '@angular/core';
import { Cell, Feature, Option } from './model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  cells: Cell[] = [];
  oldCells: Cell [] = [];
  features: Feature[] = [];
  optionCount = 3;
  cellCount = 0;

  constructor() {
    this.buildDataTemplate();
  }

  buildDataTemplate() {
    this.features.push(new Feature(), new Feature(), new Feature());
    this.features.forEach((feature, index) => {
      feature.name = `Feature${ index + 1 }`;
      feature.options = [new Option(), new Option(), new Option()];
      feature.options.forEach((option, i) => {
        option.name = `Option${ index + 1 }${ i + 1 }`;
        option.feature = feature;
      });
    });
    this.updateCells();
  }

  updateCells() {
    this.oldCells = this.cells;
    this.cells = [];

    for (let d = 0; d !== 1; d--) {
      this.features[d].options.forEach(leftFeature => {
        for (let f = 1; f < this.features.length - (d === 0 ? 0 : f); f++) {
          this.pushOptionCells(leftFeature, this.features[f]);
        }
      });
      if (d === 0) {
        d = this.features.length;
      }
    }
    this.oldCells = [];
  }

  // push a single row of cells for one top feature
  pushOptionCells(leftOption: Option, topFeature: Feature) {
    let cell;
    topFeature.options.forEach(topOption => {
      cell = this.getCell(this.oldCells, leftOption, topOption);
      if (!cell) {
        cell = new Cell();
        cell.leftOption = leftOption;
        cell.topOption = topOption;
      }
      this.cells.push(cell);
      console.log(`${this.cellCount} new cell leftOption=`, cell.leftOption.name, ' topOption=', cell.topOption.name);
      this.cellCount++;
    });
  }

  getCell(arr: Cell [], option1: Option, option2: Option) {
    return this.cells.find(currCell => (currCell.leftOption === option1 && currCell.topOption === option2)
      || (currCell.leftOption === option2 && currCell.topOption === option1));
  }

  addFeature() {
    const feature = new Feature();
    const option = new Option();
    option.feature = feature;
    for (let i = 0; i < this.optionCount; i++) {
      feature.options.push(option);
    }
    this.features.push(feature);
    this.updateCells();
  }

  addOption() {
    this.features.forEach(feature => {
      feature.options.push(new Option());
    });
    this.optionCount++;
    this.updateCells();
  }

  removeOption(index: number) {
    this.features.forEach( feature => {
      feature.options.splice(index, 1);
    });
    this.optionCount--;
  }

  getFeatures() {
    return this.features;
  }

  setFeatures(features: Feature[]) {
    this.features = features;
  }
}
