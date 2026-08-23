import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {CellId} from '../types/entities.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';
import {GridState, initialState} from '../types/state.model';
import {CELL_CONFIG, FEATURE_CONFIG, OPTION_CONFIG} from './entity-config';
import {NON_CELL_COLUMN_COUNT} from '../constants/grid.const';
import {Move} from '../types/move.model';

/** Holds the features, options and cells of the grid, and the relationships between them. */
export const GridStore = signalStore(
  {providedIn: 'root', protectedState: false},
  withState<GridState>(initialState),
  withEntities(FEATURE_CONFIG),
  withEntities(OPTION_CONFIG),
  withEntities(CELL_CONFIG),
  withEntityAccessors(FEATURE_CONFIG, OPTION_CONFIG, CELL_CONFIG),
  withEntityRelationship({...FEATURE_CONFIG, count: 1}, {...OPTION_CONFIG, count: 'many'}),
  withEntityRelationship({...OPTION_CONFIG, count: 2}, {...CELL_CONFIG, count: 'many'}),
  withTransitiveRelationship({from: 'feature', to: 'cell', through: 'option'}),
  withMethods((store) => ({
    /** Sets how many options every feature carries. */
    setOptionCountPerFeature: (optionCountPerFeature: number) => {
      patchState(store, {optionCountPerFeature});
    },
    /** Sets the cell whose buttons are open, or closes them all when given nothing. */
    setSelectedCellId: (selectedCellId: CellId | undefined) => {
      patchState(store, {selectedCellId});
    },
    /** Adds a move the user just made to the undo stack, and drops the redo stack it branches away from. */
    recordMove: (move: Move) => {
      patchState(store, {redoStack: [], undoStack: [...store.undoStack(), move]});
    },
    /** Takes the newest move off the undo stack, hands it back, and parks it on the redo stack. */
    popUndoMove: () => {
      const move = store.undoStack().at(-1);
      if (!move) return undefined;

      patchState(store, {
        undoStack: store.undoStack().slice(0, -1),
        redoStack: [...store.redoStack(), move]
      });

      return move;
    },
    /** Takes the newest undone move off the redo stack, hands it back, and parks it on the undo stack. */
    popRedoMove: () => {
      const move = store.redoStack().at(-1);
      if (!move) return undefined;

      patchState(store, {
        redoStack: store.redoStack().slice(0, -1),
        undoStack: [...store.undoStack(), move]
      });

      return move;
    },
  })),
  withComputed(store => ({
    /** Each feature id mapped to the order its feature appears in. */
    featurePositions: () => {
      const positionMap = new Map();
      store.featureIds().forEach((id, index) => {
        if (id && index != undefined) {
          positionMap.set(id, index);
        }
      });
      return positionMap;
    },
    /** A column per option of every feature after the first, plus the header and button columns. */
    columnCount: () => store.optionCountPerFeature() * (store.featureCount() - 1) + NON_CELL_COLUMN_COUNT,
    /** Whether there is a move left to walk back. */
    canUndo: () => store.undoStack().length > 0,
    /** Whether there is an undone move left to make again. */
    canRedo: () => store.redoStack().length > 0,
  })),
  withDevtools('logicSolver')
);
