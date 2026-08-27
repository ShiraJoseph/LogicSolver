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

/** Cell value before and after an update. */
type CellUpdateMoveArgs = {cellId: CellId; oldValue: CellText; newValue: CellText};

/** Option value before and after an update. */
type OptionUpdateMoveArgs = {optionId: OptionId; oldValue: string; newValue: string};

/** Feature value before and after an update */
type FeatureUpdateMoveArgs = {featureId: FeatureId, oldValue: string; newValue: string};

/** Cell values before clearing the grid */
type ClearMoveArgs = {oldCells: Array<Cell>};

/** The entities an ADD or DELETE move added or removed from the grid and the index slots they belong in. */
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
        FeatureUpdateMoveArgs
    ) :
    T extends MoveFnEnum.CLEAR ? ClearMoveArgs:
  CollectionMoveArgs;

/** One move paired with the record its own undo runs on. */
type BaseMove<T extends MoveFnEnum, E extends MoveEntityEnum = never> = {
  moveFn: T;
  moveArgs: MoveArgs<T, E>;
}

/** Every move the grid can record, told apart by `moveFn`. */
export type Move = BaseMove<MoveFnEnum.ADD>
  | BaseMove<MoveFnEnum.DELETE>
  | BaseMove<MoveFnEnum.CLEAR>
  | BaseMove<MoveFnEnum.UPDATE, MoveEntityEnum.FEATURE | MoveEntityEnum.OPTION | MoveEntityEnum.CELL>;

/** Moves waiting to be undone or redone, oldest first. */
export type MoveStack = Array<Move>;
