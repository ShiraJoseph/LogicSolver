import {Directive, inject} from '@angular/core';
import {GridStore} from '../store/store';
import {StoreService} from '../services/store.service';
import {ColorService} from '../services/color.service';

/** The shared grid services */
@Directive()
export abstract class BaseDirective {
  store = inject(GridStore);
  storeService = inject(StoreService);
  colorService = inject(ColorService);
}
