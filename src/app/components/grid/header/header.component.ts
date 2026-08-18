import {Component, computed, inject, input, signal} from '@angular/core';
import {StoreService} from '../../../store/store.service';
import {Tile, TileType} from '../../../types/tile.model';
import {GridStore} from '../../../store/store';
import {FeatureId, OptionId} from '../../../types/entities.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  store = inject(GridStore);
  storeService = inject(StoreService);

  tile = input.required<Tile>();

  shouldShowMinus = signal(false);

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
