import {InjectionToken} from '@angular/core';
import {GridSeed} from '../types/grid.model';

/** The grid StoreService builds on startup. */
export const GRID_SEED = new InjectionToken<GridSeed>('GRID_SEED', {
  factory: () => ({featureNames: [], optionNames: []})
});
