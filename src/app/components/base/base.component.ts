import {Component, inject} from '@angular/core';
import {GridStore} from '../../store/store';
import {StoreService} from '../../store/store.service';
import {ColorService} from '../../services/color.service';

@Component({
  selector: 'app-base',
  imports: [],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css',
})
export abstract class BaseComponent {
  store = inject(GridStore);
  storeService = inject(StoreService);
  colorService = inject(ColorService);
}
