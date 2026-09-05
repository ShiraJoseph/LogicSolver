import {Component, viewChild} from '@angular/core';
import {GridComponent} from './grid/grid.component';
import {FooterComponent} from '../../components/footer/footer.component';
import {BaseDirective} from '../../directives/base.directive';

/** The page the puzzle sits on, holding the grid and the bar of buttons below it. */
@Component({
  selector: 'app-home',
  imports: [GridComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent extends BaseDirective {
  grid = viewChild.required(GridComponent);

  footer = viewChild.required(FooterComponent);

  /**
   * Sends Tab off a cell out of the grid and on to the buttons below it, letting go of the selected cell.
   * @param event
   */
  protected onTabOutOfGrid(event: Event) {
    if (!this.grid().isCell(event.target)) return;

    this.moveFocus(event, this.footer().firstButton());
    this.store.setSelectedCellId(undefined);
  }

  /**
   * Clears the selected cell when focus moves to an element outside the grid, so no cell keeps the selected
   * highlight while the grid does not have focus.
   * @param event
   */
  protected onFocusOutOfGrid(event: FocusEvent) {
    if (this.grid().contains(event.relatedTarget)) return;

    this.store.setSelectedCellId(undefined);
  }

  /**
   * Sends Shift Tab off the first button below the grid back into the cells.
   * @param event
   */
  protected onTabBackIntoGrid(event: Event) {
    if (event.target !== this.footer().firstButton()) return;

    this.moveFocus(event, this.grid().cellTabStop());
  }
}
