import {inject, Service} from '@angular/core';
import {Cell, Feature, FeatureId, Option, OptionId} from '../types/entities.model';
import {GridStore} from './store';
import {GridSeed} from '../types/grid.model';
import {CellText} from '../types/tile.model';
import {GRID_SEED} from './grid.token';


/**
 * Helper functions for updating store entities
 */
@Service()
export class StoreService {
  store = inject(GridStore);

  constructor() {
    this.populateGridStore(inject(GRID_SEED));
  }

  addNewFeature(name?: string) {
    const feature = new Feature();

    if (name) {
      feature.name = name;
    }

    this.store.addFeature(feature);

    for (let i = 0; i < this.store.optionCountPerFeature(); i++) {
      this.addOptionWithCellsToFeature(feature);
    }
  }

  addNewOptionToAllFeatures() {
    this.store.setOptionCountPerFeature(this.store.optionCountPerFeature() + 1);

    this.store.features().forEach((feature: Feature) => {
      this.addOptionWithCellsToFeature(feature);
    });
  }

  deleteOption(optionId: OptionId) {
    const indexToRemove = this.store.indexOfFeatureOption(optionId);

    this.store.features().forEach((feature: Feature) => {
      const matchingOption = this.store.optionIdsByFeature(feature)[indexToRemove];

      this.store.removeCells(this.store.cellsByOption(matchingOption));
      this.store.removeOption(matchingOption);
    });

    this.store.setOptionCountPerFeature(this.store.optionCountPerFeature() - 1);
  }

  deleteFeature(featureId: FeatureId) {
    this.store.removeCells(this.store.cellsByFeature(featureId));
    this.store.removeOptions(this.store.optionsByFeature(featureId));
    this.store.removeFeature(featureId);
  }

  /**
   * Clears all cells in the grid. (Leaves features and options as they are)
   */
  clearCells() {
    this.store.updateAllCells({userValue: CellText.EMPTY});
  }


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
  }

  /**
   * Fills an empty store with the seeded features and their options.
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
