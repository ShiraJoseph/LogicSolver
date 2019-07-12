export class Cell {
  constructor () {
    this.id = `${Math.random()}`;
  }
  readonly id: string;
  public leftOption?: Option;
  public topOption?: Option;
  public value = '';
  public userEntered?: boolean;

  // public isEmpty() {
  //   return /[xoXO]/g.test(this.value);
  // }

}

export class Feature {
  constructor () {
    this.id = `${Math.random()}`;
  }
  readonly id: string;
  public name: string;
  public options?: Option[];

}

export class Option {
  constructor () {
    this.id = `${Math.random()}`;
  }
  readonly id: string;
  public name: string;
  public feature?: Feature;
}




