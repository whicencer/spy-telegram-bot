import { Context, FilterQuery } from "grammy";
import { IUpdateHandler } from "../handler";

export class BusinessConnectionHandler implements IUpdateHandler {
  public updateName: FilterQuery = "business_connection:is_enabled";

  public async run(ctx: Context) {
    const businessConnectionId = ctx.businessConnection?.id;
    
    if (ctx.businessConnection) {
      try {
        await ctx.api.sendMessage(
          ctx.businessConnection.user_chat_id,
          `🥳 Your business connection with ID <code>${businessConnectionId}</code> has been established successfully.`,
          { parse_mode: "HTML" }
        );
      } catch (error) {
        console.error("Error in businessConnectionHandler:", error);
      }
    }
  }
}