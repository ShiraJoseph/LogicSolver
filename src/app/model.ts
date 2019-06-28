export class Cell {
  public leftOption?: Option;
  public topOption?: Option;
  public value = '';
  public userEntered?: boolean;

  public isEmpty() {
    return /[xoXO]/g.test(this.value);
  }

}

export class Feature {
  public name: string;
  public options?: Option[];

}

export class Option {
  public name: string;
  public feature?: Feature;
}




