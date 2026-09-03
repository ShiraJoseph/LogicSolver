import {Directive, inject} from '@angular/core';
import {GridStore} from '../store/store';
import {StoreService} from '../services/store.service';
import {ColorService} from '../services/color.service';

/** The shared grid services, and the focus move every grid component makes. */
@Directive()
export abstract class BaseDirective {
  store = inject(GridStore);
  storeService = inject(StoreService);
  colorService = inject(ColorService);

  /**
   * Puts the keyboard on the element and holds the browser's own Tab, leaving it alone when there is no element
   * to move to.
   * @param event
   * @param element
   */
  protected moveFocus(event: Event, element?: HTMLElement | null) {
    if (!element) return;

    event.preventDefault();
    element.focus();
  }
}
