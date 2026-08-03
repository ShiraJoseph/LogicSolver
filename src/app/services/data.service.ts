import {inject, Injectable} from '@angular/core';
import {Cell, CellId, Feature, FeatureId, Option, OptionId} from '../types/entities.model';
import {DataStore} from './data.store';
import {CellText} from '../types/tile.model';
import {LEFT, TOP} from '../types/data.constants';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  store = inject(DataStore);

  constructor() {
    this.store.setOptionCountPerFeature(3);
    this.buildMockDataTemplate2();
  }

  setCell2(cellId: CellId, value?: CellText, withLogic?: boolean,
           featureToCrossOptions?: Map<FeatureId, Set<OptionId>>) {
    const cell: Cell = {...this.store.cellById(cellId)} as Cell;
    if (!cell.id2) return;

    if (!featureToCrossOptions) {
      featureToCrossOptions = new Map();
    }

    if (value !== cell.value2 && typeof value === 'string') {
      cell.value2 = value;
      this.store.setCell(cell);

      if (cell.value2 === CellText.X) {
        const [leftFeatureId, topFeatureId] = this.store.featureIdsByCell(cellId) as [FeatureId, FeatureId];

        this.updateOptionFeaturesForEliminationCheck(featureToCrossOptions, cell, leftFeatureId, TOP);
        this.updateOptionFeaturesForEliminationCheck(featureToCrossOptions, cell, topFeatureId, LEFT);
      } else if (cell.value2 === CellText.O) {
        const crossCellIds = this.getCrossCells2(cellId);

        crossCellIds.forEach(crossCell => {
          this.setCell2(crossCell.id2, CellText.X, true, featureToCrossOptions);
        });
      }

      this.deduceSideEffects2(cellId, withLogic, featureToCrossOptions);
    }

  }

  addNewFeature2(name?: string) {
    const feature = new Feature();
    if (name) {
      feature.name = name;
    }
    this.store.addFeature(feature);
    for (let i = 0; i < this.store.optionCountPerFeature(); i++) {
      this.addOptionWithCellsToFeature2(feature,);
    }
  }

  addNewOptionToAllFeatures2() {
    this.store.setOptionCountPerFeature(this.store.optionCountPerFeature() + 1);

    this.store.features().forEach((feature: Feature) => {
      this.addOptionWithCellsToFeature2(feature);
    });
  }

  deleteOption2(optionId: OptionId) {
    const indexToRemove = this.store.indexOfFeatureOption(optionId);

    this.store.features().forEach((feature: Feature) => {
      const matchingOption = this.store.optionIdsByFeature(feature)[indexToRemove];

      this.store.removeCells(this.store.cellsByOption(matchingOption));
      this.store.removeOption(matchingOption);
    });

    this.store.setOptionCountPerFeature(this.store.optionCountPerFeature() - 1);
  }

  deleteFeature2(featureId: FeatureId) {
    this.store.removeCells(this.store.cellsByFeature(featureId));
    this.store.removeOptions(this.store.optionsByFeature(featureId));
    this.store.removeFeature(featureId);
  }

  /**
   * Clears all cells in the grid. (Leaves features and options as they are)
   */
  clearCells2() {
    this.store.updateAllCells({value2: CellText.EMPTY});
  }

  private buildMockDataTemplate2() {
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

  private addOptionWithCellsToFeature2(feature: Feature, name?: string) {
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

  private deduceSideEffects2(cellId: CellId, withLogic?: boolean,
                             featureToCrossOptions?: Map<FeatureId, Set<OptionId>>) {
    if (!withLogic) return;

    const changedCellIds: Set<CellId> = new Set();
    changedCellIds.add(cellId);

    this.propagateLogicalValuesToMatchingCells2(0, changedCellIds, featureToCrossOptions);
    this.propagateLogicalValuesToMatchingCells2(1, changedCellIds, featureToCrossOptions);

    this.useProcessOfEliminationOnChangedLines2(featureToCrossOptions);
  }

  /**
   * Cells that share a feature-row or feature-column with this cell — the
   * ones forced to X when the given cell becomes O.
   */
  private getCrossCells2(cellId: CellId): Cell[] {
    const [leftOption, topOption] = this.store.optionsByCell(cellId);
    const [leftFeatureId, topFeatureId] = this.store.featureIdsByCell(cellId) as [FeatureId, FeatureId];

    const horizontalCellIds = this.store.cellsByOption(topOption).filter(cellByOption => {
      return cellByOption.id2 !== cellId &&
        cellByOption.value2 === CellText.EMPTY &&
        this.store.featureIdsByCell(cellByOption)?.[LEFT] === leftFeatureId;

    });

    const verticalCellIds = this.store.cellsByOption(leftOption).filter(
      cellByOption => {
        return cellByOption.id2 !== cellId &&
          cellByOption?.value2 === CellText.EMPTY &&
          this.store.featureIdsByCell(cellByOption)?.[TOP] === topFeatureId;

      });

    return [...horizontalCellIds, ...verticalCellIds];
  }


  private updateOptionFeaturesForEliminationCheck(featureToCrossOptions: Map<FeatureId, Set<OptionId>>,
                                                  cellByOption: Cell, lineFeatureId: FeatureId, crossAxis: 0 | 1) {
    const optionToUseProcessOfEliminationOn = cellByOption.optionIds?.[crossAxis];
    if (optionToUseProcessOfEliminationOn) {
      if (!featureToCrossOptions.has(lineFeatureId)) {
        featureToCrossOptions.set(lineFeatureId, new Set());
      }
      featureToCrossOptions.get(lineFeatureId)?.add(optionToUseProcessOfEliminationOn);
    }
  }

  /**
   * Propagates known values along each row (if lineAxis is 0): gathers the values in the columns
   * crossed by a row's Os, then copies them onto the other Os in that row,
   * since parallel Os must share the same column values.
   * Does the same for columns instead if lineAxis is 1.
   */
  private propagateLogicalValuesToMatchingCells2(lineAxis: 0 | 1, changedCellIds: Set<CellId>, featureToCrossOptions? : Map<FeatureId, Set<OptionId>>) {
    const crossAxis = lineAxis ? 0 : 1;
    const usedOptionIds: Set<OptionId> = new Set();

    this.store.options().forEach(option => {
      if (!usedOptionIds.has(option.id2)) {
        const cellsInLineWithO: Cell[] = [];
        const master = new Map();

        this.store.cellsByOptionAtIndex(option.id2, lineAxis).forEach((cell) => {
          if (cell.value2 === CellText.O) {
            cellsInLineWithO.push(cell);
          } else if (cell.value2 === CellText.X) {
            master.set(cell.optionIds?.[crossAxis], CellText.X);
          }
        });

        if (cellsInLineWithO.length > 0) {
          // Step 1: copy the whole cross-section of cells as a template in a master list
          this.collectCrossValuesForOs2(cellsInLineWithO, master, lineAxis);
          // Step 2: do the same for all the cells in the master list - this one extra step is needed because all
          // corners of a rectangle are always at most two steps away from each other.
          this.collectMasterCrossValuesAlongOs2(cellsInLineWithO, master, lineAxis);
          // Step 3: Take the template from the master list and apply gathered values to the current line
          this.applyMasterCrossValuesToOs2(cellsInLineWithO, master, changedCellIds, crossAxis, usedOptionIds, featureToCrossOptions);
        }
      }
    });
    return usedOptionIds;
  }

  /**
   * Collects the valued cells from each 'O''s cross-line into the master list, skipping duplicates.
   * (If Joe was born in 1970 and has a red car, then the red car is associated with 1970)
   */
  private collectCrossValuesForOs2(cellsInLineWithO: Cell[], master: Map<OptionId, CellText>, lineAxis: 0 | 1) {
    const crossAxis = lineAxis ? 0 : 1;

    cellsInLineWithO.forEach(cell => {
      const crossCells: Cell[] = this.store.cellsByOptionAtIndex(cell.optionIds?.[crossAxis] as OptionId, crossAxis);

      this.updateMasterWithCrossValues2(crossCells, lineAxis, master);
    });
  }

  private updateMasterWithCrossValues2(crossCells: Cell[], lineAxis: 0 | 1, master: Map<OptionId, CellText>) {
    crossCells?.forEach(crossCell => {
      const lineOptionId = crossCell.optionIds?.[lineAxis];

      if (crossCell.value2 && lineOptionId && !master.has(lineOptionId)) {
        master.set(lineOptionId, crossCell.value2);
      }
    });
  }

  /**
   * Follows each 'O' record in the master list to its own cross-line, adding those cells as well to the master list.
   * (If Joe was born in 1970 and has a red car, and the red car has 100K miles on it, then 1970 is associated with 100K miles)
   */
  private collectMasterCrossValuesAlongOs2(cellsInLineWithO: Cell[], master: Map<OptionId, CellText>, lineAxis: 0 | 1) {
    const crossAxis = lineAxis ? 0 : 1;

    for (let [optionId, value] of master.entries()) {
      if (value === CellText.O) {
        const crossCells: Cell[] = this.store.cellsByOptionAtIndex(optionId as OptionId, crossAxis);

        if (crossCells.length > 0) {
          cellsInLineWithO.push(crossCells[0]);
          this.updateMasterWithCrossValues2(crossCells, lineAxis, master);
        }
      }
    }
  }

  /**
   * Writes the master list's values into every 'O''s cross-line, recording each cell it changes.
   */
  private applyMasterCrossValuesToOs2(cellsInLineWithO: Cell[], master: Map<OptionId, CellText>,
                                      changedCellIds: Set<CellId>,
                                      crossAxis: 0 | 1, usedOptionIds: Set<OptionId>, featureToCrossOptions?: Map<FeatureId, Set<OptionId>>) {
    cellsInLineWithO.forEach(oCell => {
      for (let [optionId, value] of master.entries()) {
        const cellToFill = this.store.cellByOptions(oCell.optionIds?.[crossAxis] as OptionId, optionId);

        if (cellToFill && !changedCellIds.has(cellToFill.id2 as CellId) && !cellToFill.value2) {
          this.setCell2(cellToFill.id2, value, false, featureToCrossOptions);

          changedCellIds.add(cellToFill.id2);
          usedOptionIds.add(optionId);
        }
      }
    });
  }

  /**
   * If you have 5 options and 4 of those options have been marked as Xs for that row/column while the 5th is blank,
   * we deduce that the blank must be the answer and mark it with an O.
   *
   * Elimination reads a whole line at a time, and every X in one feature's block of cells sits on the
   * same two lines, so scanning per changed cell rescans the same line once per cell. Keying on the
   * line itself (the option plus the feature it is crossing, per axis) scans each one once.
   */
  private useProcessOfEliminationOnChangedLines2(featureToCrossOptions?: Map<FeatureId, Set<OptionId>>) {
    if (!featureToCrossOptions) return;

    for (const [featureId, optionIdSet] of featureToCrossOptions) {
      optionIdSet.forEach(optionId => {
        optionIdSet.delete(optionId);
        this.checkForAllXs2(optionId, featureId, featureToCrossOptions);
      });
    }
  }


  /**
   * Count the number of Xs in a feature's row or column for one option
   * @param optionId
   * @param crossFeatureId the feature whose options the line runs across
   * @param featureToCrossOptions
   * @private
   */
  private checkForAllXs2(optionId: OptionId, crossFeatureId: FeatureId,
                         featureToCrossOptions: Map<OptionId, Set<OptionId>>) {
    if (!optionId) return false;

    let emptyCellInLine: CellId | undefined = undefined;

    for (let crossOption of this.store.optionsByFeature(crossFeatureId)) {
      const cell = this.store.cellByOptions(crossOption.id2, optionId);
      if (cell?.value2 === CellText.X) {
        continue;
      }
      if (cell?.value2 === CellText.O || !!emptyCellInLine) { // if there is already an O OR this is the second blank we found
        return false;
      }
      emptyCellInLine = cell?.id2; // we found one blank - if all the others are Xs then we need to mark this cell as O
    }

    if (emptyCellInLine) {
      this.setCell2(emptyCellInLine, CellText.O, true, featureToCrossOptions);
      return true;
    }

    return false;
    // we shouldn't have to know what direction it is, because there's only ever one direction for each combination of optionId and (other) feature.
  }
}
