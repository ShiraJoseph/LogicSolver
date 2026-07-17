import {Component, computed, inject, input, model, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import {TileService} from '../../services/tile.service';
import {NgClass} from '@angular/common';
import {Tile, TileType} from '../../services/tile.model';
import {DataStore} from '../../services/data.store';
import {should} from 'vitest';
import {FeatureId, OptionId} from '../../services/entities.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [NgClass],
})
export class Header implements OnInit {
  tile = model<Tile>();
  tile2 = input.required<Tile>();
  store = inject(DataStore);
  dataService = inject(DataService);
  tileService = inject(TileService);
  isFeatureHeader = true;
  shouldShowMinus2 = signal(false);
  isFeature2 = computed(
    () => this.tile2().type === TileType.LEFT_FEATURE_HEADER || this.tile2().type === TileType.TOP_FEATURE_HEADER);
  showMinus = () => this.shouldShowMinus2.set(true);
  hideMinus = () => this.shouldShowMinus2.set(false);

  ngOnInit() {
    this.isFeatureHeader =
      this.tile()?.type === TileType.TOP_FEATURE_HEADER ||
      this.tile()?.type === TileType.LEFT_FEATURE_HEADER;
  }

  isDeleteDisabled2 = computed(() => this.isFeature2() ? !this.dataService.getIsDeleteFeatureAllowed2() :
    !this.dataService.getIsDeleteOptionAllowed2());

  getDisabledDelete() {
    return this.isFeatureHeader
      ? !this.dataService.getIsDeleteFeatureAllowed()
      : !this.dataService.getIsDeleteOptionAllowed();
  }

  updateHeader2(event: any) {
    if (this.tile2().objectId2 == undefined) return;

    if (this.isFeature2()) {
      this.store.updateFeature(this.tile2().objectId2 as FeatureId, {name: event?.target?.value});
    } else {
      this.store.updateOption(this.tile2().objectId2 as OptionId, {name: event.target.value});
    }

    this.hideMinus();
  }
  updateHeader(event: any) {
    if (this.isFeatureHeader && this.tile()?.objectId != undefined) {
      this.dataService.setFeature(this.tile()?.objectId as number, event.target.value);

    } else if (this.tile()?.objectId != undefined) {
      this.dataService.setOption(this.tile()?.objectId as number, event.target.value);
    }

    this.tileService.buildGrid();
    this.tile.update(tile => {
      if (tile) {
        tile.shouldShowMinus = false;
      }
      return tile;
    });
  }

  deleteHeader2(){
    if(this.tile2().objectId2 == undefined) return;

    if(this.isFeature2()){
      this.dataService.deleteFeature2(this.tile2().objectId2 as FeatureId);
    } else {
      this.dataService.deleteOption2(this.tile2().objectId2 as OptionId);
    }
  }
  deleteHeader() {
    if (this.isFeatureHeader && this.tile()?.objectId != undefined) {
      this.dataService.deleteFeature(this.tile()?.objectId as number);
    } else if (this.tile()?.objectId != undefined) {
      this.dataService.deleteOption(this.tile()?.objectId as number);
    }

    this.tileService.buildGrid();
  }

  moveNext(event: any) {
    let nextElement = event;

    while (nextElement.tag !== 'app-header') {
      nextElement = event.target.nextSibling;
    }
  }
}
