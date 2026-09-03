import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';

/** The application shell, which hosts the routed page. */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly title = signal('LogicSolver');
}
