import {Directive, inject} from '@angular/core';
import {GridStore} from '../store/store';
import {StoreService} from '../store/store.service';
import {ColorService} from '../services/color.service';

/** The services every grid component reads from. */
@Directive()
export abstract class BaseDirective {
  store = inject(GridStore);

  storeService = inject(StoreService);

  colorService = inject(ColorService);
}
