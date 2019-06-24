import { Injectable, OnInit } from '@angular/core';
import { Cell, Feature } from './model';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {
  cells: Cell[] = [];
  features: Feature[];

  ngOnInit(){

  }

  updateCells(){

  }

  addFeature(){

  }
}
