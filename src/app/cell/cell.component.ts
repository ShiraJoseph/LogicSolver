import { Component, OnInit, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {

  constructor(private vcRef: ViewContainerRef) {
  }

  ngOnInit() {
  }
}
