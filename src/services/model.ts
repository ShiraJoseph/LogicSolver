export class Cell {
  public id: number;
  public leftOptionId?: number;
  public topOptionId?: number;
  public value = '';

  constructor() {
    this.id = Math.random();
  }
}

export class Feature {
  public id: number;
  public name = '';
  public optionsIds?: number[] = [];

  constructor() {
    this.id = Math.random();
  }
}

export class Option {
  public id: number;
  public name = '';
  public featureId?: number;

  constructor() {
    this.id = Math.random();
  }
}
