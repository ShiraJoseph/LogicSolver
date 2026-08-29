import {CellId} from './entities.model';
import {MoveStack} from './move.model';

/** The grid state that belongs to no single entity. */
export interface GridState {
  /** How many options every feature carries. */
  optionCountPerFeature: number;
  /** The cell that is currently active via keyboard navigation */
  selectedCellId?: CellId;
  /** The moves the user has made, newest last. */
  undoStack: MoveStack;
  /** The moves the user has walked back, newest last. A new move clears them. */
  redoStack: MoveStack;
}

/** The grid state before anything is on the board. */
export const initialState: GridState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
  undoStack: [],
  redoStack: [],
};
