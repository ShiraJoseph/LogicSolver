import {Component, computed, input, signal} from '@angular/core';
import {Tile, TileType} from '../../../types/tile.model';
import {FeatureId, OptionId} from '../../../types/entities.model';
import {BaseDirective} from '../../../directives/base.directive';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent extends BaseDirective {

  tile = input.required<Tile>();

  shouldShowMinus = signal(false);

  featurePosition = computed(() => this.store.featurePositions().get(this.tile().entityId as FeatureId));
  backgroundColor = computed(() => this.isFeature() ?
    this.colorService.getFeatureColor(this.featurePosition()) :
    this.colorService.getOptionColor(this.tile()));
  textColor = computed(() => this.isFeature() ? this.colorService.getFeatureTextColor(this.featurePosition()) : undefined);
  isFeature = computed(() => [TileType.LEFT_FEATURE_HEADER, TileType.TOP_FEATURE_HEADER].includes(this.tile().type!));
  isVertical = computed(() => [TileType.TOP_OPTION_HEADER, TileType.LEFT_FEATURE_HEADER].includes(this.tile().type!));
  isDeleteDisabled = computed(() => this.isFeature() ? this.store.featureCount() <= 2 :
    this.store.optionCountPerFeature() <= 2);

  showMinus = () => this.shouldShowMinus.set(true);

  hideMinus = () => this.shouldShowMinus.set(false);

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

  deleteHeader() {
    if (this.tile().entityId == undefined) return;

    if (this.isFeature()) {
      this.storeService.deleteFeature(this.tile().entityId as FeatureId);
    } else {
      this.storeService.deleteOption(this.tile().entityId as OptionId);
    }
  }
}
