import {CellText} from './tile.model';

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type CellId = UUID;
export type OptionId = UUID;
export type FeatureId = UUID;

// The relationship between entities is:
// Feature to Option is 1:many.  All Features must have the same number of options.
// Option to Cell is 1:many.  All options point to the same number of cells.
// Cell to Option is 1:2.  Every cell belongs to exactly 2 (different) options and no cell shares the same two options

/** A category down one axis of the grid, such as Pet. */
export class Feature {
  id: FeatureId;
  name = '';

  constructor() {
    this.id = crypto.randomUUID();
  }
}

/** One of the values a feature can take, such as Cat. */
export class Option {
  id: OptionId;
  name = '';
  featureId?: FeatureId;

  constructor() {
    this.id = crypto.randomUUID();
  }
}

/** The square where two options from different features cross. */
export class Cell {
  id: CellId;
  /** The two options this cell pairs, left axis first and top axis second. */
  optionIds?: Array<OptionId>;
  /** The X or O the user entered here. Everything else the cell shows is deduced. */
  userValue?: CellText;

  constructor() {
    this.id = crypto.randomUUID();
    this.userValue = CellText.EMPTY;
  }
}
