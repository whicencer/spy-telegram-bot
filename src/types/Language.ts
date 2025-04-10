export type Translations = Record<LanguageCodes | string, Record<LanguageTranslationKeys, string>>;

export enum LanguageCodes {
  en = "en",
  ru = "ru",
  ua = "ua"
}

export enum LanguageTranslationKeys {
  start_message = "start_message",
  message_deleted_notification = "message_deleted_notification",
  message_deleted_notification_wrong_length = "message_deleted_notification_wrong_length",
  message_edited_notification = "message_edited_notification",
  message_edited_notification_wrong_length = "message_edited_notification_wrong_length",
}

export enum LanguageTranslationKeysVariables {
  USERNAME = "username",
  FIRST_NAME = "firstName",
  FROM_ID = "fromId",
  MESSAGE_TEXT = "messageText",
  OLD_MESSAGE_TEXT = "oldMessageText",
}

export const TranslationVariablesRequired: Record<LanguageTranslationKeys, LanguageTranslationKeysVariables[]> = {
  [LanguageTranslationKeys.start_message]: [LanguageTranslationKeysVariables.FIRST_NAME],
  [LanguageTranslationKeys.message_deleted_notification]: [
    LanguageTranslationKeysVariables.USERNAME,
    LanguageTranslationKeysVariables.FIRST_NAME,
    LanguageTranslationKeysVariables.FROM_ID,
    LanguageTranslationKeysVariables.MESSAGE_TEXT,
  ],
  [LanguageTranslationKeys.message_deleted_notification_wrong_length]: [
    LanguageTranslationKeysVariables.USERNAME,
    LanguageTranslationKeysVariables.FIRST_NAME,
    LanguageTranslationKeysVariables.FROM_ID
  ],
  [LanguageTranslationKeys.message_edited_notification]: [
    LanguageTranslationKeysVariables.USERNAME,
    LanguageTranslationKeysVariables.FIRST_NAME,
    LanguageTranslationKeysVariables.FROM_ID,
    LanguageTranslationKeysVariables.OLD_MESSAGE_TEXT,
    LanguageTranslationKeysVariables.MESSAGE_TEXT,
  ],
  [LanguageTranslationKeys.message_edited_notification_wrong_length]: [
    LanguageTranslationKeysVariables.USERNAME,
    LanguageTranslationKeysVariables.FIRST_NAME,
    LanguageTranslationKeysVariables.FROM_ID
  ],
}