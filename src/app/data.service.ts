import { Injectable, OnInit } from '@angular/core';
import { Cell, Feature, Option } from './model';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {
  cells: Cell[] = [];
  features: Feature[];
  optionCount = 3;

  ngOnInit() {
    this.buildDataTemplate();
  }

  buildDataTemplate() {
    this.features.push(new Feature(), new Feature(), new Feature());
    this.features.forEach((feature) => {
      feature.name = 'Feature';
      feature.options.push(new Option(), new Option(), new Option());
      feature.options.forEach((option) => {
        option.name = 'Option';
        option.feature = feature;
      });
    });
    this.updateCells();
  }

  // link(option: Option, feature: Feature) {
  //   option.feature = feature;
  //   feature.options.push(option);
  // };

  updateCells() {
    // first row
    this.features[0].options.forEach(leftFeature => {
      for (let f = 1; f < this.features.length; f++) {
        this.pushOptionCells(leftFeature, this.features[f]);
      }
    });

    // remaining rows
    for (let d = this.features.length - 1; d > 1; d--) {
      this.features[d].options.forEach(leftFeature => {
        for (let f = 1; f < this.features.length - f; f++) {
          this.pushOptionCells(leftFeature, this.features[f]);
        }
      });
    }
  }

  // push a single row of cells for one top feature
  pushOptionCells(leftOption: Option, topFeature: Feature) {
    topFeature.options.forEach(topOption => {
      if (!this.cellExists(leftOption, topOption)) {
        const cell = new Cell();
        cell.leftOption = leftOption;
        cell.topOption = topOption;
        this.cells.push(cell);
      }
    });
  }

  cellExists(option1: Option, option2: Option) {
    return this.cells.find(currCell => (currCell.leftOption === option1 && currCell.topOption === option2)
      || (currCell.leftOption === option2 && currCell.topOption === option1));
  }

  addFeature() {
    const feature = new Feature();
    if (name) {
      feature.name = name;
    }
    const option = new Option();
    option.feature = feature;
    option.name = '';
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
