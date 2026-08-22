import {Component, signal} from '@angular/core';
import {GridComponent} from './components/grid/grid.component';

/** The application shell, which hosts the grid. */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [GridComponent],
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly title = signal('LogicSolver');
}
