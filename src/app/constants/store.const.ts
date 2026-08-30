import {Cell, Feature, Option} from '../types/entities.model';
import {toEntityConfig} from '../store/utils';

export const FEATURE_CONFIG = toEntityConfig<Feature, 'feature'>('feature');
export const OPTION_CONFIG = toEntityConfig<Option, 'option'>('option');
export const CELL_CONFIG = toEntityConfig<Cell, 'cell'>('cell');
