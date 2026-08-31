import {Cell, CellId, Feature, FeatureId, Option, OptionId} from './entities.model';
import {CellText} from './tile.model';

/** The grid operation a move applied */
export enum MoveFnEnum {
  ADD,
  UPDATE,
  DELETE,
  CLEAR,
}

/** Which entity an UPDATE move renamed or rewrote. */
export enum MoveEntityEnum {
  FEATURE,
  OPTION,
  CELL,
}

/**
 * Cell value before and after an update, on whichever side of the split it sat.
 * At most one of each pair is filled: a value lives either on the cell or in the invalid map, never both.
 */
type CellUpdateMoveArgs = {
  cellId: CellId;
  oldValue: CellText;
  oldInvalidValue: CellText;
  newValue: CellText;
  newInvalidValue: CellText;
  /** The cells whose held-aside value the move put back, and the value each of them took. */
  newlyValidCells: Map<CellId, CellText>;
};

/** Option value before and after an update. */
type OptionUpdateMoveArgs = {optionId: OptionId; oldValue: string; newValue: string};

/** Feature value before and after an update */
type FeatureUpdateMoveArgs = {featureId: FeatureId, oldValue: string; newValue: string};

/** Cell values and held-aside invalid values before clearing the grid */
type ClearMoveArgs = {oldCells: Array<Cell>; oldInvalidCellValues: Map<CellId, CellText>};

/** The entities an ADD or DELETE move changed, with their index slots */
type CollectionMoveArgs =  {
  features?: Array<Feature>;
  options?: Array<Option>;
  cells?: Array<Cell>;
  /** The option count per feature while these options exist. Removing them applies one less. */
  optionCountPerFeature?: number;
  /** The slot the recorded feature sits in, so restoring it puts the column back where it was. */
  featureIndex?: number;
  /** The slot the recorded options sit in within their features, for the same reason. */
  optionIndex?: number;
};

/** The record an undo needs, shaped by the move */
export type MoveArgs<T extends MoveFnEnum, E extends MoveEntityEnum = never> =
  T extends MoveFnEnum.UPDATE ? (
    E extends MoveEntityEnum.CELL ? CellUpdateMoveArgs:
      E extends MoveEntityEnum.OPTION ? OptionUpdateMoveArgs :
        FeatureUpdateMoveArgs
    ) :
    T extends MoveFnEnum.CLEAR ? ClearMoveArgs:
  CollectionMoveArgs;

/** One move paired with its undo record */
type BaseMove<T extends MoveFnEnum, E extends MoveEntityEnum = never> = {
  moveFn: T;
  moveArgs: MoveArgs<T, E>;
}

/** The moves the grid can record, distinguished by `moveFn` */
export type Move = BaseMove<MoveFnEnum.ADD>
  | BaseMove<MoveFnEnum.DELETE>
  | BaseMove<MoveFnEnum.CLEAR>
  | BaseMove<MoveFnEnum.UPDATE, MoveEntityEnum.FEATURE | MoveEntityEnum.OPTION | MoveEntityEnum.CELL>;

/** Moves waiting to be undone or redone, oldest first. */
export type MoveStack = Array<Move>;
