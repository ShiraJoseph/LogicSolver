import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Cell } from '../model';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {
  cellText = ' ';
  @Input() Option1;
  @Input() Option2;
  constructor(private dataService: DataService) {

  }

  ngOnInit() {

  }

  onClick(text) {
    this.cellText = text;
  }
}
