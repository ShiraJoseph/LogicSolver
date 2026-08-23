import {Component, computed, input, signal} from '@angular/core';
import {Tile, TileType} from '../../../types/tile.model';
import {FeatureId, OptionId} from '../../../types/entities.model';
import {BaseDirective} from '../../../directives/base.directive';
import {MIN_FEATURE_COUNT, MIN_OPTION_COUNT} from '../../../constants/grid.const';
import {BLACK} from '../../../constants/colors.const';
import {MoveArgs, MoveFnEnum} from '../../../types/move.model';

/** A feature or option label on the top or left axis, with its rename and delete controls. */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent extends BaseDirective {
  tile = input.required<Tile>();

  /** Whether the delete button on the header should be visible */
  shouldShowMinus = signal(false);

  /** The index of the current feature in the feature list */
  featureIndex = computed(() => this.store.featurePositions().get(this.tile().entityId as FeatureId));

  /** Whether the current header is a feature header or, if false, an option header */
  isFeature = computed(() => [TileType.LEFT_FEATURE_HEADER, TileType.TOP_FEATURE_HEADER].includes(this.tile().type!));

  /** Fill color based on feature index */
  backgroundColor = computed(() => this.isFeature() ?
    this.colorService.getFeatureColor(this.featureIndex()) :
    this.colorService.getOptionColor(this.tile()));

  /** The label color for the header */
  textColor = computed(() => this.isFeature() ? this.colorService.getFeatureTextColor(this.featureIndex()) : BLACK);

  /** True for the headers whose label runs down the tile rather than across it. */
  isVertical = computed(() => [TileType.TOP_OPTION_HEADER, TileType.LEFT_FEATURE_HEADER].includes(this.tile().type!));

  /** True once deleting would leave the grid with fewer than two features, or fewer than two options per feature. */
  isDeleteDisabled = computed(() => this.isFeature() ?
    this.store.featureCount() <= MIN_FEATURE_COUNT :
    this.store.optionCountPerFeature() <= MIN_OPTION_COUNT);

  /** Shows the delete button on this header. */
  showMinus = () => this.shouldShowMinus.set(true);

  /** Hides the delete button on this header. */
  hideMinus = () => this.shouldShowMinus.set(false);

  /**
   * Renames the feature or option this header stands for, unless the name is unchanged.
   * @param event
   */
  updateHeader(event: Event) {
    this.hideMinus();

    const newValue = (event.target as HTMLInputElement).value;
    const oldValue = this.tile().text;

    if (this.tile().entityId == undefined || newValue === oldValue) return;

    if (this.isFeature()) {
      const featureId = this.tile().entityId as FeatureId;
      this.store.updateFeature(featureId, {name: newValue});
      this.store.recordMove({moveFn: MoveFnEnum.UPDATE, moveArgs: {featureId, oldValue, newValue}});
    } else {
      const optionId = this.tile().entityId as OptionId;
      this.store.updateOption(optionId, {name: newValue});
      this.store.recordMove({moveFn: MoveFnEnum.UPDATE, moveArgs: {optionId, oldValue, newValue}});
    }
  }

  /**
   * Deletes the feature from state if this is a feature header
   * or the option at the current option's index from every feature if it is an option header
   */
  deleteHeader() {
    if (this.tile().entityId == undefined) return;

    let moveArgs: MoveArgs<MoveFnEnum.DELETE>;

    if (this.isFeature()) {
      moveArgs = this.storeService.deleteFeature(this.tile().entityId as FeatureId) as MoveArgs<MoveFnEnum.DELETE>;
    } else {
      moveArgs = this.storeService.deleteOption(this.tile().entityId as OptionId) as MoveArgs<MoveFnEnum.DELETE>;
    }

    this.store.recordMove({moveFn: MoveFnEnum.DELETE, moveArgs});
  }
}
