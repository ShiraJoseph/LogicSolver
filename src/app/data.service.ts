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
      feature.name = `Feature${ index }`;
      feature.optionsIds = [];
      const o1 = new Option();
      const o2 = new Option();
      const o3 = new Option();
      o1.name = `${ feature.name }blue`;
      o1.featureId = feature.id;
      o2.name = `${ feature.name }yellow`;
      o2.featureId = feature.id;
      o3.name = `${ feature.name }green`;
      o3.featureId = feature.id;
      // `Option${ index + 1 }${ i + 1 }`
      this.options.push(o1, o2, o3);
      feature.optionsIds.push(o1.id, o2.id, o3.id);
      // this.setFeature(feature.id, `Feature${ index + 1 }`, [o1.id, o2.id, o3.id]);
      // feature.optionsIds.forEach((id, i) => {
      //   this.setOption(id, `Option${ index }${ i }`, feature.id);
      // });

    });
    this.updateCells();
  }

  updateCells() {
    this.oldCells = this.cells;
    this.cells = [];
    this.cellCount = 0;
    // for each left option in left feature0
    this.features[0].optionsIds.forEach(leftOptionID => {
      // for each feature greater than left feature, as top feature
      for (let topFeatureIx = 1; topFeatureIx < this.features.length; topFeatureIx++) {
        // for each top option in top feature
        this.features[topFeatureIx].optionsIds.forEach(topOptionID => {
          // create/push a cell with those two options
          let cell = this.getCellFromOptions(this.oldCells, leftOptionID, topOptionID);
          if (!cell) {
            cell = new Cell();
            cell.leftOptionId = leftOptionID;
            cell.topOptionId = topOptionID;
            cell.value = `${ this.cells.length }`;
            console.log('New Cell! id = ', cell.id.toFixed(3), '; value = ', cell.value);
          } else {
            console.log('old cell, id = ', cell.id.toFixed(3), '; value = ', cell.value);
          }
          this.cells.push(cell);
          cell = null;
          this.cellCount++;

        });
      }
    });
    console.log('')

    // then start with the last feature going backwards until feature 2, as left feature
    for (let leftFeatureI = this.features.length - 1; leftFeatureI > 1; leftFeatureI--) {
      // for each option in left feature
      this.features[leftFeatureI].optionsIds.forEach(leftOptionId => {
        // for each feature after 1 until left feature exclusive, as top feature
        for (let topFeatureI = 1; topFeatureI < leftFeatureI; topFeatureI++) {
          // for each option in top feature
          this.features[topFeatureI].optionsIds.forEach(topOptionId => {
            // create/push a cell with those two options
            let cell = this.getCellFromOptions(this.oldCells, leftOptionId, topOptionId);
            if (!cell) {
              cell = new Cell();
              cell.leftOptionId = leftOptionId;
              cell.topOptionId = topOptionId;
              cell.value = `${ this.cells.length }`;
              console.log('New Cell! id = ', cell.id.toFixed(3), '; value = ', cell.value);
            } else {
              console.log('old cell, id = ', cell.id.toFixed(3), '; value = ', cell.value);
            }
            this.cells.push(cell);
            this.cellCount++;
          });
        }
      });
    }

    // this.features[0].optionsIds.forEach(leftOptionId => {
    //   // console.log('leftOption = ', leftOptionId.toFixed(3), ' ... ', this.getOption(leftOptionId).name);
    //   // for (let f2 = 1; f2 < this.features.length - (f1 === 0 ? 1 : f2); f2++) {
    //   //   console.log('feature 2 = ', this.features[1]);
    //   console.log('top feature = ', this.features[1].name);
    //   this.pushOptionCells(leftOptionId, this.features[1].id);
    //   // }
    // });
    // // this.features[0].optionsIds
    // for (let f1 = this.features.length - 1; f1 > 1; f1--) {
    //   console.log('left feature = ', this.features[f1].name);
    //   this.features[f1].optionsIds.forEach(leftOptionId => {
    //     // console.log('leftOption = ', leftOptionId.toFixed(3), ' ... ', this.getOption(leftOptionId).name);
    //     for (let f2 = 1; f2 < this.features.length - (f1 === 0 ? 1 : f2); f2++) {
    //       console.log('top feature ', this.features[f2]);
    //       this.pushOptionCells(leftOptionId, this.features[f2].id);
    //     }
    //   });
    //   if (f1 === 0) {
    //     f1 = this.features.length;
    //   }
    // }
    this.oldCells = [];
  }

  // // push a single row of cells for one top feature
  // pushOptionCells(leftOptionId: number, topFeatureId: number) {
  //   let cell;
  //   console.log('leftOption = ', this.getOption(leftOptionId).name);
  //   this.getFeature(topFeatureId).optionsIds.forEach(topOptionId => {
  //     console.log('topOption = ', this.getOption(topOptionId).name);
  //     // this.features.find(feature => feature.id === topFeatureId)
  //     //   .optionsIds.forEach(topOptionId => {
  //     cell = this.getCellFromOptions(this.oldCells, leftOptionId, topOptionId);
  //     if (!cell) {
  //       cell = new Cell();
  //       cell.leftOptionId = leftOptionId;
  //       cell.topOptionId = topOptionId;
  //       cell.value = this.cells.length;
  //       console.log('New Cell!');
  //     } else {
  //       // , ' ... ', this.getOption(topOptionId).name);
  //       console.log('old cell, id = ', cell.id.toFixed(3), '; value = ', cell.value);
  //     }
  //     //
  //     this.cells.push(cell);
  //     this.cellCount++;
  //     console.log('cell count: ', this.cellCount);
  //   });
  // }

  getCellFromOptions(arr: Cell[], option1Id: number, option2Id: number) {
    return arr.find(currCell => (currCell.leftOptionId === option1Id && currCell.topOptionId === option2Id)
      || (currCell.leftOptionId === option2Id && currCell.topOptionId === option1Id));
  }

  addFeature() {
    const feature = new Feature();
    feature.name = 'new feature';
    feature.optionsIds = [];
    for (let i = 0; i < this.optionCount; i++) {
      const option = new Option();
      option.name = `new option${ i }`;
      option.featureId = feature.id;
      feature.optionsIds.push(option.id);
      this.options.push(option);
    }
    this.features.push(feature);
    console.log('Add feature. this.features=', this.features, ' this.options=', this.options);
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

  setCell(id: number, value ?: string, topOptionId ?: number, leftOptionId ?: number) {
    if (this.getCell(id)) {
      if (value) {
        this.cells.find(cell => cell.id === id).value = value;
      }
      if (topOptionId) {
        this.cells.find(cell => cell.id === id).topOptionId = topOptionId;
      }
      if (leftOptionId) {
        this.cells.find(cell => cell.id === id).leftOptionId = leftOptionId;
      }
    }
  }

  setOption(id: number, name ?: string, featureId ?: number) {
    if (this.getOption(id)) {
      if (name) {
        this.options.find(option => option.id === id).name = name;
      }
      if (featureId) {
        this.options.find(option => option.id === id).featureId = featureId;
      }
    }
  }

  setFeature(id: number, name ?: string, optionsIds ?: number[]) {
    if (this.getFeature(id)) {
      if (name) {
        this.features.find(feature => feature.id === id).name = name;
      }
      if (optionsIds) {
        this.features.find(feature => feature.id === id).optionsIds = optionsIds;
      }
    }
  }

  getCell(id) {
    return this.cells.find(cell => cell.id === id);
  }

  getOption(id) {
    return this.options.find(option => option.id === id);
  }

  getFeature(id) {
    return this.features.find(feature => feature.id = id);
  }

  getFeatureOptions(featureId: number) {
    return this.options.filter(option => option.featureId === featureId);
  }

  getOptionCells(optionId: number) {
    return this.cells.filter(cell => cell.topOptionId === optionId || cell.leftOptionId === optionId);
  }

}
