import {CellId} from './entities.model';

import {MoveStack} from './move.model';

/** The grid state that belongs to no single entity. */
export interface GridState {
  /** How many options every feature carries. */
  optionCountPerFeature: number;
  /** The cell whose buttons are open, if one of them is. */
  selectedCellId?: CellId;
  /** The moves the user has made, newest last. */
  undoStack: MoveStack;
  /** The moves the user has walked back, newest last. Recording a new move empties it. */
  redoStack: MoveStack;
}

export const initialState: GridState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
  undoStack: [],
  redoStack: [],
};
