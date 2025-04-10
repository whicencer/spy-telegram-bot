import dedent from "dedent";
import { Chat, ParseMode, User } from "grammy/types";
import { getTranslation } from "../../utils/getTranslation";
import { LanguageTranslationKeys } from "../../types/Language";

interface MessageResponse {
  text: string;
  parse_mode: ParseMode;
}

export class ResponseBuilder {
  private static TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

  private static async buildResponse(
    translationKey: LanguageTranslationKeys,
    translationParams: Record<string, any>,
    fallbackKey: LanguageTranslationKeys,
    fallbackParams: Record<string, any>,
    userId: number
  ): Promise<MessageResponse> {
    const messageContent = await getTranslation(
      translationKey,
      translationParams,
      userId
    );

    if (messageContent.length > this.TELEGRAM_MAX_MESSAGE_LENGTH) {
      return {
        text: await getTranslation(
          fallbackKey,
          fallbackParams,
          userId
        ),
        parse_mode: "HTML"
      }
    }

    return {
      text: messageContent,
      parse_mode: "HTML"
    }
  }

  public static async buildEditedMessageResponse(from: User, oldMessageText: string, newMessageText: string, userId: number): Promise<MessageResponse> {
    return this.buildResponse(
      LanguageTranslationKeys.message_edited_notification,
      {
        username: from.username,
        firstName: from.first_name,
        fromId: from.id,
        oldMessageText,
        newMessageText
      },
      LanguageTranslationKeys.message_edited_notification_wrong_length,
      {
        username: from.username,
        firstName: from.first_name,
        fromId: from.id
      },
      userId
    );
  }

  public static async buildDeletedMessageResponse(chat: Chat, messageText: string, userId: number): Promise<MessageResponse> {
    return this.buildResponse(
      LanguageTranslationKeys.message_deleted_notification,
      {
        chatTitle: chat.title,
        chatId: chat.id,
        messageText
      },
      LanguageTranslationKeys.message_deleted_notification_wrong_length,
      {
        chatTitle: chat.title,
        chatId: chat.id
      },
      userId
    );
  }
}