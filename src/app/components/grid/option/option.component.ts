import {Component, computed, inject, input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from '../header/header.component';
import {Tile, TileType} from '../../../types/tile.model';
import {BaseDirective} from '../../../directives/base.directive';
import {OptionId} from '../../../types/entities.model';
import {BLACK} from '../../../constants/colors.const';
import {MIN_OPTION_COUNT} from '../../../constants/grid.const';
import {MoveArgs, MoveFnEnum} from '../../../types/move.model';

/** An option label on the top or left axis, and the values its header needs. */
@Component({
  selector: 'app-option',
  imports: [HeaderComponent],
  templateUrl: './option.component.html',
  styleUrl: './option.component.css',
})
export class OptionComponent extends BaseDirective {
  tile = input.required<Tile>();

  /** Translations */
  lang = inject(TranslateService).translate('header');

  /** The header type string, opening with the option's feature name. */
  entityLabel = computed(() =>
    `${this.store.featureByOption(this.tile().entityId as OptionId)?.name ?? ''} ${this.lang().option}`.trim());

  /** Fill color based on the option's feature, paler while the option is hovered */
  backgroundColor = computed(() => this.colorService.getOptionColor(this.tile()));

  /** If this is the top axis option header */
  isVertical = computed(() => this.tile().type === TileType.TOP_OPTION_HEADER);

  /** If deleting would leave fewer than two options per feature */
  isDeleteDisabled = computed(() => this.store.optionCountPerFeature() <= MIN_OPTION_COUNT);

  protected readonly BLACK = BLACK;

  /**
   * Writes the new option name into state and returns the option id for the move record.
   * @param newValue
   */
  updateOption = (newValue: string) => {
    const optionId = this.tile().entityId as OptionId;

    this.store.updateOption(optionId, {name: newValue});

    return {optionId};
  };

  /**
   * Deletes the option from every feature and returns the removed options and cells.
   */
  deleteOption = () =>
    this.storeService.deleteOption(this.tile().entityId as OptionId) as MoveArgs<MoveFnEnum.DELETE>;
}
