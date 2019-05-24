import { Injectable } from '@angular/core';
import { Cell } from './model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public cells: Cell[];

}
