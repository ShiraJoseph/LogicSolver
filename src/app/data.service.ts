import { Injectable } from '@angular/core';
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
  matches: Match[] = [];

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
  }

  deleteFeature(id: number) {
    const featureToRemove = this.features.find(feature => feature.id === id);
    const optionsToRemove = featureToRemove.optionsIds;
    this.cells = this.cells.filter(cell => !optionsToRemove.includes(cell.leftOptionId) && !optionsToRemove.includes(cell.topOptionId));
    this.options = this.options.filter(option => !optionsToRemove.includes(option.id));
    this.features = this.features.filter(feature => feature.id !== id);
  }

  setCell(id: number, value ?: string, topOptionId ?: number, leftOptionId ?: number, withLogic = true) {
    if (this.getCell(id)) {
      if (value !== this.getCell(id).value) {
        this.cells.find(cell => cell.id === id).value = value;
        if (value === 'O') {
          const crossCells = this.getCrossCellIds(id);
          crossCells.forEach(cellId => {
            this.setCell(cellId, 'X');
          });
        }
        if (withLogic) {
          this.runBasicLogic();
        }
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
  runBasicLogic() {
    const changedCellIds: number[] = [];
    this.options.forEach((leftOption) => {
      if (!changedCellIds.find(cellId => this.getCell(cellId).leftOptionId === leftOption.id)) {
        // Find the 'O's in the next row
        const rowOfOs: Cell [] = this.cells.filter(cell => cell.leftOptionId === leftOption.id && cell.value === 'O');
        if (rowOfOs.length > 0) {
          const masterColumn: { leftOptionId: number, value: string }[] = [];
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
                }
              }
            });
          });
        }
      }
    });
  }

  updateMatches(cell: Cell) {
    if (this.matches.length === 0 && cell.value === 'O') {
      const firstMatch = new Match();
      firstMatch.optionsIds.push(cell.leftOptionId, cell.topOptionId);
      this.matches.push(firstMatch);
    } else {
      this.matches.forEach((currMatch) => {
        console.log('currMatch = ', currMatch);
        const hasLeft = currMatch.optionsIds.includes(cell.leftOptionId);
        const hasTop = currMatch.optionsIds.includes(cell.topOptionId);
        const antiLeft = currMatch.antiOptionsIds.includes(cell.leftOptionId);
        const antiTop = currMatch.antiOptionsIds.includes(cell.topOptionId);

        if (hasLeft && !hasTop) {
          console.log('hasLeft and !hasTop');
          if (cell.value === 'O') {
            currMatch.optionsIds.push(cell.topOptionId);
          } else if (cell.value === 'X') {
            currMatch.antiOptionsIds.push(cell.topOptionId);
          }
        } else if (hasTop && !hasLeft) {
          console.log('hasTop and !hasLeft');
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
          this.matches.forEach(match => {
            if (match.optionsIds.includes(cell.leftOptionId)) {
              console.log('found match with left');
              match.antiOptionsIds.push(cell.topOptionId);
              match.optionsIds.forEach(option => {
                if (option !== cell.leftOptionId) {
                  const antiCell = this.getCellFromOptions(this.cells, option, cell.topOptionId);
                  if (antiCell && !antiCell.value) {
                    console.log('found antiCell, options=', this.getCell(antiCell.id).leftOptionId, ', ', this.getCell(antiCell.id).topOptionId);
                    this.setCell(antiCell.id, 'X');
                  }
                }
              });
            }
            if (match.optionsIds.includes(cell.topOptionId)) {
              console.log('found match with top');
              match.antiOptionsIds.push(cell.leftOptionId);
              match.optionsIds.forEach(option => {
                if (option !== cell.topOptionId) {
                  const antiCell = this.getCellFromOptions(this.cells, option, cell.leftOptionId);
                  if (antiCell && !antiCell.value) {
                    console.log('found antiCell, options=', this.getCell(antiCell.id).topOptionId, ',', this.getCell(antiCell.id).leftOptionId);
                    this.setCell(antiCell.id, 'X');
                  }
                }
              });
            }
          });
        } else if (!hasLeft && !hasTop && !antiLeft && !antiTop) {
          const newMatch = new Match();
          newMatch.optionsIds.push(cell.topOptionId, cell.leftOptionId);
        }
      });
    }
    // if ()
    // match 1:
    // ids = green, missy
    // antiIds = []
    // put o in johnson, missy, add johnson to ids
    // put x in johnson, missy, add johnson to antiIds
    // any cell that shares two options in a match's ids should get an O, ay cell that share two options in a match's anti ids should get an X
    // id of left leftOptionId is in ids, but topOption is antiId, so for every other id other than missy and johnson
  }


  applyMatchesToCellValues() {
    this.matches.forEach((match, index) => {
      console.log('match ', index);
      for (let index1 = 0; index1 < match.optionsIds.length - 1; index1++) {
        console.log('id[', index1, '] points to', this.getOption(match.optionsIds[index1]).name);
        for (let index2 = index1 + 1; index2 < match.optionsIds.length; index2++) {
          console.log('id[', index2, '] points to', this.getOption(match.optionsIds[index2]).name);
          const cell = this.getCellFromOptions(this.cells, match[index1], match[index2]);
          if (cell && !this.getCell(cell.id).value) {
            console.log('found empty cell ', cell.id.toFixed(3));
            this.setCell(cell.id, 'O');
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

  matchMatches() {
    // a = 123
    // b = 245
    // c = 678
    // d = 179
    this.matches.forEach(match1 => {
      match1.optionsIds.forEach(opt => {
        this.matches.forEach((match2, index) => {
          if (match1 !== match2 && match2.optionsIds.includes(opt)) {
            // join the matches
            // const jointMatch = new Match();
            // jointMatch.optionsIds = match1.optionsIds;
            match2.optionsIds.forEach(option => {
              if (!match1.optionsIds.includes(option)) {
                match1.optionsIds.push(option);
              }
            });
            match2.antiOptionsIds.forEach(anti => {
              if (!match1.antiOptionsIds.includes(anti)) {
                match1.antiOptionsIds.push(anti);
              }
            });
            this.matches.splice(index, 1);
          }
        });
      });
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
}
