import {type} from '@ngrx/signals';
import {CellId, FeatureId, OptionId, UUID} from '../types/entities.model';
import {entityConfig} from '@ngrx/signals/entities';
import {ARROW_DOWN_KEY, ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY} from '../constants/keyboard.const';

/** An entity config that keys a collection on its entities' own `id`. */
export const toEntityConfig = <T extends {id: UUID}, C extends string>(collection: C) =>
  entityConfig({
    entity: type<T>(),
    collection,
    selectId: (entity: T) => entity.id as UUID,
  });

/**
 * Adds a feature's options to the end of an axis, recording the slot each one lands in.
 * @param optionIds
 * @param axisOptionIds
 * @param axisOptionPositions
 */
const pushAxisOptions = (optionIds: Array<OptionId>, axisOptionIds: Array<OptionId>, axisOptionPositions: Map<OptionId, number>) => {
  optionIds.forEach(optionId => {
    axisOptionPositions.set(optionId, axisOptionIds.length);
    axisOptionIds.push(optionId);
  });
};

/**
 * The features and options along both axes of the grid, in the order it lays them out, with each option mapped
 * to its slot on its axis. The top axis takes every feature after the first, left to right; the left axis takes
 * the first feature, then the rest in reverse order. One pass fills all five, reading the left axis backwards
 * out of the same step.
 * @param featureIds
 * @param optionIdsByFeature
 */
export const buildGridAxes = (featureIds: Array<FeatureId>, optionIdsByFeature: (featureId: FeatureId) => Array<OptionId>) => {
  const leftFeatureIds: Array<FeatureId> = [];
  const leftOptionIds: Array<OptionId> = [];
  const topOptionIds: Array<OptionId> = [];
  const leftOptionPositions = new Map<OptionId, number>();
  const topOptionPositions = new Map<OptionId, number>();

  if (featureIds.length) {
    leftFeatureIds.push(featureIds[0]);
    pushAxisOptions(optionIdsByFeature(featureIds[0]), leftOptionIds, leftOptionPositions);
  }

  for (let i = 1; i < featureIds.length; i++) {
    pushAxisOptions(optionIdsByFeature(featureIds[i]), topOptionIds, topOptionPositions);

    const leftIndex = featureIds.length - i;

    if (leftIndex > 1) {
      leftFeatureIds.push(featureIds[leftIndex]);
      pushAxisOptions(optionIdsByFeature(featureIds[leftIndex]), leftOptionIds, leftOptionPositions);
    }
  }

  return {leftFeatureIds, leftOptionIds, topOptionIds, leftOptionPositions, topOptionPositions};
};

/**
 * The cell one step from this one under the arrow key, and nothing where the grid runs out.
 * @param optionIds
 * @param arrowKey
 * @param gridAxes
 * @param cellIdByOptions
 */
export const findNeighborCellId = (
  optionIds: Array<OptionId>,
  arrowKey: string,
  {leftOptionIds, topOptionIds, leftOptionPositions, topOptionPositions}: ReturnType<typeof buildGridAxes>,
  cellIdByOptions: (leftOptionId: OptionId, topOptionId: OptionId) => CellId | undefined
) => {
  const [leftOptionId, topOptionId] = optionIds;
  const rowIndex = leftOptionPositions.get(leftOptionId)!;
  const columnIndex = topOptionPositions.get(topOptionId)!;
  const cellIdAt = (leftId?: OptionId, topId?: OptionId) => leftId && topId ? cellIdByOptions(leftId, topId) : undefined;

  return {
    [ARROW_LEFT_KEY]: cellIdAt(leftOptionId, topOptionIds[columnIndex - 1]),
    [ARROW_RIGHT_KEY]: cellIdAt(leftOptionId, topOptionIds[columnIndex + 1]),
    [ARROW_UP_KEY]: cellIdAt(leftOptionIds[rowIndex - 1], topOptionId),
    [ARROW_DOWN_KEY]: cellIdAt(leftOptionIds[rowIndex + 1], topOptionId)
  }[arrowKey];
};
