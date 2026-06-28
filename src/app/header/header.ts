import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Tile, TileService, TileType } from '../../services/tile.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [NgClass],
})
export class Header implements OnInit {
  @Input() tile!: Tile;

  isFeatureHeader = true;

  constructor(
    private dataService: DataService,
    private tileService: TileService,
  ) {}

  ngOnInit() {
    this.isFeatureHeader =
      this.tile.type === TileType.TOP_FEATURE_HEADER ||
      this.tile.type === TileType.LEFT_FEATURE_HEADER;
  }

  getDisabledDelete() {
    return this.isFeatureHeader
      ? !this.dataService.getAllowDeleteFeatures()
      : !this.dataService.getAllowDeleteOptions();
  }

  updateHeader(event: any) {
    if (this.isFeatureHeader && this.tile.objectId != undefined) {
      this.dataService.setFeature(this.tile.objectId, event.target.value);
    } else if (this.tile.objectId != undefined) {
      this.dataService.setOption(this.tile.objectId, event.target.value);
    }

    this.tileService.buildGrid();
    this.tile.shouldShowMinus = false;
  }

  deleteHeader() {
    if (this.isFeatureHeader && this.tile.objectId != undefined) {
      this.dataService.deleteFeature(this.tile.objectId);
    } else if (this.tile.objectId != undefined) {
      this.dataService.deleteOption(this.tile.objectId);
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
