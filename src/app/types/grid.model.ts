/** The names a new grid is built from. Option names run in feature order, evenly divided between the features. */
export interface GridSeed {
  featureNames: ReadonlyArray<string>;
  optionNames: ReadonlyArray<string>;
}
