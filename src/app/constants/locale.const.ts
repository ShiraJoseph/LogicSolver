import {TranslationObject} from '@ngx-translate/core';
import EN_MESSAGES from '../../i18n/messages/en.json';

/** The fallback language for an unsupported browser locale */
export const DEFAULT_LOCALE = 'en';

/** The languages the app ships messages for, keyed by language code */
export const MESSAGES_BY_LOCALE: Record<string, TranslationObject> = {
  [DEFAULT_LOCALE]: EN_MESSAGES
};
