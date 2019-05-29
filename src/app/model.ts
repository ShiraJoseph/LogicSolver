export class Cell {
  public horizontalOption: Option;
  public verticalOption: Option;
  public value: string;
  public index: string;
  public userEntered: boolean;

  public isEmpty() {
    return /[xoXO]/g.test(this.value);
  }

}

export class Feature {
  public name: string;
  public options: Option[];

}

export class Option {
  public name: string;
  public feature: Feature;
}




