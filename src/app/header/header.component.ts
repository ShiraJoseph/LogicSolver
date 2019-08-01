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
  disableFeatureDelete = false;
  disableOptionDelete = false;

  getDisabledDelete() {
    return this.tile.type === TileType.LEFT_FEATURE_HEADER || this.tile.type === TileType.TOP_FEATURE_HEADER ?
      !this.dataService.getAllowDeleteFeatures() :
      !this.dataService.getAllowDeleteOptions();
  }

  constructor(private dataService: DataService, private tileService: TileService) {
  }

  ngOnInit() {
  }

  updateFeature(event, tile: Tile) {
    console.log(event.target.value);
    this.dataService.setFeature(tile.objectId, event.target.value);
    this.tileService.buildGrid();
    tile.shouldShowMinus = false;
  }

  updateOption(event, tile: Tile) {
    console.log(event.target.value);
    this.dataService.setOption(tile.objectId, event.target.value);
    this.tileService.buildGrid();
    tile.shouldShowMinus = false;
  }

  deleteFeature(tile: Tile) {
    this.dataService.deleteFeature(tile.objectId);
    if (this.dataService.features.length <= 2) {
      this.disableFeatureDelete = true;
    }
    this.tileService.buildGrid();
  }

  deleteOption(tile: Tile) {
    this.dataService.deleteOption(tile.objectId);
    if (this.dataService.optionCount <= 1) {
      this.disableOptionDelete = true;
    }
    this.tileService.buildGrid();
  }
}
