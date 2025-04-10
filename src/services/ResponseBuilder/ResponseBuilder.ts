import dedent from "dedent";
import { ParseMode, User } from "grammy/types";

enum ActionTypes {
  DELETED = "deleted",
  EDITED = "edited"
}

export class ResponseBuilder {
  private static TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

  private static createMessage(
    from: User,
    messageContent: string,
    actionType: ActionTypes
  ): { text: string; parse_mode: ParseMode } {
    const message = messageContent;

    if (message.length > this.TELEGRAM_MAX_MESSAGE_LENGTH) {
      return {
        text: dedent`
          <b>User <a href="https://t.me/${from.username}">${from.first_name}</a> (<i>ID <code>${from.id}</code></i>) ${actionType} message:</b>\n
          <i>Message cannot be displayed, because it exceeds the limit of 4096 characters.</i>
        `,
        parse_mode: "HTML"
      }
    }

    return {
      text: message,
      parse_mode: "HTML"
    }
  }

  public static buildEditedMessageResponse(from: User, oldMessageText: string, newMessageText: string): { text: string; parse_mode: ParseMode } {
    const messageContent = dedent`
      <b>User <a href="https://t.me/${from.username}">${from.first_name}</a> (<i>ID <code>${from.id}</code></i>) edited message:</b>\n
      
      <b>Old message:</b>
      <blockquote expandable>${oldMessageText}</blockquote>

      <b>New message:</b>
      <blockquote expandable>${newMessageText}</blockquote>
    `;
    
    return this.createMessage(from, messageContent, ActionTypes.EDITED);
  }

  public static buildDeletedMessageResponse(from: User, messageText: string): { text: string; parse_mode: ParseMode } {
    const messageContent = dedent`
      <b>User <a href="https://t.me/${from.username}">${from.first_name}</a> (<i>ID <code>${from.id}</code></i>) deleted message:</b>\n
      <blockquote expandable>${messageText}</blockquote>
    `;

    return this.createMessage(from, messageContent, ActionTypes.DELETED);
  }
}