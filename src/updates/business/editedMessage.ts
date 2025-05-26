import { Context, FilterQuery } from "grammy";
import { IUpdateHandler } from "../handler";
import { MessagesRepository } from "../../database/Messages";
import dedent from "dedent";

export class EditedBusinessMessageHandler implements IUpdateHandler {
  private messagesCollection = new MessagesRepository();
  public updateName: FilterQuery = "edited_business_message";

  public async run(ctx: Context) {
    const businessConnectionId = ctx.editedBusinessMessage?.business_connection_id;
		
		try {
			if (businessConnectionId && ctx.editedBusinessMessage && ctx.from) {
				const { user_chat_id: receiverId } = await ctx.api.getBusinessConnection(businessConnectionId);
				const { message_id, text: newMessageText, from } = ctx.editedBusinessMessage;

				if (from?.id === receiverId) return;
				
				const oldMessage = await this.messagesCollection.getById(message_id);
			
				if (newMessageText && oldMessage) {
					await this.messagesCollection.messageEdited(
						message_id,
						oldMessage.text,
						newMessageText
					);

					await ctx.api.sendMessage(
						receiverId,
						dedent`
							User <a href="t.me/${ctx.from.username || "whocencer"}"><b>${ctx.from.first_name}</b></a> <code>(${ctx.from.id})</code> edited a message:

							<i>Old message:</i>
							<blockquote>${oldMessage.text}</blockquote>
							
							<i>New message:</i>
							<blockquote>${newMessageText}</blockquote>
						`,
						{
							parse_mode: "HTML",
							link_preview_options: { is_disabled: true }
						}
					);
				}
			}
		} catch (error) {
			console.error("Error in businessEditedMessageHandler:", error);
		}
  };
}