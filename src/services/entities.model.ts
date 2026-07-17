// The relationship between entities is:
// Feature to Option is 1:many.  All Features must have the same number of options.
// Option to Cell is 1:many.  All options point to the same number of cells.
// Cell to Option is 1:2.  Every cell belongs to exactly 2 (different) options and no cell shares the same two options

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type CellId = UUID;
export type OptionId = UUID;
export type FeatureId = UUID;

export class Feature {
  public id: number;
  id2: FeatureId;
  public name = '';
  public optionsIds?: number[] = []; // don't keep this for v2

  constructor() {
    this.id = Math.random();
    this.id2 = crypto.randomUUID();
  }
}

export class Option {
  public id: number;
  id2: OptionId;
  public name = '';
  public featureId?: number;
  featureId2?: FeatureId;

  constructor() {
    this.id = Math.random();
    this.id2 = crypto.randomUUID();
  }
}

export class Cell {
  public id: number;
  id2: CellId;
  // always do left first, then top
  public optionIds?: Array<OptionId>;
  public leftOptionId?: number;
  public topOptionId?: number;
  public value = '';

  constructor() {
    this.id = Math.random();
    this.id2 = crypto.randomUUID();
  }
}

