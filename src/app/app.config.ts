import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {GRID_SEED} from './store/grid.token';
import {environment} from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {provide: GRID_SEED, useValue: environment.gridSeed},
  ],
};
