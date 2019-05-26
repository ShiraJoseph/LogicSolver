import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Cell } from '../model';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {
  cellText = '';
  index = 0;
  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.cells[this.index] = new Cell();
  }

  onClick(text) {
    this.cellText = text;
  }
}
