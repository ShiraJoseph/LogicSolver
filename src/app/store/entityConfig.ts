import {type} from '@ngrx/signals';
import {Cell, Feature, Option, UUID} from '../types/entities.model';
import {entityConfig} from '@ngrx/signals/entities';

export const toEntityConfig = <T extends { id: UUID }, C extends string>(collection: C) =>
  entityConfig({
    entity: type<T>(),
    collection,
    selectId: (entity: T) => entity.id as UUID,
  });

export const featureConfig = toEntityConfig<Feature, 'feature'>('feature');
export const optionConfig = toEntityConfig<Option, 'option'>('option');
export const cellConfig = toEntityConfig<Cell, 'cell'>('cell');
