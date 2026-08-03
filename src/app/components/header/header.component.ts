import {Component, computed, inject, input, model, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import {TileService} from '../../services/tile.service';
import {NgClass} from '@angular/common';
import {Tile, TileType} from '../../types/tile.model';
import {DataStore} from '../../services/data.store';
import {should} from 'vitest';
import {FeatureId, OptionId} from '../../types/entities.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [NgClass],
})
export class HeaderComponent {
  store = inject(DataStore);
  dataService = inject(DataService);

  tile2 = input.required<Tile>();

  shouldShowMinus2 = signal(false);

  isFeature2 = computed(() =>
    this.tile2().type === TileType.LEFT_FEATURE_HEADER || this.tile2().type === TileType.TOP_FEATURE_HEADER);
  isDeleteDisabled2 = computed(() => this.isFeature2() ? this.store.featureCount() <= 2 :
    this.store.optionCountPerFeature() <= 2);

  showMinus = () => this.shouldShowMinus2.set(true);

  hideMinus = () => this.shouldShowMinus2.set(false);

  updateHeader2(event: any) {
    this.hideMinus();
    const name = event?.target?.value;

    if (this.tile2().objectId2 == undefined || name === this.tile2().text) return;

    if (this.isFeature2()) {
      this.store.updateFeature(this.tile2().objectId2 as FeatureId, {name});
    } else {
      this.store.updateOption(this.tile2().objectId2 as OptionId, {name});
    }
  }

  deleteHeader2(){
    if(this.tile2().objectId2 == undefined) return;

    if(this.isFeature2()){
      this.dataService.deleteFeature2(this.tile2().objectId2 as FeatureId);
    } else {
      this.dataService.deleteOption2(this.tile2().objectId2 as OptionId);
    }
  }
}
