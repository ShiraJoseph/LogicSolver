import {patchState, signalStore, type, withComputed, withMethods, withState} from '@ngrx/signals';
import {entityConfig, withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {Cell, Feature, FeatureId, Option, UUID} from './entities.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';

const toEntityConfig = <T extends { id2: UUID }, C extends string>(collection: C) =>
  entityConfig({
    entity: type<T>(),
    collection,
    selectId: (entity: T) => entity.id2 as UUID,
  });

const featureConfig = toEntityConfig<Feature, 'feature'>('feature');
const optionConfig = toEntityConfig<Option, 'option'>('option');
const cellConfig = toEntityConfig<Cell, 'cell'>('cell');

interface DataState {
  optionCountPerFeature: number;
}

export const DataStore = signalStore(
  {providedIn: 'root'},
  withState<DataState>({optionCountPerFeature: 0}),
  withEntities(featureConfig),
  withEntities(optionConfig),
  withEntities(cellConfig),
  withEntityAccessors(featureConfig, optionConfig, cellConfig),
  withEntityRelationship({...featureConfig, count: 1, selectId: 'id2'},
    {...optionConfig, count: 'many', selectId: 'id2', selectForeignId: 'featureId2'}),
  withEntityRelationship({...optionConfig, count: 2, selectId: 'id2'}, {...cellConfig, count: 'many', selectId: 'id2', selectForeignId: 'optionIds'}),
  withTransitiveRelationship({from: 'feature', to: 'cell', through: 'option', selectFromId: 'id2', selectToId: 'id2'}),
  withMethods((store) => ({
    setOptionCountPerFeature: (count: number) => {
      patchState(store, {optionCountPerFeature: count});
    },
  })),
  withComputed(store => ({
    featurePositions: () => {
      return new Map(store.featureIds().map((id, index) => [id, index]))
    }
  })),
  withDevtools('logicSolver')
);
