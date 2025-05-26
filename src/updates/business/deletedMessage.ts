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

		if (businessConnectionId && ctx.chat && ctx.deletedBusinessMessages) {
			try {
				const { user_chat_id } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_ids } = ctx.deletedBusinessMessages;

				for (const messageId of message_ids) {
					const deletedMessage = await this.messagesCollection.getById(messageId);
					if (deletedMessage) {
						await this.messagesCollection.setAttribute(messageId, "isDeleted", true);
						await this.messagesCollection.setAttribute(messageId, "deletedAt", Date.now());

						await ctx.api.sendMessage(
							user_chat_id,
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
					await sleep(500);
				};
			} catch (error) {
				return;
			}
		}
  }
}