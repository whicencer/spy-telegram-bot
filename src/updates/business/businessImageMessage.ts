import { Context, FilterQuery } from "grammy";
import { IUpdateHandler } from "../handler";
import { UserRepository } from "../../database/User";
import { MessagesRepository } from "../../database/Messages";

export class BusinessImageMessageHandler implements IUpdateHandler {
  private usersCollection = new UserRepository();
  private messagesCollection = new MessagesRepository();

  public updateName: FilterQuery = "business_message:media";

  public async run(ctx: Context) {
    const { user_chat_id } = await ctx.getBusinessConnection();

    if (ctx.businessMessage?.photo) {
      const { file_id } = ctx.businessMessage.photo[0];
      try {
        await this.usersCollection.setAttribute(user_chat_id, "lastReceiveMessageAt", Date.now());

        if (ctx.businessMessage && ctx.from) {
          await this.messagesCollection.create({
            messageId: ctx.businessMessage.message_id,
            userId: user_chat_id,
            text: ctx.businessMessage.caption || "",
            media: file_id,
            senderId: ctx.from.id,
            senderName: ctx.from.first_name,
            senderUsername: ctx.from.username,
          });
        }
      } catch (error) {
        console.error("Error in BusinessImageMessageHandler:", error);
      }
    }
  }
}