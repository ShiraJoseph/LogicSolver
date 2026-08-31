import {CellId} from './entities.model';
import {MoveStack} from './move.model';
import {CellText} from './tile.model';

/** The grid state that belongs to no single entity. */
export interface GridState {
  /** How many options every feature carries. */
  optionCountPerFeature: number;
  /** The cell that is currently active via keyboard navigation */
  selectedCellId?: CellId;
  /** The cell that was active last, which the keyboard comes back to after tabbing out of the grid */
  lastSelectedCellId?: CellId;
  /** The moves the user has made, newest last. */
  undoStack: MoveStack;
  /** The moves the user has walked back, newest last. A new move clears them. */
  redoStack: MoveStack;
  /** The values the user entered that the grid contradicts, keyed by cell. */
  invalidCellValues: Map<CellId, CellText>;
}

/** The grid state before anything is on the board. */
export const initialState: GridState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
  lastSelectedCellId: undefined,
  undoStack: [],
  redoStack: [],
  invalidCellValues: new Map(),
};
