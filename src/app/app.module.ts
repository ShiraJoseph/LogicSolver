import { MatGridListModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CellComponent } from './cell/cell.component';
import { GridComponent } from './grid/grid.component';
import { FeatureGridComponent } from './feature-grid/feature-grid.component';
import { FeatureHeaderComponent } from './feature-header/feature-header.component';
import { OptionHeaderComponent } from './option-header/option-header.component';
import { PopoverDirective } from './popover.directive';

@NgModule({
  declarations: [
    AppComponent,
    CellComponent,
    GridComponent,
    FeatureGridComponent,
    FeatureHeaderComponent,
    OptionHeaderComponent,
    PopoverDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    MatGridListModule,
    // MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    // MatGridListModule
  ]
})
export class AppModule { }
