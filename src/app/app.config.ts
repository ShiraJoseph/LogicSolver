import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), MatGridListModule],
};
