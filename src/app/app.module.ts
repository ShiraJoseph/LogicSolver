import { MatGridListModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CellComponent } from './cell/cell.component';
import { DataService } from './data.service';
import { GridComponent } from './grid/grid.component';
import { PopoverDirective } from './popover.directive';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    CellComponent,
    GridComponent,
    PopoverDirective,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    MatGridListModule,
    // MatGridListModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent],
  exports: [
    // MatGridListModule
  ]
})
export class AppModule { }
