
import {CellText} from './tile.model';

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type CellId = UUID;
export type OptionId = UUID;
export type FeatureId = UUID;


// The relationship between entities is:
// Feature to Option is 1:many.  All Features must have the same number of options.
// Option to Cell is 1:many.  All options point to the same number of cells.
// Cell to Option is 1:2.  Every cell belongs to exactly 2 (different) options and no cell shares the same two options

export class Feature {
  id: FeatureId;
  name = '';

  constructor() {
    this.id = crypto.randomUUID();
  }
}

export class Option {
  id: OptionId;
  name = '';
  featureId?: FeatureId;

  constructor() {
    this.id = crypto.randomUUID();
  }
}

export class Cell {
  id: CellId;
  // always do left first, then top
  optionIds?: Array<OptionId>;
  userValue?: CellText;

  constructor() {
    this.id = crypto.randomUUID();
    this.userValue = CellText.EMPTY;
  }
}

