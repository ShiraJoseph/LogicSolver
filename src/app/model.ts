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

export class Option {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public name = '';
  public featureId?: number;
}

export class Match {
  public optionsIds: number [] = [];
  public antiOptionsIds: number [] = [];
}



