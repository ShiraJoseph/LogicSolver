export class Cell {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public leftOptionId?: number;
  public topOptionId?: number;
  public value = '';
}

export class Feature {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public name = '';
  public optionsIds?: number [] = [];

}

export class State {
  constructor (cells: Cell[], options: Option[], features: Feature[]) {
    this.cells = cells;
    this.options = options;
    this.features = features;
  }
  public cells: Cell[];
  public options: Option[];
  public features: Feature[];
}

export class Option {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public name = '';
  public featureId?: number;
}



