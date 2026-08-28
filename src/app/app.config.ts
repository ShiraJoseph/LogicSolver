import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideTranslateService, TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {GRID_SEED} from './store/grid.token';
import {environment} from '../environments/environment';
import {DEFAULT_LOCALE, MESSAGES_BY_LOCALE} from './constants/locale.const';

/** The browser's language when the app ships messages for it, and English otherwise. */
export const getBrowserLocale = () => {
  const language = TranslateService.getBrowserLang();

  return language && language in MESSAGES_BY_LOCALE ? language : DEFAULT_LOCALE;
};

/** Serves the bundled messages, in the browser's language wherever there are any. */
export const TRANSLATION_PROVIDERS = provideTranslateService({
  lang: getBrowserLocale(),
  fallbackLang: DEFAULT_LOCALE,
  loader: () => ({getTranslation: (locale: string) => of(MESSAGES_BY_LOCALE[locale])}),
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    TRANSLATION_PROVIDERS,
    {provide: GRID_SEED, useValue: environment.gridSeed},
  ],
};
