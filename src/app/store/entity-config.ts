import {type} from '@ngrx/signals';
import {Cell, Feature, Option, UUID} from '../types/entities.model';
import {entityConfig} from '@ngrx/signals/entities';

/** An entity config that keys a collection on its entities' own `id`. */
export const toEntityConfig = <T extends {id: UUID}, C extends string>(collection: C) =>
  entityConfig({
    entity: type<T>(),
    collection,
    selectId: (entity: T) => entity.id as UUID,
  });

export const FEATURE_CONFIG = toEntityConfig<Feature, 'feature'>('feature');
export const OPTION_CONFIG = toEntityConfig<Option, 'option'>('option');
export const CELL_CONFIG = toEntityConfig<Cell, 'cell'>('cell');
