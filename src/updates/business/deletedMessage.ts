import { Context, FilterQuery } from "grammy";
import { IUpdateHandler } from "../handler";
import { MessagesRepository } from "../../database/Messages";
import dedent from "dedent";
import { sleep } from "../../utils/sleep";

export class DeletedBusinessMessageHandler implements IUpdateHandler {
  private messagesCollection = new MessagesRepository();
  public updateName: FilterQuery = "deleted_business_messages";

  public async run(ctx: Context) {
    const businessConnectionId = ctx.deletedBusinessMessages?.business_connection_id;

		if (businessConnectionId) {
			try {
				const { user_chat_id } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_ids } = ctx.deletedBusinessMessages;

				for (const messageId of message_ids) {
					await this.processDeletedMessage(ctx, messageId, user_chat_id);
					await sleep(500);
				};
			} catch (error) {
				console.error("Error in DeletedBusinessMessageHandler:", error);
			}
		}
  }

	private async processDeletedMessage(
    ctx: Context, 
    messageId: number, 
    userChatId: number, 
  ): Promise<void> {
    try {
      const deletedMessage = await this.messagesCollection.getById(messageId);
      
      if (!deletedMessage || !ctx.chat) {
        return;
      }

      await this.messagesCollection.setAttribute(messageId, "isDeleted", true);
			await this.messagesCollection.setAttribute(messageId, "deletedAt", Date.now());
      
      if (deletedMessage.media) {
				await ctx.api.sendPhoto(
					userChatId,
					deletedMessage.media,
					{
						caption: dedent`
							User <a href="t.me/${ctx.chat.username || "whocencer"}"><b>${ctx.chat.first_name}</b></a> <i>(${ctx.chat.id})</i> deleted a message with media:
							\n<blockquote>${deletedMessage.text}</blockquote>
						`,
						parse_mode: "HTML"
					}
				);
			} else {
				await ctx.api.sendMessage(
					userChatId,
					dedent`
						User <a href="t.me/${ctx.chat.username || "whocencer"}"><b>${ctx.chat.first_name}</b></a> <i>(${ctx.chat.id})</i> deleted a message:
						\n<blockquote>${deletedMessage.text || "No text found."}</blockquote>
					`,
					{
						parse_mode: "HTML",
						link_preview_options: { is_disabled: true }
					}
				);
			}
    } catch (error) {
      console.error(`Error processing message ${messageId}: ${error instanceof Error ? error.message : error}`);
    }
  }
}