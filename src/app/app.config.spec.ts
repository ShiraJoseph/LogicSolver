import {TranslateService} from '@ngx-translate/core';

import {getBrowserLocale} from './app.config';
import {DEFAULT_LOCALE} from './constants/locale.const';

describe('getBrowserLocale', () => {
  const setBrowserLang = (language: string | undefined) =>
    vi.spyOn(TranslateService, 'getBrowserLang').mockReturnValue(language);

  it('should read in the browser language the app ships messages for', () => {
    setBrowserLang('en');

    expect(getBrowserLocale()).toBe('en');
  });

  it('should fall back for a browser language the app has no messages for', () => {
    setBrowserLang('de');

    expect(getBrowserLocale()).toBe(DEFAULT_LOCALE);
  });

  it('should fall back when the browser names no language at all', () => {
    setBrowserLang(undefined);

    expect(getBrowserLocale()).toBe(DEFAULT_LOCALE);
  });
});
