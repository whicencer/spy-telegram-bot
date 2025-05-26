import { Context } from "grammy";
import { MarketApiClient } from "../services/MarketApiClient";

export async function listedGiftsHandler(ctx: Context, chatId: number) {
  if (chatId) {
    await ctx.editMessageText("🔍 Fetching gifts...");

    try {
      const marketApi = new MarketApiClient();
      const listedGifts = await marketApi.getUserListedGifts(chatId);
      
      if (listedGifts.length) {
        await ctx.editMessageText(
          `✅ User has ${listedGifts.length} listed gifts on Tonnel Market.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "👀 View", url: `https://t.me/tonnel_network_bot/gifts?startapp=profile_${chatId}` }],
                [{ text: "🎁 Buy and sell gifts", url: "https://t.me/tonnel_network_bot/gifts?startapp=ref_915471265" }]
              ]
            },
            parse_mode: "HTML"
          }
        );
      } else {
        await ctx.editMessageText(
          "😕 <i>User has no listed gifts on Tonnel.</i>",
          { parse_mode: "HTML" }
        );
      }
    } catch (error) {
      console.error("Error fetching listed gifts:", error);
    }
  }
}