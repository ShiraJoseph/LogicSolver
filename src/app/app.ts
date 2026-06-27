import { Component, signal } from '@angular/core';
import { Grid } from './grid/grid';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [Grid],
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('temp-logic-solver');
}
