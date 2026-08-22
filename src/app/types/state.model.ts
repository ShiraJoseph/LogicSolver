import {CellId} from './entities.model';
import {SnapshotStack} from './snapshot.model';

/** The grid state that belongs to no single entity. */
export interface GridState {
  optionCountPerFeature: number;
  selectedCellId?: CellId;
  undoStack: SnapshotStack;
  redoStack: SnapshotStack;
}

export const initialState: GridState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
  undoStack: [],
  redoStack: [],
};
