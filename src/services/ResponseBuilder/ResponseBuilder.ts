import dedent from "dedent";
import { ParseMode, User } from "grammy/types";

export class ResponseBuilder {
  private static TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

  public static buildEditedMessageResponse(from: User, oldMessageText: string, newMessageText: string): { text: string; parse_mode: ParseMode } {
    const message = dedent`
      <b>User <a href="https://t.me/${from.username}">${from.first_name}</a> (<i>ID <code>${from.id}</code></i>) edited message:</b>\n
      
      <b>Old message:</b>
      <blockquote expandable>${oldMessageText}</blockquote>

      <b>New message:</b>
      <blockquote expandable>${newMessageText}</blockquote>
    `;
    if (message.length > this.TELEGRAM_MAX_MESSAGE_LENGTH) {
      return {
        text: dedent`
          <b>User <a href="https://t.me/${from.username}">${from.first_name}</a>(<i>ID <code>${from.id}</code></i>) edited message:</b>\n
          <i>Message cannot be displayed, because it exceeds the limit of 4096 characters.</i>
        `,
        parse_mode: "HTML",
      };
    }

    return {
      text: message,
      parse_mode: "HTML",
    };
  }
}