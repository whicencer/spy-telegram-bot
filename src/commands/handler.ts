import { Context } from "grammy";
import { listedGiftsHandler } from "./listedGifts";

export async function userCommandsHandler(ctx: Context, next: () => void) {
  const { user_chat_id } = await ctx.getBusinessConnection();
  const businessMessage = ctx.businessMessage;

  if (businessMessage?.from?.id === user_chat_id) {
    const command = businessMessage.text?.split(" ")[0].toLowerCase();

    switch (command) {
      case ".listed_gifts":
        await listedGiftsHandler(ctx, businessMessage.chat.id);
        break;
      default:
        return;
    }
  } else {
    next();
  }
}