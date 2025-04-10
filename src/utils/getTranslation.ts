import fs from "fs";
import YAML from "yaml";
import { LanguageCodes, LanguageTranslationKeys, LanguageTranslationKeysVariables, Translations, TranslationVariablesRequired } from "../types/Language";
import { UserRepository } from "../../database/User";
import { isLanguageCode } from "./isLanguageCode";

const file = fs.readFileSync(__dirname + "/../../config/translations.yml", "utf8");
const parsed: Translations = YAML.parse(file);

export async function getTranslation(
  key: LanguageTranslationKeys,
  variablesValues: Partial<Record<LanguageTranslationKeysVariables, any>> = {},
  userId?: number,
  languageCode: LanguageCodes | number = LanguageCodes.en
): Promise<string> {

  if (userId) {
    const userCollection = new UserRepository();
    const { languageCode: userLanguageCode } = await userCollection.getUserById(userId);
    if (isLanguageCode(userLanguageCode)) {
      languageCode = userLanguageCode;
    }
  }

  TranslationVariablesRequired[key].forEach((variable) => {
    if (!variablesValues[variable]) {
      throw new Error(`Missing required variable: ${variable} for translation key: ${key}`);
    }
  });

  let translation = parsed[languageCode][key];
  const matchedVariables = translation.match(/{{(.*?)}}/g);
  if (matchedVariables) {
    matchedVariables.forEach((variable) => {
      const variableName = variable.replace(/{{|}}/g, "").trim();
      if (variablesValues[variableName as LanguageTranslationKeysVariables]) {
        translation = translation.replace(variable, variablesValues[variableName as LanguageTranslationKeysVariables]);
      }
    });
  }

  return translation || "Translation not found";
}