import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {Cell, CellId, Feature, Option} from '../types/entities.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';
import {DataState, initialState} from '../types/data.state';
import {setState, toEntityConfig} from './utils';

const featureConfig = toEntityConfig<Feature, 'feature'>('feature');
const optionConfig = toEntityConfig<Option, 'option'>('option');
const cellConfig = toEntityConfig<Cell, 'cell'>('cell');

export const DataStore = signalStore(
  {providedIn: 'root'},
  withState<DataState>(initialState),
  withEntities(featureConfig),
  withEntities(optionConfig),
  withEntities(cellConfig),
  withEntityAccessors(featureConfig, optionConfig, cellConfig),
  withEntityRelationship({...featureConfig, count: 1, selectId: 'id2'},
    {...optionConfig, count: 'many', selectId: 'id2', selectForeignId: 'featureId2'}),
  withEntityRelationship({...optionConfig, count: 2, selectId: 'id2'},
    {...cellConfig, count: 'many', selectId: 'id2', selectForeignId: 'optionIds'}),
  withTransitiveRelationship({from: 'feature', to: 'cell', through: 'option', selectFromId: 'id2', selectToId: 'id2'}),
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
