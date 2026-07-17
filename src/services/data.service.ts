import {computed, inject, Injectable} from '@angular/core';
import {Cell, CellId, Feature, FeatureId, Option, OptionId} from './entities.model';
import {DataStore} from './data.store';
import {CellText} from './tile.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  store = inject(DataStore);
  cells: Cell[] = [];
  oldCells: Cell[] = [];
  features: Feature[] = [];
  options: Option[] = [];
  optionCount = 3;
  cellCount = 0;

  constructor() {
    this.store.setOptionCountPerFeature(3);
    this.buildMockDataTemplate();
    this.buildMockDataTemplate2();
  }

  getIsDeleteFeatureAllowed2 = computed(() => this.store.featureCount() > 2);
  getIsDeleteFeatureAllowed(): boolean {
    return this.features.length > 2;
  }

  getIsDeleteOptionAllowed2 = computed(() => this.store.optionCountPerFeature() > 1);
  getIsDeleteOptionAllowed(): boolean {
    return this.optionCount > 1;
  }

  buildMockDataTemplate2() {
    const mockFeatureNames = ['First Name', 'Last Name', 'Color', 'Vehicle'];
    const mockOptionNames = [
      'Bob',
      'Missy',
      'Jo',
      'Smith',
      'Johnson',
      'Joseph',
      'red',
      'green',
      'blue',
      'car',
      'boat',
      'plane'
    ];

    for (let i = 0; i < mockFeatureNames.length; i++) {
      let newFeature = new Feature();
      newFeature.name = mockFeatureNames[i];
      this.store.addFeature(newFeature);
      for (let j = 0; j < this.store.optionCountPerFeature(); j++) {
        this.addOptionWithCellsToFeature2(newFeature, mockOptionNames[i * this.store.optionCountPerFeature() + j]);
      }
    }
  }

  buildMockDataTemplate() {
    const mockFeatureNames = ['First Name', 'Last Name', 'Color', 'Vehicle'];
    const mockOptionNames = [
      'Bob',
      'Missy',
      'Jo',
      'Smith',
      'Johnson',
      'Joseph',
      'red',
      'green',
      'blue',
      'car',
      'boat',
      'plane'
    ];

    for (let i = 0; i < 4; i++) {
      let newFeature = new Feature();
      this.features.push(newFeature);
    }

    this.features.forEach(feature => {
      feature.optionsIds = [];

      for (let i = 0; i < this.optionCount; i++) {
        const option = new Option();
        option.featureId = feature.id;
        this.options.push(option);
        feature.optionsIds.push(option.id);
      }
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

  // probably won't need this
  updateCells2() {
    // Do feature 0, then start with the last feature going backwards until feature 2, as left feature
    for (
      let leftFeatureIndex = 0;
      leftFeatureIndex != 1;
      leftFeatureIndex === 0 ?
        (leftFeatureIndex = this.store.featureCount() - 1) : leftFeatureIndex--
    ) {
      // for each leftOptionId in left feature
      this.store.optionIdsByFeature(
        this.store.features()[leftFeatureIndex])?.forEach(
        (leftOptionId: OptionId) => {
          // for each feature after 1 until left feature exclusive, as top feature
          for (
            let topFeatureIndex = 1;
            topFeatureIndex < (leftFeatureIndex || this.store.featureCount());
            topFeatureIndex++
          ) {
            this.store.optionIdsByFeature(
              this.store.features()[topFeatureIndex])?.forEach(
              (topOptionId: OptionId) => {
                let cell = this.store.cellByOptions(leftOptionId, topOptionId);

                if (!cell) {
                  cell = new Cell();
                  cell.optionIds = [leftOptionId, topOptionId];
                  this.store.upsertCell(cell);
                }
              });
          }
        });
    }
  }

  /**
   * Rebuilds the cell list from the current features and options, reusing any
   * existing cell (and its value) that still matches a pair of options so the
   * board survives adding or renaming features.
   */
  updateCells() {
    this.oldCells = this.cells;
    this.cells = [];
    this.cellCount = 0;

    // for each left leftOptionId in left feature0
    this.features[0].optionsIds?.forEach(leftOptionId => {
      // for each feature greater than left feature, as top feature
      for (let topFeatureIndex = 1; topFeatureIndex < this.features.length;
           topFeatureIndex++) {
        // for each top leftOptionId in top feature
        this.features[topFeatureIndex]?.optionsIds?.forEach(topOptionId => {
          // create/push a cell with those two options
          let cell: Cell | undefined = this.getCellFromOptions(this.oldCells,
            leftOptionId, topOptionId);

          if (!cell) {
            cell = new Cell();
            cell.leftOptionId = leftOptionId;
            cell.topOptionId = topOptionId;
          }

          this.cells.push(cell);
          cell = undefined;
          this.cellCount++;
        });
      }
    });

    // then start with the last feature going backwards until feature 2, as left feature
    for (let leftFeatureIndex = this.features.length - 1; leftFeatureIndex > 1;
         leftFeatureIndex--) {
      // for each leftOptionId in left feature
      this.features[leftFeatureIndex].optionsIds?.forEach(leftOptionId => {
        // for each feature after 1 until left feature exclusive, as top feature
        for (let topFeatureIndex = 1; topFeatureIndex < leftFeatureIndex;
             topFeatureIndex++) {
          // for each leftOptionId in top feature
          this.features[topFeatureIndex].optionsIds?.forEach(topOptionId => {
            // create/push a cell with those two options
            let cell = this.getCellFromOptions(this.oldCells, leftOptionId,
              topOptionId);

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

  clearCells2() {
    this.store.updateAllCells({value: ''});
  }

  clearCells() {
    this.cells.forEach(cell => (cell.value = ''));
    this.updateCells();
  }

  /** Finds an existing cell matching the two options in either order. */
  getCellFromOptions(cells: Cell[], option1Id: number,
                     option2Id: number): Cell | undefined {
    return cells.find(
      cell =>
        (cell.leftOptionId === option1Id && cell.topOptionId === option2Id) ||
        (cell.leftOptionId === option2Id && cell.topOptionId === option1Id)
    );
  }

  addNewFeature2(name?: string, optionNames?: string[]) {
    const feature = new Feature();
    if (name) {
      feature.name = name;
    }
    this.store.addFeature(feature);
    for (let i = 0; i < this.store.optionCountPerFeature(); i++) {
      this.addOptionWithCellsToFeature2(feature,);
    }
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

  addNewOptionToAllFeatures2() {
    this.store.setOptionCountPerFeature(this.store.optionCountPerFeature() + 1);
    this.store.features().forEach((feature: Feature) => {
      this.addOptionWithCellsToFeature2(feature);
    });
  }

  addOptionWithCellsToFeature2(feature: Feature, name?: string) {
    const option = new Option();
    option.featureId2 = feature.id2;

    if (name != undefined) {
      option.name = name;
    }

    // todo: replace with store.indexOfFeature once I've added it to signalkin
    const featureIndex = this.store.featurePositions().get(feature.id2);
    if (featureIndex == undefined) {
      throw new Error('cannot find feature with id ' + feature.id2);
    }

    this.store.options().forEach(existingOption => {
      if (existingOption.featureId2 && existingOption.featureId2 !== feature.id2) {
        const cell = new Cell();

        const existingFeatureIndex = this.store.featurePositions().get(existingOption.featureId2);
        if (existingFeatureIndex == undefined) {
          throw new Error('cannot find feature with id ' + existingOption.featureId2);
        }

        // if the option is from a feature at index 0, we know it is on the left;
        // otherwise the left option is whichever's feature index is higher
        const leftOptionId = existingFeatureIndex === 0 ? existingOption.id2 :
          featureIndex === 0 || featureIndex > existingFeatureIndex ? option.id2 : existingOption.id2;

        cell.optionIds = [leftOptionId, leftOptionId === existingOption.id2 ? option.id2 : existingOption.id2];

        this.store.addCell(cell);
      }
    });

    this.store.addOption(option);
  }

  addOption() {
    this.optionCount++;

    this.features.forEach(feature => {
      const option = new Option();
      option.name = '';
      option.featureId = feature.id;
      feature.optionsIds?.push(option.id);

      this.options.push(option);
    });

    this.updateCells();
  }

  deleteOption2(optionId: OptionId) {
    const indexToRemove = this.store.indexOfFeatureOption(optionId);
    this.store.features().forEach((feature: Feature) => {
      const matchingOption = this.store.optionIdsByFeature(
        feature)[indexToRemove];
      this.store.removeCells(this.store.cellsByOption(matchingOption));
      this.store.removeOption(matchingOption);
    });
    this.store.setOptionCountPerFeature(
      this.store.optionCountPerFeature() - 1);
  }

  deleteOption(id: number) {
    const featureId = this.getOption(id)?.featureId;
    if (!featureId) return;

    const indexToRemove = this.getFeature(featureId)?.optionsIds?.findIndex(
      optionId => optionId === id) || -1;
    if (!indexToRemove) return;

    this.features.forEach(feature => {
      const nextId = feature.optionsIds?.[indexToRemove];
      this.cells = this.cells.filter(
        cell => cell.leftOptionId !== nextId && cell.topOptionId !== nextId);
      this.options = this.options.filter(option => option.id !== nextId);
      feature.optionsIds?.splice(indexToRemove, 1);
    });

    this.optionCount--;
  }

  deleteFeature2(featureId: FeatureId) {
    this.store.removeCells(this.store.cellsByFeature(featureId));
    this.store.removeOptions(this.store.optionsByFeature(featureId));
    this.store.removeFeature(featureId);
  }

  deleteFeature(id: number) {
    const featureToRemove = this.features.find(feature => feature.id === id);
    const optionsToRemove = featureToRemove?.optionsIds;

    this.cells = this.cells.filter(
      cell =>
        cell.leftOptionId &&
        cell.topOptionId &&
        !optionsToRemove?.includes(cell.leftOptionId) &&
        !optionsToRemove?.includes(cell.topOptionId)
    );
    this.options = this.options.filter(
      option => !optionsToRemove?.includes(option.id));
    this.features = this.features.filter(feature => feature.id !== id);
  }

  setCell2(cellId: CellId, value?: string, withLogic?: boolean) {
    if (!cellId) return;
    let cell = this.store.cellById(cellId);
    if (cell) {
      if (value !== cell.value && typeof value === 'string') {
        this.store.setCell({...cell, value});

        if (value === CellText.O) {
          const crossCellIds = this.getCrossCellIds2(cellId);
          crossCellIds.forEach(crossCellId => {
            this.setCell2(crossCellId, CellText.X, true);
          });
        }

        if (withLogic) {
          this.propagateLogicalValuesToMatchingCells2(true);
          this.propagateLogicalValuesToMatchingCells2(false);
          this.fillDeductions2();
        }
      }
    }
  }

  setCell(id?: number, value?: string, topOptionId?: number,
          leftOptionId?: number, withLogic = true) {
    let cell = this.getCell(id);
    if (cell) {
      if (value !== cell.value && typeof value === 'string') {
        cell.value = value;

        if (value === CellText.O && id != undefined) {
          // Shira, when would we have a cell with the id "undefined"?
          const crossCells = this.getCrossCellIds(id);
          crossCells.forEach(cellId => {
            this.setCell(cellId, CellText.X);
          });
        }

        if (withLogic) {
          this.runBasicRowLogic();
          this.runBasicColumnLogic();
          this.fillDeductions();
        }
      }
      cell = this.getCell(id); // why was I getting this twice? Do any of the above functions delete cells??

      if (cell && topOptionId) {
        cell.topOptionId = topOptionId;
      }

      if (cell && leftOptionId) {
        cell.leftOptionId = leftOptionId;
      }
    }
  }

  // no need for setOption2
  setOption(id: number, name?: string, featureId?: number) {
    const option = this.getOption(id);
    if (option) {
      if (name) {
        option.name = name;
      }

      if (featureId) {
        option.featureId = featureId;
      }
    }
  }

  // no need for setFeature2
  setFeature(id: number, name?: string, optionsIds?: number[]) {
    const feature = this.getFeature(id);
    if (feature) {
      if (name) {
        feature.name = name;
      }

      if (optionsIds) {
        feature.optionsIds = optionsIds;
      }

      this.updateCells();
    }
  }

  // no need for getCell2
  getCell(id?: number): Cell | undefined {
    return id != undefined ? this.cells.find(cell => cell.id === id) :
      undefined;
  }

  // no need for getOption2
  getOption(id?: number): Option | undefined {
    return id != undefined ? this.options.find(option => option.id === id) :
      undefined;
  }

  // no need for getFeature2
  getFeature(id?: number): Feature | undefined {
    return id != undefined ? this.features.find(feature => feature.id === id) :
      undefined;
  }

  // no need for getFeatureOptions2
  getFeatureOptions(featureId?: number): Option[] | undefined {
    return featureId != undefined ?
      this.options.filter(option => option.featureId === featureId) : undefined;
  }

  getCrossCellIds2(cellId: CellId): CellId[] {
    const [leftOption, topOption] = this.store.optionsByCell(cellId);
    const [leftFeatureId, topFeatureId] = this.store.featureIdsByCell(cellId);

    const horizontalCellIds = this.store.cellIdsByOption(topOption).filter(
      cellIdByOption =>
        cellIdByOption !== cellId &&
        this.store.featureIdsByCell(cellIdByOption)?.[0] === leftFeatureId);
    const verticalCellIds = this.store.cellIdsByOption(leftOption).filter(
      cellIdByOption =>
        cellIdByOption !== cellId &&
        this.store.featureIdsByCell(cellIdByOption)?.[1] === topFeatureId);

    return [...horizontalCellIds, ...verticalCellIds];
  }

  /**
   * Cells that share a feature-row or feature-column with this cell — the
   * ones forced to X when this cell becomes O.
   */
  getCrossCellIds(cellId: number): number[] {
    const leftOptionId = this.getCell(cellId)?.leftOptionId;
    const leftFeatureId = this.getOption(leftOptionId)?.featureId;
    const topOptionId = this.getCell(cellId)?.topOptionId;
    const topFeatureId = this.getOption(topOptionId)?.featureId;
    const crossCellIds: Array<number> = [];

    this.cells.forEach(cell => {
      if (
        cell.id !== cellId &&
        ((cell.topOptionId === topOptionId &&
            this.getOption(cell.leftOptionId)?.featureId === leftFeatureId) ||
          (cell.leftOptionId === leftOptionId &&
            this.getOption(cell.topOptionId)?.featureId === topFeatureId))
      ) {
        crossCellIds.push(cell.id);
      }
    });

    return crossCellIds;
  }

  propagateLogicalValuesToMatchingCells2(isHorizontal: boolean) {
    const lineAxis = isHorizontal ? 0 : 1;
    const crossAxis = isHorizontal ? 1 : 0;
    const changedCellIds: Set<CellId> = new Set();
    const usedOptionIds: Set<OptionId> = new Set();

    this.store.options().forEach(option => {
      if (!usedOptionIds.has(option.id2)) {
        const cellsInLineWithO: Cell[] = [];
        const master = new Map();
        this.store.cellsByOptionAtIndex(option.id2, lineAxis).forEach((cell) => {
          if (cell.value === CellText.O) {
            cellsInLineWithO.push(cell);
          } else if (cell.value === CellText.X) {
            master.set(cell.optionIds?.[crossAxis], CellText.X);
          }
        });

        if (cellsInLineWithO.length > 0) {
          this.collectCrossValuesForOs2(cellsInLineWithO, master, lineAxis, crossAxis);
          this.expandMasterCrossValuesAlongOs2(cellsInLineWithO, master, lineAxis, crossAxis);
          this.applyMasterCrossValuesToOs2(cellsInLineWithO, master, changedCellIds, crossAxis, usedOptionIds);
        }
      }
    });
  }

  /**
   * Propagates known values along each row: gathers the values in the columns
   * crossed by a row's Os, then copies them onto the other Os in that row,
   * since parallel Os must share the same column values.
   */
  runBasicRowLogic() {
    const changedCellIds: number[] = [];

    this.options.forEach(leftOption => {
      if (!changedCellIds.find(
        cellId => this.getCell(cellId)?.leftOptionId === leftOption.id)) {
        // Find the 'O's in the next row
        const rowOfOs: Cell[] = this.cells.filter(
          cell => cell.leftOptionId === leftOption.id && cell.value === CellText.O);
        const rowOfXs: Cell[] = this.cells.filter(
          cell => cell.leftOptionId === leftOption.id && cell.value === CellText.X);
        const masterColumn: { optionId: number; value: string }[] = [];
        rowOfXs.forEach(rowXCell =>
          masterColumn.push({
            optionId: rowXCell.topOptionId as number,
            value: rowXCell.value
          })
        );

        if (rowOfOs.length > 0) {
          this.collectColumnValuesForOs(rowOfOs, masterColumn, 'leftOptionId',
            'topOptionId');
          this.expandMasterColumnAlongOs(rowOfOs, masterColumn, 'leftOptionId',
            'topOptionId');
          this.applyMasterColumnToOs(rowOfOs, masterColumn, changedCellIds,
            'topOptionId');
        }
      }
    });
  }

  collectCrossValuesForOs2(cellsInLineWithO: Cell[], master: Map<OptionId, string>, lineAxis: 0 | 1, crossAxis: 0 | 1) {
    cellsInLineWithO.forEach(cell => {
      const crossCells: Cell[] = this.store.cellsByOptionAtIndex(cell.optionIds?.[crossAxis] as OptionId, crossAxis);
      crossCells?.forEach(crossCell => {
        const lineOptionId = crossCell.optionIds?.[lineAxis];
        if (crossCell.value && lineOptionId && !master.has(lineOptionId)) {
          master.set(lineOptionId, crossCell.value);
        }
      });
    });
  }

  /** Collects the valued cells from each 'O''s cross-line into the master column, skipping duplicates. */
  collectColumnValuesForOs(
    rowOfOs: Cell[],
    masterColumn: { optionId: number; value: string }[],
    lineAxis: 'leftOptionId' | 'topOptionId',
    crossAxis: 'leftOptionId' | 'topOptionId'
  ) {
    // for each 'O', collect all the cells in its cross-line
    rowOfOs.forEach(oCell => {
      const crossCells: Cell[] = this.cells.filter(cell => cell[crossAxis] === oCell[crossAxis]);
      crossCells.forEach(crossCell => {
        // if a cell in that cross-line has a value, add its line option to the master column (but no duplicates)
        const lineOptionId = crossCell[lineAxis];
        if (
          crossCell.value &&
          lineOptionId != undefined &&
          !masterColumn.find(record => record.optionId === lineOptionId)
        ) {
          masterColumn.push({
            optionId: lineOptionId,
            value: crossCell.value
          });
        }
      });
    });
  }

  expandMasterCrossValuesAlongOs2(cellsInLineWithO: Cell[], master: Map<OptionId, string>, lineAxis: 0 | 1,
                                  crossAxis: 0 | 1) {
    for (let [optionId, value] of master.entries()) {
      if (value === CellText.O) {
        const crossCells: Cell[] = this.store.cellsByOptionAtIndex(optionId as OptionId, crossAxis);

        if (crossCells.length > 0) {
          cellsInLineWithO.push(crossCells[0]);
          crossCells?.forEach(crossCell => {
            const lineOptionId = crossCell.optionIds?.[lineAxis];
            if (crossCell.value && lineOptionId && !master.has(lineOptionId)) {
              master.set(lineOptionId, crossCell.value);
            }
          });
        }
      }
    }
  }

  /** Follows each 'O' record in the master column to its own cross-line, adding those cells to the row and master column. */
  expandMasterColumnAlongOs(
    rowOfOs: Cell[],
    masterColumn: { optionId: number; value: string }[],
    lineAxis: 'leftOptionId' | 'topOptionId',
    crossAxis: 'leftOptionId' | 'topOptionId'
  ) {
    masterColumn.forEach(record => {
      if (record.value === CellText.O) {
        const recordCrossCells = this.cells.filter(
          cell => cell[crossAxis] === record.optionId);

        if (recordCrossCells.length > 0) {
          rowOfOs.push(recordCrossCells[0]);
          recordCrossCells.forEach(crossCell => {
            // if a cell in that cross-line has a value, add its line option to the master column (but no duplicates)
            const lineOptionId = crossCell[lineAxis];
            if (
              crossCell.value &&
              lineOptionId != undefined &&
              !masterColumn.find(
                existingRecord => existingRecord.optionId === lineOptionId)
            ) {
              masterColumn.push({
                optionId: lineOptionId,
                value: crossCell.value
              });
            }
          });
        }
      }
    });
  }

  applyMasterCrossValuesToOs2(cellsInLineWithO: Cell[], master: Map<OptionId, string>, changedCellIds: Set<CellId>,
                              crossAxis: 0 | 1, usedOptionIds: Set<OptionId>) {
    cellsInLineWithO.forEach(oCell => {
      for (let [optionId, value] of master.entries()) {
        const cellToFill = this.store.cellByOptions(oCell.optionIds?.[crossAxis] as OptionId, optionId);
        if (cellToFill && !usedOptionIds.has(optionId as OptionId) && !cellToFill.value) {
          this.setCell2(cellToFill.id2, value);
          changedCellIds.add(cellToFill.id2);
          usedOptionIds.add(optionId);
        }
      }
    });
  }

  /** Writes the master column's values into every 'O''s cross-line, recording each cell it changes. */
  applyMasterColumnToOs(
    rowOfOs: Cell[],
    masterColumn: { optionId: number; value: string }[],
    changedCellIds: number[],
    crossAxis: 'leftOptionId' | 'topOptionId'
  ) {
    // Go through each of the 'O's again
    rowOfOs.forEach(oCellInRow => {
      // apply the master column data to each of the 'O''s cross-lines
      masterColumn.forEach(record => {
        const fillCell = this.getCellFromOptions(
          this.cells,
          oCellInRow[crossAxis] as number,
          record.optionId
        );

        if (fillCell &&
          !changedCellIds.find(changedId => changedId === fillCell.id) &&
          !fillCell.value) {
          this.setCell(fillCell.id, record.value, undefined, undefined, false);
          // keep track so we don't repeat anything
          changedCellIds.push(fillCell.id);
        }
      });
    });
  }

  /**
   * Mirror of runBasicRowLogic for columns: gathers the values in the rows
   * crossed by a column's Os and copies them onto the other Os in that column.
   */
  runBasicColumnLogic() {
    const changedCellIds: number[] = [];

    this.options.forEach(topOption => {
      if (!changedCellIds.find(
        cellId => this.getCell(cellId)?.topOptionId === topOption.id)) {
        // Find the 'O's in the next row
        const columnOfOs: Cell[] = this.cells.filter(
          cell => cell.topOptionId === topOption.id && cell.value === CellText.O);
        const columnOfXs: Cell[] = this.cells.filter(
          cell => cell.topOptionId === topOption.id && cell.value === CellText.X);
        const masterRow: { optionId: number; value: string }[] = [];
        columnOfXs.forEach(columnXCell =>
          masterRow.push({
            optionId: columnXCell.leftOptionId as number,
            value: columnXCell.value
          })
        );

        if (columnOfOs.length > 0) {
          this.collectColumnValuesForOs(columnOfOs, masterRow, 'topOptionId',
            'leftOptionId');
          this.expandMasterColumnAlongOs(columnOfOs, masterRow, 'topOptionId',
            'leftOptionId');
          this.applyMasterColumnToOs(columnOfOs, masterRow, changedCellIds,
            'leftOptionId');
        }
      }
    });
  }

  fillDeductions2() {
    this.store.cells().forEach(cell => {
      const [leftOptionId, topOptionId] = cell.optionIds as Array<OptionId>;
      let columnIsAllXs = false;
      let rowIsAllXs = false;
      if (!cell.value) {
        if (topOptionId) {
          columnIsAllXs = this.store.cellsByOptionAtIndex(topOptionId, 1).every(cellByOption =>
            cell.id2 !== cellByOption.id2 &&
            this.store.featureIdsByCell(cellByOption)?.[0] === this.store.featureIdsByCell(cell)?.[0] &&
            cellByOption.value === CellText.X
          );
        }
        if (columnIsAllXs) {
          this.setCell2(cell.id2, CellText.O);
        } else if (leftOptionId) { // only check the row if the column didn't already have all Xs
          rowIsAllXs = this.store.cellsByOptionAtIndex(leftOptionId, 0).every(cellByOption =>
            cell.id2 !== cellByOption.id2 &&
            this.store.featureIdsByCell(cellByOption)?.[1] === this.store.featureIdsByCell(cell)?.[1] &&
            cellByOption.value === CellText.X
          );
          if (rowIsAllXs) {
            this.setCell2(cell.id2, CellText.O);
          }
        }
      }
    });
  }

  /**
   * Fills an empty cell with O when every other cell in its feature-row or
   * feature-column is already X (the only remaining match must be true).
   */
  fillDeductions() {
    this.cells.forEach(cell => {
      if (!cell.value) {
        const rowOptionCells = this.cells.filter(rowCell =>
          rowCell.id !== cell.id &&
          cell.topOptionId === rowCell.topOptionId &&
          this.getOption(cell.leftOptionId)?.featureId != undefined &&
          this.getOption(cell.leftOptionId)?.featureId ===
          this.getOption(rowCell.leftOptionId)?.featureId
        );
        const columnOptionCells = this.cells.filter(
          columnCell =>
            columnCell.id !== cell.id &&
            cell.leftOptionId === columnCell.leftOptionId &&
            this.getOption(cell.topOptionId)?.featureId != undefined &&
            this.getOption(cell.topOptionId)?.featureId ===
            this.getOption(columnCell.topOptionId)?.featureId
        );

        if (
          rowOptionCells.every(crossCell => crossCell.value === CellText.X) ||
          columnOptionCells.every(crossCell => crossCell.value === CellText.X)
        ) {
          this.setCell(cell.id, CellText.O, undefined, undefined, false);
        }
      }
    });
  }
}
