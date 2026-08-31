import {GridSeed} from '../types/grid.model';
import {MOCK_FEATURE_NAMES, MOCK_SMALL_FEATURE_NAMES} from './feature.mock';
import {MOCK_OPTION_NAMES, MOCK_SMALL_OPTION_NAMES} from './option.mock';

/** 11 features of 9 options. */
export const MOCK_GRID_SEED: GridSeed = {
  featureNames: MOCK_FEATURE_NAMES,
  optionNames: MOCK_OPTION_NAMES
};

/** 3 features of 3 options. */
export const MOCK_SMALL_GRID_SEED: GridSeed = {
  featureNames: MOCK_SMALL_FEATURE_NAMES,
  optionNames: MOCK_SMALL_OPTION_NAMES
};

/** 2 features of 4 options. */
export const MOCK_FOUR_OPTION_GRID_SEED: GridSeed = {
  featureNames: ['Pet', 'Vehicle'],
  optionNames: ['Cat', 'Dog', 'Fish', 'Bird', 'Bike', 'Canoe', 'Tractor', 'Kayak']
};
