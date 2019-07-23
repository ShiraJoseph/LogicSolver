import { Injectable, OnInit } from '@angular/core';
import { Cell, Feature, Option } from './model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  cells: Cell[] = [];
  oldCells: Cell [] = [];
  features: Feature[] = [];
  options: Option[] = [];
  optionCount = 3;
  cellCount = 0;

  constructor() {
    this.buildDataTemplate();
  }

  buildDataTemplate() {
    const f1 = new Feature();
    const f2 = new Feature();
    const f3 = new Feature();
    this.features.push(f1, f2, f3);
    this.features.forEach((feature, index) => {
      feature.name = `Feature${ index + 1 }`;
      const o1 = new Feature();
      const o2 = new Feature();
      const o3 = new Feature();
      this.options.push(o1, o2, o3);
      feature.optionsIds = [o1.id, o2.id, o3.id];
      this.options.forEach((option, i) => {
        option.name = `Option${ index + 1 }${ i + 1 }`;
        option.featureId = feature.id;
      });
    });
    this.updateCells();
  }

  updateCells() {
    this.oldCells = this.cells;
    this.cells = [];

    for (let d = 0; d !== 1; d--) {
      this.features[d].optionsIds.forEach(leftFeatureId => {
        for (let f = 1; f < this.features.length - (d === 0 ? 0 : f); f++) {
          this.pushOptionCells(leftFeatureId, this.features[f].id);
        }
      });
      if (d === 0) {
        d = this.features.length;
      }
    }
    this.oldCells = [];
  }

  // push a single row of cells for one top feature
  pushOptionCells(leftOptionId: number, topFeatureId: number) {
    let cell;
    this.features.find(feature => feature.id === topFeatureId)
      .optionsIds.forEach(topOptionId => {
      cell = this.getCell(this.oldCells, leftOptionId, topOptionId);
      if (!cell) {
        cell = new Cell();
        cell.leftOptionId = leftOptionId;
        cell.topOptionId = topOptionId;
        // cell.value = this.cells.length;
      }
      this.cells.push(cell);
      this.cellCount++;
      console.log('cell count: ', this.cellCount);
    });
  }

  getCell(arr: Cell [], option1Id: number, option2Id: number) {
    return arr.find(currCell => (currCell.leftOptionId === option1Id && currCell.topOptionId === option2Id)
      || (currCell.leftOptionId === option2Id && currCell.topOptionId === option1Id));
  }

  addFeature() {
    const feature = new Feature();
    feature.name = 'new feature';
    feature.optionsIds = [];
    for (let i = 0; i < this.optionCount; i++) {
      const option = new Option();
      option.name = 'new option';
      option.featureId = feature.id;
      feature.optionsIds.push(option.id);
      this.options.push(option);
    }
    this.features.push(feature);
    this.updateCells();
  }

  addOption() {
    this.features.forEach(feature => {
      const option = new Option();
      option.name = 'new option';
      option.featureId = feature.id;
      feature.optionsIds.push(option.id);
    });
    console.log('features=', this.features);
    this.optionCount++;
    this.updateCells();
  }

  deleteOption(index: number) {
    this.features.forEach( feature => {
      const id = feature.optionsIds[index];
      this.cells = this.cells.filter(cell => cell.leftOptionId !== id && cell.topOptionId !== id);
      this.options = this.options.filter(option => option.id !== id);
      feature.optionsIds.splice(index, 1);
    });
    this.optionCount--;
  }

  deleteFeature(id: number) {
    const featureToRemove = this.features.find(feature => feature.id === id);
    const optionsToRemove = featureToRemove.optionsIds;
    this.cells = this.cells.filter(cell => !optionsToRemove.includes(cell.leftOptionId) && !optionsToRemove.includes(cell.topOptionId));
    this.options = this.options.filter(option => !optionsToRemove.includes(option.id));
    this.features = this.features.filter(feature => feature.id !== id);
  }

  setOption(id: number, name: string) {
    this.options.find(option => option.id === id).name = name;
  }

  setFeature(id: number, name: string) {
    this.features.find(feature => feature.id === id).name = name;

  }

  getFeatureOptions(id: number) {
    return this.options.filter(option => option.featureId === id);
  }

  getOptionCells(id: number) {
    return this.cells.filter(cell => cell.topOptionId === id || cell.leftOptionId === id);
  }

}
