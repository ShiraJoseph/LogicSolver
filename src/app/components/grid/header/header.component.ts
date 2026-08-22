import {Component, computed, input, signal} from '@angular/core';
import {Tile, TileType} from '../../../types/tile.model';
import {FeatureId, OptionId} from '../../../types/entities.model';
import {BaseDirective} from '../../../directives/base.directive';
import {MIN_FEATURE_COUNT, MIN_OPTION_COUNT} from '../../../constants/grid.const';
import {BLACK} from '../../../constants/colors.const';

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
  featurePosition = computed(() => this.store.featurePositions().get(this.tile().entityId as FeatureId));

  /** Whether the current header is a feature header or, if false, an option header */
  isFeature = computed(() => [TileType.LEFT_FEATURE_HEADER, TileType.TOP_FEATURE_HEADER].includes(this.tile().type!));

  /** Fill color based on feature index */
  backgroundColor = computed(() => this.isFeature() ?
    this.colorService.getFeatureColor(this.featurePosition()) :
    this.colorService.getOptionColor(this.tile()));

  /** The label color for the header */
  textColor = computed(() => this.isFeature() ? this.colorService.getFeatureTextColor(this.featurePosition()) : BLACK);

  /** True for the headers whose label runs down the tile rather than across it. */
  isVertical = computed(() => [TileType.TOP_OPTION_HEADER, TileType.LEFT_FEATURE_HEADER].includes(this.tile().type!));

  /** True once deleting would leave the grid with fewer than two features, or fewer than two options per feature. */
  isDeleteDisabled = computed(() => this.isFeature() ?
    this.store.featureCount() <= MIN_FEATURE_COUNT :
    this.store.optionCountPerFeature() <= MIN_OPTION_COUNT);

  showMinus = () => this.shouldShowMinus.set(true);

  hideMinus = () => this.shouldShowMinus.set(false);

  /**
   * Renames the feature or option this header stands for, unless the name is unchanged.
   * @param event
   */
  updateHeader(event: Event) {
    this.hideMinus();

    const name = (event.target as HTMLInputElement).value;

    if (this.tile().entityId == undefined || name === this.tile().text) return;

    if (this.isFeature()) {
      this.store.updateFeature(this.tile().entityId as FeatureId, {name});
    } else {
      this.store.updateOption(this.tile().entityId as OptionId, {name});
    }
  }

  /**
   * Deletes the feature from state if this is a feature header
   * or the option at the current option's index from every feature if it is an option header
   */
  deleteHeader() {
    if (this.tile().entityId == undefined) return;

    if (this.isFeature()) {
      this.storeService.deleteFeature(this.tile().entityId as FeatureId);
    } else {
      this.storeService.deleteOption(this.tile().entityId as OptionId);
    }
  }
}
