import {Cell, Feature, Option} from './entities.model';

export interface Snapshot {
  features: Array<Feature>;
  options: Array<Option>;
  cells: Array<Cell>;
  optionCountPerFeature: number;
}

export type SnapshotStack = Array<Snapshot>;
