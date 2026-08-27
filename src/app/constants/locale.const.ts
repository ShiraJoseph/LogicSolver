import {TranslationObject} from '@ngx-translate/core';
import EN_MESSAGES from '../../i18n/messages/en.json';

/** The language the app reads in when the browser asks for one it has no messages for. */
export const DEFAULT_LOCALE = 'en';

/** Every language the app ships messages for, keyed by language code. */
export const MESSAGES_BY_LOCALE: Record<string, TranslationObject> = {
  [DEFAULT_LOCALE]: EN_MESSAGES
};
