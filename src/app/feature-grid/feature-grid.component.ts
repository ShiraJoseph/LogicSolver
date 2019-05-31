import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core/src/metadata/directives';
import { forEach } from '@angular/router/src/utils/collection';
import { DataService } from '../data.service';
import { Cell } from '../model';

@Component({
  selector: 'app-feature-grid',
  templateUrl: './feature-grid.component.html',
  styleUrls: ['./feature-grid.component.css']
})
export class FeatureGridComponent implements OnInit {
  cells = [];

  constructor() { }

  ngOnInit() {
    const size = 5;
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push(`${i}.${j}`);
      }
      this.cells.push(row);
    }
  }

}
