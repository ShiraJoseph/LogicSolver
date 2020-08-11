import {Injectable} from '@angular/core';
import {Cell, Feature, Option, State} from './model';

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
  states: State[] = [];
  sp = 0;

  getAllowDeleteFeatures(): boolean {
    return this.features.length > 2;
  }

  getAllowDeleteOptions(): boolean {
    return this.optionCount > 1;
  }

  constructor() {
    this.buildDataTemplate();
  }

  buildDataTemplate() {
    const f1 = new Feature();
    const f2 = new Feature();
    const f3 = new Feature();
    const f4 = new Feature();
    this.features.push(f1, f2, f3, f4);
    this.features.forEach((feature) => {
      feature.optionsIds = [];
      const o1 = new Option();
      const o2 = new Option();
      const o3 = new Option();
      o1.featureId = feature.id;
      o2.featureId = feature.id;
      o3.featureId = feature.id;
      this.options.push(o1, o2, o3);
      feature.optionsIds.push(o1.id, o2.id, o3.id);
    });
    this.features[0].name = 'First Name';
    this.features[1].name = 'Last Name';
    this.features[2].name = 'Color';
    this.features[3].name = 'Vehicle';
    this.options[0].name = 'Bob';
    this.options[1].name = 'Missy';
    this.options[2].name = 'Jo';
    this.options[3].name = 'Smith';
    this.options[4].name = 'Johnson';
    this.options[5].name = 'Joseph';
    this.options[6].name = 'red';
    this.options[7].name = 'green';
    this.options[8].name = 'blue';
    this.options[9].name = 'car';
    this.options[10].name = 'boat';
    this.options[11].name = 'plane';
    this.updateCells();
  }

  saveState() {
    this.states[this.sp] = new State(this.cells, this.options, this.features);
    this.sp++;
  }

  loadState(i) {
    this.features = this.states[i].features;
    this.options = this.states[i].options;
    this.cells = this.states[i].cells;
  }

  updateCells() {
    this.oldCells = this.cells;
    this.cells = [];
    this.cellCount = 0;
    // for each left leftOptionId in left feature0
    this.features[0].optionsIds.forEach(leftOptionID => {
      // for each feature greater than left feature, as top feature
      for (let topFeatureIx = 1; topFeatureIx < this.features.length; topFeatureIx++) {
        // for each top leftOptionId in top feature
        this.features[topFeatureIx].optionsIds.forEach(topOptionID => {
          // create/push a cell with those two options
          let cell = this.getCellFromOptions(this.oldCells, leftOptionID, topOptionID);
          if (!cell) {
            cell = new Cell();
            cell.leftOptionId = leftOptionID;
            cell.topOptionId = topOptionID;
          }
          this.cells.push(cell);
          cell = null;
          this.cellCount++;
        });
      }
    });

    // then start with the last feature going backwards until feature 2, as left feature
    for (let leftFeatureI = this.features.length - 1; leftFeatureI > 1; leftFeatureI--) {
      // for each leftOptionId in left feature
      this.features[leftFeatureI].optionsIds.forEach(leftOptionId => {
        // for each feature after 1 until left feature exclusive, as top feature
        for (let topFeatureI = 1; topFeatureI < leftFeatureI; topFeatureI++) {
          // for each leftOptionId in top feature
          this.features[topFeatureI].optionsIds.forEach(topOptionId => {
            // create/push a cell with those two options
            let cell = this.getCellFromOptions(this.oldCells, leftOptionId, topOptionId);
            if (!cell) {
              cell = new Cell();
              cell.leftOptionId = leftOptionId;
              cell.topOptionId = topOptionId;
            }
            this.cells.push(cell);
            this.cellCount++;
          });
        }
      });
    }
    this.oldCells = [];
  }

  clearCells() {
    this.cells.forEach(cell => cell.value = '');
    this.updateCells();
  }

  getCellFromOptions(arr: Cell[], option1Id: number, option2Id: number): Cell {
    return arr.find(currCell => (currCell.leftOptionId === option1Id && currCell.topOptionId === option2Id)
      || (currCell.leftOptionId === option2Id && currCell.topOptionId === option1Id));
  }

  addFeature() {
    const feature = new Feature();
    feature.name = '';
    feature.optionsIds = [];
    for (let i = 0; i < this.optionCount; i++) {
      const option = new Option();
      option.name = '';
      option.featureId = feature.id;
      feature.optionsIds.push(option.id);
      this.options.push(option);
    }
    this.features.push(feature);
    this.updateCells();
  }

  addOption() {
    this.optionCount++;
    this.features.forEach(feature => {
      const option = new Option();
      option.name = '';
      option.featureId = feature.id;
      feature.optionsIds.push(option.id);
      this.options.push(option);
    });

    this.updateCells();
  }

  deleteOption(id: number) {
    const indexToRemove = this.getFeature(this.getOption(id).featureId).optionsIds.findIndex(optionId => optionId === id);
    this.features.forEach(feature => {
      const nextId = feature.optionsIds[indexToRemove];
      this.cells = this.cells.filter(cell => cell.leftOptionId !== nextId && cell.topOptionId !== nextId);
      this.options = this.options.filter(option => option.id !== nextId);
      feature.optionsIds.splice(indexToRemove, 1);
    });
    this.optionCount--;
    this.states.push(new State(this.cells, this.options, this.features));
  }

  deleteFeature(id: number) {
    const featureToRemove = this.features.find(feature => feature.id === id);
    const optionsToRemove = featureToRemove.optionsIds;
    this.cells = this.cells.filter(cell => !optionsToRemove.includes(cell.leftOptionId) && !optionsToRemove.includes(cell.topOptionId));
    this.options = this.options.filter(option => !optionsToRemove.includes(option.id));
    this.features = this.features.filter(feature => feature.id !== id);
    this.states.push(new State(this.cells, this.options, this.features));
  }

  setCell(id: number, value ?: string, topOptionId ?: number, leftOptionId ?: number, withLogic = true) {
    if (!!this.getCell(id)) {
      if (value !== this.getCell(id).value) {
        this.cells.find(cell => cell.id === id).value = value;
        if (value === 'O') {
          const crossCells = this.getCrossCellIds(id);
          crossCells.forEach(cellId => {
            this.setCell(cellId, 'X');
          });
        }
        if (withLogic) {
          this.runBasicRowLogic();
          this.runBasicColumnLogic();
          this.fillDeductions();
        }
      }
      if (topOptionId) {
        this.cells.find(cell => cell.id === id).topOptionId = topOptionId;
      }
      if (leftOptionId) {
        this.cells.find(cell => cell.id === id).leftOptionId = leftOptionId;
      }
      this.states.push(new State(this.cells, this.options, this.features));
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
      this.updateCells();
    }
  }

  getCell(id): Cell {
    return this.cells.find(cell => cell.id === id);
  }

  getOption(id): Option {
    return this.options.find(option => option.id === id);
  }

  getFeature(id): Feature {
    return this.features.find(feature => feature.id === id);
  }

  getFeatureOptions(featureId: number): Option[] {
    return this.options.filter(option => option.featureId === featureId);
  }

  getCrossCellIds(cellId: number): number [] {
    const leftOptionId = this.getCell(cellId).leftOptionId;
    const leftFeatureId = this.getOption(leftOptionId).featureId;
    const topOptionId = this.getCell(cellId).topOptionId;
    const topFeatureId = this.getOption(topOptionId).featureId;
    const crossCellIds = [];
    this.cells.forEach(cell => {
        if ((cell.id !== cellId) &&
          ((cell.topOptionId === topOptionId && this.getOption(cell.leftOptionId).featureId === leftFeatureId) ||
            (cell.leftOptionId === leftOptionId && this.getOption(cell.topOptionId).featureId === topFeatureId))) {
          crossCellIds.push(cell.id);
        }
      }
    );
    return crossCellIds;
  }

  // one row at a time, make sure that any parallel Os have the same values in each of their columns
  runBasicRowLogic() {
    const changedCellIds: number[] = [];
    this.options.forEach((leftOption) => {
      if (!changedCellIds.find(cellId => this.getCell(cellId).leftOptionId === leftOption.id)) {
        // Find the 'O's in the next row
        const rowOfOs: Cell [] = this.cells.filter(cell => cell.leftOptionId === leftOption.id && cell.value === 'O');
        const rowOfXs: Cell [] = this.cells.filter(cell => cell.leftOptionId === leftOption.id && cell.value === 'X');
        const masterColumn: { leftOptionId: number, value: string }[] = [];
        rowOfXs.forEach(rowX => masterColumn.push({leftOptionId: rowX.topOptionId, value: rowX.value}));
        if (rowOfOs.length > 0) {
          // for each 'O', collect all the cells in that column
          rowOfOs.forEach(match => {
            const columnCells: Cell [] = this.cells.filter(compare => compare.topOptionId === match.topOptionId);
            columnCells.forEach(colCell => {
              // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
              if (colCell.value && !masterColumn.find(record => record.leftOptionId === colCell.leftOptionId)) {
                const record: { leftOptionId: number, value: string } = {leftOptionId: colCell.leftOptionId, value: colCell.value};
                masterColumn.push(record);
              }
            });
          });

          masterColumn.forEach(record => {
            if (record.value === 'O') {
              const cCells = this.cells.filter(cell => cell.topOptionId === record.leftOptionId);
              if (cCells.length > 0) {
                rowOfOs.push(cCells[0]);
                cCells.forEach(colCell => {
                  // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
                  if (colCell.value && !masterColumn.find(recordLine => recordLine.leftOptionId === colCell.leftOptionId)) {
                    const recordToPush: { leftOptionId: number, value: string } = {
                      leftOptionId: colCell.leftOptionId,
                      value: colCell.value
                    };
                    masterColumn.push(recordToPush);
                  }
                });
              }
            }
          });

          // Go through each of the 'O's in the current row again
          rowOfOs.forEach(OinTheRow => {
            // apply the master column data to each of the 'O''s columns
            masterColumn.forEach(record => {
              const fill = this.getCellFromOptions(this.cells, OinTheRow.topOptionId, record.leftOptionId);
              if (fill && !changedCellIds.find(id => id === fill.id)) {
                if (!fill.value) {
                  this.setCell(fill.id, record.value, null, null, false);
                  // keep track so we don't repeat anything
                  changedCellIds.push(fill.id);
                } else if (fill.value !== record.value) {
                  console.log('cant do that, theres a conflict!');
                  return;
                }
              }
            });
          });
        }
      }
    });
  }

  runBasicColumnLogic() {
    const changedCellIds: number[] = [];
    this.options.forEach((topOption) => {
      if (!changedCellIds.find(cellId => this.getCell(cellId).topOptionId === topOption.id)) {
        // Find the 'O's in the next row
        const columnOfOs: Cell [] = this.cells.filter(cell => cell.topOptionId === topOption.id && cell.value === 'O');
        const columnOfXs: Cell [] = this.cells.filter(cell => cell.topOptionId === topOption.id && cell.value === 'X');
        const masterRow: { topOptionId: number, value: string }[] = [];
        columnOfXs.forEach(colX => masterRow.push({topOptionId: colX.leftOptionId, value: colX.value}));
        if (columnOfOs.length > 0) {
          // for each 'O', collect all the cells in that column
          columnOfOs.forEach(match => {
            const rowCells: Cell [] = this.cells.filter(compare => compare.leftOptionId === match.leftOptionId);
            rowCells.forEach(rowCell => {
              // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
              if (rowCell.value && !masterRow.find(record => record.topOptionId === rowCell.topOptionId)) {
                const record: { topOptionId: number, value: string } = {topOptionId: rowCell.topOptionId, value: rowCell.value};
                masterRow.push(record);
              }
            });
          });

          masterRow.forEach(record => {
            if (record.value === 'O') {
              const rCells = this.cells.filter(cell => cell.leftOptionId === record.topOptionId);
              if (rCells.length > 0) {
                columnOfOs.push(rCells[0]);
                rCells.forEach(rowCell => {
                  // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
                  if (rowCell.value && !masterRow.find(recordLine => recordLine.topOptionId === rowCell.topOptionId)) {
                    const recordToPush: { topOptionId: number, value: string } = {topOptionId: rowCell.topOptionId, value: rowCell.value};
                    masterRow.push(recordToPush);
                  }
                });
              }
            }
          });

          // Go through each of the 'O's in the current column again
          columnOfOs.forEach(OinTheColumn => {
            // apply the master row data to each of the 'O''s rows
            masterRow.forEach(record => {
              const fill = this.getCellFromOptions(this.cells, OinTheColumn.leftOptionId, record.topOptionId);
              if (fill && !changedCellIds.find(id => id === fill.id)) {
                if (!fill.value) {
                  this.setCell(fill.id, record.value, null, null, false);
                  // keep track so we don't repeat anything
                  changedCellIds.push(fill.id);
                } else if (fill.value !== record.value) {
                  console.log('cant do that, theres a conflict!');
                  this.undo();
                  return;
                }
              }
            });
          });
        }
      }
    });
  }

  fillDeductions() {
    this.cells.forEach(cell => {
      // if (!cell.value) {
        const rowOptionCells = this.cells.filter(rowCell => rowCell.id !== cell.id && cell.topOptionId === rowCell.topOptionId &&
          this.getOption(cell.leftOptionId).featureId === this.getOption(rowCell.leftOptionId).featureId);
        const colOptionCells = this.cells.filter(colCell => colCell.id !== cell.id && cell.leftOptionId === colCell.leftOptionId &&
          this.getOption(cell.topOptionId).featureId === this.getOption(colCell.topOptionId).featureId);
        if (rowOptionCells.every(crossCell => crossCell.value === 'X') ||
          colOptionCells.every(crossCell => crossCell.value === 'X')) {
          if (!cell.value) {
            this.setCell(cell.id, 'O', null, null, false);
          } else if (cell.value !== 'O') {
            console.log('cant do that, theres a conflict!');
            return;
          }
        }
      // }
    });
  }

  // for logging purposes
  cellAddress(cellId): string {
    const cell = this.getCell(cellId);
    if (cell) {
      const leftOptionId = cell.leftOptionId;
      const topOptionId = cell.topOptionId;
      return `${this.getOption(leftOptionId).name}, ${this.getOption(topOptionId).name}`;
    }
    return '[not found]';
  }

  undo(): void {
    // this.states.pop();
    const len = this.states.length;
    this.clearCells();
    this.cells = this.states[len - 2].cells;
    this.options = this.states[len - 2].options;
    this.features = this.states[len - 2].features;
    // this.updateCells();
  }
}
