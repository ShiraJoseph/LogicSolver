import { Injectable, OnInit } from '@angular/core';
import { Cell, Feature, Match, Option } from './model';

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
  matches: Match [] = [];

  getAllowDeleteFeatures() {
    return this.features.length > 2;
  }

  getAllowDeleteOptions() {
    return this.optionCount > 1;
  }

  constructor() {
    this.buildDataTemplate();
  }

  buildDataTemplate() {
    const f1 = new Feature();
    const f2 = new Feature();
    const f3 = new Feature();
    this.features.push(f1, f2, f3);
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
    this.options[0].name = 'Bob';
    this.options[1].name = 'Missy';
    this.options[2].name = 'Jo';
    this.options[3].name = 'Smith';
    this.options[4].name = 'Johnson';
    this.options[5].name = 'Joseph';
    this.options[6].name = 'red';
    this.options[7].name = 'green';
    this.options[8].name = 'blue';
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
          }
          this.cells.push(cell);
          cell = null;
          this.cellCount++;
        });
      }
    });

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
            }
            this.cells.push(cell);
            this.cellCount++;
          });
        }
      });
    }
    this.oldCells = [];
  }

  getCellFromOptions(arr: Cell[], option1Id: number, option2Id: number) {
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
      if (value !== this.getCell(id).value) {
        this.cells.find(cell => cell.id === id).value = value;
        this.runLogic(id);
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
      this.updateCells();
    }
  }

  getCell(id) {
    return this.cells.find(cell => cell.id === id);
  }

  getOption(id) {
    return this.options.find(option => option.id === id);
  }

  getFeature(id) {
    return this.features.find(feature => feature.id === id);
  }

  getFeatureOptions(featureId: number) {
    return this.options.filter(option => option.featureId === featureId);
  }

  getCrossCells(cellId: number) {
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

  getMatchedCells(cellId) {

    const matchedCells = this.matches.find(match => match.optionsIds.includes(this.getCell(cellId)));
    // find cells that share an option that are 'O' and are not already found
    this.cells.forEach(cell => {
      if (cell.value === 'O' && [cell.leftOptionId, cell.topOptionId].find(id => id === this.get)) {
        matchedCells.push(cell.id);
      }
    });
    const leftOptionId = this.getCell(cellId).leftOptionId;
  }

  runLogic(id) {
    const cell = this.getCell(id);
    if (cell) {
      if (cell.value === 'O') {
        const crossCells = this.getCrossCells(id);
        crossCells.forEach(cellId => {
          this.setCell(cellId, 'X');
        });
      }
      this.updateMatches(cell);
      this.applyMatchesToData();
    }
  }

  updateMatches(cell: Cell) {
    this.matches.forEach((currMatch) => {
      const hasLeft = currMatch.optionsIds.includes(cell.leftOptionId);
      const hasTop = currMatch.optionsIds.includes(cell.topOptionId);
      const antiLeft = currMatch.antiOptionsIds.includes(cell.leftOptionId);
      const antiTop = currMatch.antiOptionsIds.includes(cell.topOptionId);

      if (hasLeft && !hasTop) {
        if (cell.value === 'O') {
          currMatch.optionsIds.push(cell.topOptionId);
        } else if (cell.value === 'X') {
          currMatch.antiOptionsIds.push(cell.topOptionId);
        }
      } else if (hasTop && !hasLeft) {
        if (cell.value === 'O') {
          currMatch.optionsIds.push(cell.leftOptionId);
        } else if (cell.value === 'X') {
          currMatch.antiOptionsIds.push(cell.leftOptionId);
        }
      } else if (cell.value === 'X') {
        if (antiLeft && !antiTop) {
          currMatch.antiOptionsIds.push(cell.topOptionId);
        } else if (antiTop && !antiLeft) {
          currMatch.antiOptionsIds.push(cell.leftOptionId);
        }
      }
    });
    // if ()
    // match 1:
    // ids = green, missy
    // antiIds = []
    // put o in johnson, missy, add johnson to ids
    // put x in johnson, missy, add johnson to antiIds
    // any cell that shares two options in a match's ids should get an O, ay cell that share two options in a match's anti ids should get an X
    // id of left option is in ids, but topOption is antiId, so for every other id other than missy and johnson
  }

  applyMatchesToData() {
    this.matches.forEach(match => {
      for (let id1 = 0; id1 < match.optionsIds.length - 1; id1++) {
        for (let id2 = id1 + 1; id2 < match.optionsIds.length; id2++) {
          const cellId = this.getCellFromOptions(this.cells, match[id1], match[id2]).id;
          if (cellId && !this.getCell(cellId).value) {
            this.setCell(cellId, 'O');
          }
        }
      }
      //
      // for (let anti1 = 0; anti1 < match.optionsIds.length - 1; anti1++) {
      //   for (let anti2 = anti1 + 1; anti2 < match.optionsIds.length; anti2++) {
      //     const cellId = this.getCellFromOptions(this.cells, match[anti1], match[anti2]).id;
      //     if (cellId && !this.getCell(cellId).value) {
      //       this.setCell(cellId, '');
      //     }
      //   }
      // }
    });
  }
}
