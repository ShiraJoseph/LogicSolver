import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {CellId} from '../types/entities.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';
import {GridState, initialState} from '../types/state.model';
import {cellConfig, featureConfig, optionConfig} from './entityConfig';

export const GridStore = signalStore(
  {providedIn: 'root', protectedState: false},
  withState<GridState>(initialState),
  withEntities(featureConfig),
  withEntities(optionConfig),
  withEntities(cellConfig),
  withEntityAccessors(featureConfig, optionConfig, cellConfig),
  withEntityRelationship({...featureConfig, count: 1}, {...optionConfig, count: 'many'}),
  withEntityRelationship({...optionConfig, count: 2}, {...cellConfig, count: 'many'}),
  withTransitiveRelationship({from: 'feature', to: 'cell', through: 'option'}),
  withMethods((store) => ({
    setOptionCountPerFeature: (optionCountPerFeature: number) => {
      patchState(store, {optionCountPerFeature});
    },
    setSelectedCellId: (selectedCellId: CellId | undefined) => {
      patchState(store, {selectedCellId});
    }
  })),
  withComputed(store => ({
    featurePositions: () => {
      return new Map(store.featureIds().map((id, index) => [id, index]));
    }
  })),
  withDevtools('logicSolver')
);
