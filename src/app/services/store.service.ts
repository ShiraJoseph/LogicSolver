import {inject, Service} from '@angular/core';
import {Cell, CellId, Feature, FeatureId, Option, OptionId} from '../types/entities.model';
import {GridStore} from '../store/store';
import {GridSeed} from '../types/grid.model';
import {CellText} from '../types/tile.model';
import {GRID_SEED} from '../store/grid.token';
import {LogicService} from './logic.service';
import {MoveFnEnum} from '../types/move.model';

/** Helper functions for updating store entities */
@Service()
export class StoreService {
  store = inject(GridStore);
  logicService = inject(LogicService);

  constructor() {
    this.populateGridStore(inject(GRID_SEED));
  }

  /**
   * Adds a feature with a full set of options, each paired with every option of the existing features.
   * @param name
   */
  addNewFeature(name?: string) {
    const feature = new Feature();
    const allNewCells: Array<Cell> = [];
    const allNewOptions: Array<Option> = [];

    if (name) {
      feature.name = name;
    }

    this.store.addFeature(feature);

    for (let i = 0; i < this.store.optionCountPerFeature(); i++) {
      const {options, cells} = this.addOptionWithCellsToFeature(feature);
      allNewOptions.push(...options);
      allNewCells.push(...cells);
    }

    return {features: [feature], options: allNewOptions, cells: allNewCells};
  }

  /**
   * Increases the option count for each feature by one.
   */
  addNewOptionToAllFeatures() {
    const newOptions: Array<Option> = [];
    const allNewCells: Array<Cell> = [];
    const optionCountPerFeature = this.store.optionCountPerFeature() + 1;

    this.store.setOptionCountPerFeature(optionCountPerFeature);

    this.store.features().forEach((feature: Feature) => {
      const {options, cells} = this.addOptionWithCellsToFeature(feature);
      newOptions.push(...options);
      allNewCells.push(...cells);
    });

    return {options: newOptions, cells: allNewCells, optionCountPerFeature};
  }

  /**
   * Removes the option in the same slot from every feature, so they keep matching counts.
   * @param optionId
   */
  deleteOption(optionId: OptionId) {
    const oldOptions: Array<Option> = [];
    const oldCells: Array<Cell> = [];
    const optionIndex = this.store.indexOfFeatureOption(optionId);

    this.store.features().forEach((feature: Feature) => {
      const optionToDelete = this.store.optionsByFeature(feature)[optionIndex];
      const cellsToDelete = this.store.cellsByOption(optionToDelete);
      oldOptions.push(optionToDelete);
      oldCells.push(...cellsToDelete);
      this.store.removeCells(cellsToDelete);
      this.store.removeOption(optionToDelete);
    });

    const optionCountPerFeature = this.store.optionCountPerFeature();
    this.store.setOptionCountPerFeature(optionCountPerFeature - 1);

    return {options: oldOptions, cells: oldCells, optionCountPerFeature, optionIndex};
  }

  /**
   * Removes the feature along with its options and their cells.
   * @param featureId
   */
  deleteFeature(featureId: FeatureId) {
    const oldFeature = this.store.featureById(featureId);

    if (!oldFeature) return;

    const oldOptions = this.store.optionsByFeature(featureId);
    const oldCells = this.store.cellsByFeature(featureId);
    const featureIndex = this.store.featureIds().indexOf(oldFeature?.id as FeatureId);
    this.store.removeCells(oldCells);
    this.store.removeOptions(oldOptions);
    this.store.removeFeature(featureId);

    return {features: [oldFeature], options: oldOptions, cells: oldCells, featureIndex};
  }

  /**
   * Clears all cells in the grid, along with every held-aside value. (Leaves features and options as they are)
   */
  clearCells() {
    const oldCells = this.store.cells().filter(cell => !!cell.userValue);

    this.store.updateCells(oldCells, {userValue: CellText.EMPTY});
    this.store.setInvalidCellValues(new Map());

    return {cells: oldCells};
  }

