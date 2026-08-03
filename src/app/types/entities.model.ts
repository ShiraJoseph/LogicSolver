// The relationship between entities is:
// Feature to Option is 1:many.  All Features must have the same number of options.
// Option to Cell is 1:many.  All options point to the same number of cells.
// Cell to Option is 1:2.  Every cell belongs to exactly 2 (different) options and no cell shares the same two options

import {CellText} from './tile.model';

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type CellId = UUID;
export type OptionId = UUID;
export type FeatureId = UUID;

export class Feature {
  id2: FeatureId;
  public name = '';

  constructor() {
    this.id2 = crypto.randomUUID();
  }
}

export class Option {
  id2: OptionId;
  public name = '';
  featureId2?: FeatureId;

  constructor() {
    this.id2 = crypto.randomUUID();
  }
}

export class Cell {
  id2: CellId;
  // always do left first, then top
  public optionIds?: Array<OptionId>;
  value2?: CellText;

  constructor() {
    this.id2 = crypto.randomUUID();
    this.value2 = CellText.EMPTY;
  }
}

