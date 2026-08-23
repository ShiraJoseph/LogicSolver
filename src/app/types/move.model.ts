import {Cell, CellId, Feature, FeatureId, Option, OptionId} from './entities.model';
import {CellText} from './tile.model';

/** What a move did to the grid, and so which operation undoes it. */
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

/** The cell that was written to, with the value on each side of the change. */
type CellUpdateMoveArgs = {cellId: CellId; oldValue: CellText; newValue: CellText};

/** The option that was renamed, with the name on each side of the change. */
type OptionUpdateMoveArgs = {optionId: OptionId; oldValue: string; newValue: string};

/** The feature that was renamed, with the name on each side of the change. */
type FeatureUpdateMoveArgs = {featureId: FeatureId, oldValue: string; newValue: string};

/** Every cell as it stood before the clear. Redoing needs no record, since a cleared grid is always empty. */
type ClearMoveArgs = {oldCells: Array<Cell>};

/** The entities an ADD or DELETE move put on the grid or took off it, and the slots they belong in. */
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

/** Everything an undo needs to put the grid back, in the shape the move that was made calls for. */
export type MoveArgs<T extends MoveFnEnum, E extends MoveEntityEnum = never> =
  T extends MoveFnEnum.UPDATE ? (
    E extends MoveEntityEnum.CELL ? CellUpdateMoveArgs:
      E extends MoveEntityEnum.OPTION ? OptionUpdateMoveArgs :
        E extends MoveEntityEnum.FEATURE ? FeatureUpdateMoveArgs : never
    ) :
    T extends MoveFnEnum.CLEAR ? ClearMoveArgs:
  CollectionMoveArgs;

/** One move paired with the record its own undo runs on. */
type BaseMove<T extends MoveFnEnum = never, E extends MoveEntityEnum = never> = {
  moveFn: T;
  moveArgs: MoveArgs<T, E>;
}

/** Every move the grid can record, told apart by `moveFn`. */
export type Move = BaseMove<MoveFnEnum.ADD>
  | BaseMove<MoveFnEnum.DELETE>
  | BaseMove<MoveFnEnum.CLEAR>
  | BaseMove<MoveFnEnum.UPDATE, MoveEntityEnum>;

/** Moves waiting to be undone or redone, oldest first. */
export type MoveStack = Array<Move>;