  /**
   * Writes the value into the cell and records it as one move, leaving a cell already showing that value alone.
   * A value the grid contradicts comes straight back off the cell and is held aside instead.
   * @param cellId
   * @param newValue
   */
  updateCellValue(cellId: CellId, newValue: CellText) {
    const oldValue = this.store.cellById(cellId)!.userValue as CellText;
    const oldInvalidValue = this.store.invalidCellValues().get(cellId) ?? CellText.EMPTY;

    if (newValue === (oldInvalidValue || this.logicService.deducedValue(cellId))) return;

    this.store.setInvalidCellValue(cellId, CellText.EMPTY);
    this.store.updateCell(cellId, {userValue: newValue});

    const isContradicted = this.logicService.isContradicted();

    if (isContradicted) {
      this.store.updateCell(cellId, {userValue: CellText.EMPTY});
      this.store.setInvalidCellValue(cellId, newValue);
    }

    const newlyValidCells = this.promoteInvalidCellValues();

    this.store.recordMove({
      moveFn: MoveFnEnum.UPDATE,
      moveArgs: {
        cellId,
        oldValue,
        oldInvalidValue,
        newValue: isContradicted ? CellText.EMPTY : newValue,
        newInvalidValue: isContradicted ? newValue : CellText.EMPTY,
        newlyValidCells
      }
    });
  }

  /**
   * Puts back every held-aside value the deductions no longer contradict, leaves the rest where they are,
   * and hands back the cells it put a value back on.
   */
  promoteInvalidCellValues(): Map<CellId, CellText> {
    const newlyValidCells = new Map<CellId, CellText>();

    this.store.invalidCellValues().forEach((invalidValue, cellId) => {
      const deducedValue = this.logicService.deducedValue(cellId);

      if (deducedValue && deducedValue !== invalidValue) return;

      this.store.updateCell(cellId, {userValue: invalidValue});

      if (deducedValue !== invalidValue && this.logicService.isContradicted()) {
        this.store.updateCell(cellId, {userValue: CellText.EMPTY});

        return;
      }

      this.store.setInvalidCellValue(cellId, CellText.EMPTY);
      newlyValidCells.set(cellId, invalidValue);
    });

    return newlyValidCells;
  }

  /**
   * Adds an option and a cell for each option in the other features, ordered so the higher feature sits on the left.
   * @param feature
   * @param name
   * @private
   */
  private addOptionWithCellsToFeature(feature: Feature, name?: string) {
    const option = new Option();
    option.featureId = feature.id;

    if (name != undefined) {
      option.name = name;
    }

    // todo: replace with store.indexOfFeature once I've added it to signalkin
    const featureIndex = this.store.featurePositions().get(feature.id);

    if (featureIndex == undefined) {
      throw new Error('cannot find feature with id ' + feature.id);
    }

    const newCells: Cell[] = [];

    this.store.options().forEach(existingOption => {
      if (existingOption.featureId && existingOption.featureId !== feature.id) {
        const cell = new Cell();

        const existingFeatureIndex = this.store.featurePositions().get(existingOption.featureId);

        if (existingFeatureIndex == undefined) {
          throw new Error('Cannot find feature with id ' + existingOption.featureId);
        }

        // if the option is from a feature at index 0, we know it is on the left;
        // otherwise the left option is whichever's feature index is higher
        const leftOptionId = existingFeatureIndex === 0 ? existingOption.id :
          featureIndex === 0 || featureIndex > existingFeatureIndex ? option.id : existingOption.id;

        cell.optionIds = [leftOptionId, leftOptionId === existingOption.id ? option.id : existingOption.id];

        newCells.push(cell);
      }
    });

    this.store.addCells(newCells);
    this.store.addOption(option);

    return {options: [option], cells: newCells};
  }

  /**
   * Fills an empty store with the seeded features and their options.
   * @private
   */
  private populateGridStore({featureNames, optionNames}: GridSeed) {
    if (!featureNames.length) return;

    const optionCount = Math.floor(optionNames.length / featureNames.length);
    this.store.setOptionCountPerFeature(optionCount);

    featureNames.forEach((featureName, featureIndex) => {
      const newFeature = new Feature();
      newFeature.name = featureName;
      this.store.addFeature(newFeature);

      for (let i = 0; i < optionCount; i++) {
        this.addOptionWithCellsToFeature(newFeature, optionNames[featureIndex * optionCount + i]);
      }
    });
  }
}
