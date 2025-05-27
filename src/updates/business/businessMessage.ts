import { Context, FilterQuery, Middleware } from "grammy";
import { IUpdateHandler } from "../handler";
import { IMessagesRepository, MessagesRepository } from "../../database/Messages";
import { IUserRepository, UserRepository } from "../../database/User";
import { userCommandsHandler } from "../../commands/handler";

export class BusinessMessageHandler implements IUpdateHandler {
  private usersCollection: IUserRepository = new UserRepository();
  private messagesCollection: IMessagesRepository = new MessagesRepository();

  public updateName: FilterQuery = "business_message:text";

  public middlewares?: Middleware<Context>[] = [userCommandsHandler];

  public async run(ctx: Context): Promise<void> {
    const { user_chat_id } = await ctx.getBusinessConnection();
		const businessConnectionId = ctx.businessMessage?.business_connection_id;
		
		if (businessConnectionId) {
			try {
				await this.usersCollection.setAttribute(user_chat_id, "lastReceiveMessageAt", Date.now());
				if (ctx.businessMessage && ctx.from && ctx.businessMessage.text) {
					const { text, message_id } = ctx.businessMessage;
					await this.messagesCollection.create({
						messageId: message_id,
						userId: user_chat_id,
						text,
						senderId: ctx.from.id,
						senderName: ctx.from.first_name,
						senderUsername: ctx.from.username,
					});
				}
			} catch (error: any) {
				return;
			}
		}
  }
}