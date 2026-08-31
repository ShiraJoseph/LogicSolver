import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {CellId, FeatureId, OptionId} from '../types/entities.model';
import {CellText} from '../types/tile.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';
import {GridState, initialState} from '../types/state.model';
import {NON_CELL_COLUMN_COUNT} from '../constants/grid.const';
import {Move} from '../types/move.model';
import {CELL_CONFIG, FEATURE_CONFIG, OPTION_CONFIG} from '../constants/store.const';
import {buildGridAxes, findNeighborCellId} from './utils';

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
    /** Sets the cell the keyboard is on, or takes it off every cell when given nothing, remembering the last one. */
    setSelectedCellId: (selectedCellId: CellId | undefined) => {
      patchState(store, {selectedCellId, lastSelectedCellId: selectedCellId ?? store.lastSelectedCellId?.()});
    },
    /** Sets the value the grid contradicts on this cell, or drops it when given none. */
    setInvalidCellValue: (cellId: CellId, invalidValue: CellText) => {
      const invalidCellValues = new Map(store.invalidCellValues());

      if (invalidValue) {
        invalidCellValues.set(cellId, invalidValue);
      } else {
        invalidCellValues.delete(cellId);
      }

      patchState(store, {invalidCellValues});
    },
    /** Replaces every value the grid contradicts at once. */
    setInvalidCellValues: (invalidCellValues: Map<CellId, CellText>) => {
      patchState(store, {invalidCellValues});
    },
    /** Adds a new move to the undo stack and clears the redo stack */
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
    /** Each feature id mapped to its grid position */
    featurePositions: () => {
      const positionMap = new Map();

      store.featureIds().forEach((id, index) => positionMap.set(id, index));

      return positionMap;
    },
    /** A column per option of every feature after the first, plus the header and button columns. */
    columnCount: () => store.optionCountPerFeature() * (store.featureCount() - 1) + NON_CELL_COLUMN_COUNT,
    /** Whether there is a move left to walk back. */
    canUndo: () => store.undoStack().length > 0,
    /** Whether there is an undone move left to make again. */
    canRedo: () => store.redoStack().length > 0,
    /** The features and options along both axes of the grid, in the order it lays them out. */
    gridAxes: () => buildGridAxes(
      store.featureIds() as Array<FeatureId>,
      featureId => store.optionIdsByFeature(featureId) as Array<OptionId>
    ),
  })),
  withComputed(store => ({
    /**
     * The cell Tab reaches: the active one, the one that was active last, or the top left corner while neither
     * of those is on the grid.
     */
    tabStopCellId: () => {
      const cellId = store.selectedCellId?.() ?? store.lastSelectedCellId?.();

      if (cellId && store.cellById(cellId)) return cellId;

      const {leftOptionIds, topOptionIds} = store.gridAxes();

      return leftOptionIds.length && topOptionIds.length ?
        store.cellIdByOptions(leftOptionIds[0], topOptionIds[0]) as CellId : undefined;
    },
  })),
  withMethods((store) => ({
    /**
     * Hands the keyboard to the cell one step from this one under the arrow key, and stays put where the grid
     * runs out.
     * @param cellId
     * @param arrowKey
     */
    selectNeighborCell: (cellId: CellId, arrowKey: string) => {
      const neighborCellId = findNeighborCellId(
        store.cellById(cellId)!.optionIds as Array<OptionId>,
        arrowKey,
        store.gridAxes(),
        (leftOptionId, topOptionId) => store.cellIdByOptions(leftOptionId, topOptionId) as CellId
      );

      if (!neighborCellId) return;

      store.setSelectedCellId(neighborCellId);
    },
  })),
  withDevtools('logicSolver')
);
