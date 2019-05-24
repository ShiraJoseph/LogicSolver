export class Cell {
  public option1: Option;
  public option2: Option;
  public value: string;
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




