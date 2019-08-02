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

  deleteHeader() {
    if (this.isFeatureHeader) {
      this.dataService.deleteFeature(this.tile.objectId);
    } else {
      this.dataService.deleteOption(this.tile.objectId);
    }
    this.tileService.buildGrid();
  }
}
