import {Component, computed, inject, input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from '../header/header.component';
import {Tile, TileType} from '../../../types/tile.model';
import {BaseDirective} from '../../../directives/base.directive';
import {FeatureId} from '../../../types/entities.model';
import {MIN_FEATURE_COUNT} from '../../../constants/grid.const';
import {MoveArgs, MoveFnEnum} from '../../../types/move.model';

/** A feature label on the top or left axis, and the values its header needs. */
@Component({
  selector: 'app-feature',
  imports: [HeaderComponent],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.css',
})
export class FeatureComponent extends BaseDirective {
  tile = input.required<Tile>();

  /** The header type string. */
  entityLabel = inject(TranslateService).translate('header.feature');

  /** The index of this feature in the feature list */
  featureIndex = computed(() => this.store.featureIndex(this.tile().entityId as FeatureId));

  /** Fill color based on feature index */
  backgroundColor = computed(() => this.colorService.getFeatureColor(this.featureIndex()));

  /** The label color, which contrasts the feature fill. */
  textColor = computed(() => this.colorService.getFeatureTextColor(this.featureIndex()));

  /** If this is the left axis feature header */
  isVertical = computed(() => this.tile().type === TileType.LEFT_FEATURE_HEADER);

  /** If deleting would leave fewer than two features */
  isDeleteDisabled = computed(() => this.store.featureCount() <= MIN_FEATURE_COUNT);

  /**
   * Writes the new feature name into state and returns the feature id for the move record.
   * @param newValue
   */
  updateFeature = (newValue: string) => {
    const featureId = this.tile().entityId as FeatureId;

    this.store.updateFeature(featureId, {name: newValue});

    return {featureId};
  };

  /**
   * Deletes the feature and returns it with its options and their cells.
   */
  deleteFeature = () =>
    this.storeService.deleteFeature(this.tile().entityId as FeatureId) as MoveArgs<MoveFnEnum.DELETE>;
}
