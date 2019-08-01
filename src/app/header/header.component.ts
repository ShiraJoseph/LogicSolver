import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Tile, TileService, TileType } from '../tile.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() tile: Tile;
  isFeatureHeader = true;
  disableFeatureDelete = false;
  disableOptionDelete = false;

  constructor(private dataService: DataService, private tileService: TileService) {
  }

  ngOnInit() {
    this.isFeatureHeader = this.tile.type === TileType.TOP_FEATURE_HEADER || this.tile.type === TileType.LEFT_FEATURE_HEADER;
  }

  getDisabledDelete() {
    return this.isFeatureHeader ? !this.dataService.getAllowDeleteFeatures() : !this.dataService.getAllowDeleteOptions();
  }

  updateHeader(event) {
    if (this.isFeatureHeader) {
      this.dataService.setFeature(this.tile.objectId, event.target.value);
    } else {
      this.dataService.setOption(this.tile.objectId, event.target.value);
    }
    this.tileService.buildGrid();
    this.tile.shouldShowMinus = false;
  }

  // updateFeature(event) {
  //   console.log(event.target.value);
  //   this.dataService.setFeature(this.tile.objectId, event.target.value);
  //   this.tileService.buildGrid();
  //   this.tile.shouldShowMinus = false;
  // }
  //
  // updateOption(event, tile: Tile) {
  //   console.log(event.target.value);
  //   this.dataService.setOption(tile.objectId, event.target.value);
  //   this.tileService.buildGrid();
  //   tile.shouldShowMinus = false;
  // }

  deleteHeader() {
    if (this.isFeatureHeader) {
      this.dataService.deleteFeature(this.tile.objectId);
      this.disableFeatureDelete = this.dataService.features.length < 3;
    } else {
      this.dataService.deleteOption(this.tile.objectId);
      this.disableOptionDelete = this.dataService.optionCount < 2;
    }
    this.tileService.buildGrid();
  }

  // deleteOption(tile: Tile) {
  //   this.dataService.deleteOption(tile.objectId);
  //   if (this.dataService.optionCount <= 1) {
  //     this.disableOptionDelete = true;
  //   }
  //   this.tileService.buildGrid();
  // }
}
