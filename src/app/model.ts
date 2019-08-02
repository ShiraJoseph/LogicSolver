export class Cell {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public leftOptionId?: number;
  public topOptionId?: number;
  public value = '';
  public userEntered?: boolean;
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




