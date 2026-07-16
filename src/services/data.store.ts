import {patchState, signalStore, type, withComputed, withMethods, withState} from '@ngrx/signals';
import {entityConfig, withEntities} from '@ngrx/signals/entities';
import {Cell, Feature, FeatureId, Option, UUID} from './entities.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';

const toEntityConfig = <T extends { id2: UUID }, C extends string>(collection: C) =>
  entityConfig({
    entity: type<T>(),
    collection,
    selectId: (entity) => entity.id2,
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
  withEntityAccessors(),
  withEntityRelationship({...featureConfig, count: 1, selectId: 'id2'},
    {...optionConfig, count: 'many', selectId: 'id2'}),
  withEntityRelationship({...optionConfig, count: 2, selectId: 'id2'}, {...cellConfig, count: 'many', selectId: 'id2'}),
  withTransitiveRelationship({from: 'feature', to: 'cell', through: 'option'}),
  withMethods((store) => ({
    setOptionCountPerFeature: (count: number) => {
      patchState(store, {optionCountPerFeature: count});
    },
  })),
  withComputed(store => ({
    featurePositions: () => new Map(store.featureIds().map((id, index) => [id, index]))
  }))
);
