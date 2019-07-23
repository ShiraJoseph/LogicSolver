export class Cell {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public leftOptionId?: number;
  public topOptionId?: number;
  public value = '';
  public userEntered?: boolean;

  // public isEmpty() {
  //   return /[xoXO]/g.test(this.value);
  // }

}

export class Feature {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public name: string;
  public optionsIds?: number [];

}

export class Option {
  constructor () {
    this.id = Math.random();
  }
  public id: number;
  public name: string;
  public featureId?: number;
  // public cells?: Cell[];
}




