import {DataState} from '../types/data.state';
import {patchState, type, WritableStateSource} from '@ngrx/signals';
import {UUID} from '../types/entities.model';
import {entityConfig} from '@ngrx/signals/entities';

export const setState = <K extends keyof DataState>(store: WritableStateSource<DataState>, setKey: K) => {
  const key = `set${setKey.charAt(0).toUpperCase()}${setKey.slice(1)}`;
  return {
    [key]: (stateSlice: DataState[K]) => {
      patchState(store, {[setKey]: stateSlice});
    }
  };
};
export const toEntityConfig = <T extends { id2: UUID }, C extends string>(collection: C) =>
  entityConfig({
    entity: type<T>(),
    collection,
    selectId: (entity: T) => entity.id2 as UUID,
  });
